
import logging
import json
import requests
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwcrypto import jwk
from jwcrypto.jwt import JWT
from jwcrypto.common import base64url_decode
import time
from ..config import settings

# Configure logger
logger = logging.getLogger(__name__)

security = HTTPBearer()

# Cache for JWKS to avoid fetching on every request
_jwks_cache = {}
_jwks_cache_time = {}

def _get_jwks():
    """Fetch JWKS from Better Auth endpoint"""
    cache_duration = 3600  # 1 hour cache
    current_time = time.time()

    # Check if we have a cached version that's still valid
    if 'jwks' in _jwks_cache and (current_time - _jwks_cache_time.get('jwks', 0)) < cache_duration:
        return _jwks_cache['jwks']

    try:
        # Fetch JWKS from Better Auth endpoint
        jwks_url = f"{settings.BASE_URL.rstrip('/')}/api/auth/jwks"
        response = requests.get(jwks_url, timeout=10)

        if response.status_code != 200:
            logger.error(f"Failed to fetch JWKS: {response.status_code}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch authentication keys",
            )

        jwks_data = response.json()

        # Cache the JWKS
        _jwks_cache['jwks'] = jwks_data
        _jwks_cache_time['jwks'] = current_time

        return jwks_data
    except Exception as e:
        logger.error(f"Error fetching JWKS: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch authentication keys",
        )

def _get_kid_from_token_header(token):
    """Extract kid (Key ID) from JWT header"""
    try:
        header = token.split('.')[0]
        header_json = base64url_decode(header)
        header_dict = json.loads(header_json)
        return header_dict.get('kid')
    except Exception as e:
        logger.error(f"Error extracting kid from token header: {str(e)}")
        return None

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials

    # Validate token format
    if not token or not isinstance(token, str) or len(token.strip()) == 0:
        logger.warning("Empty or invalid token provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token is required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        # Get JWKS from Better Auth
        jwks_data = _get_jwks()

        # Extract kid from token header to identify the correct key
        kid = _get_kid_from_token_header(token)

        # Find the correct key in JWKS
        key_to_use = None
        for key in jwks_data.get('keys', []):
            if key.get('kid') == kid:
                key_to_use = key
                break

        if not key_to_use:
            # If specific key not found, try with the first available key
            if jwks_data.get('keys'):
                key_to_use = jwks_data['keys'][0]
            else:
                logger.warning("No keys found in JWKS")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="No valid keys found for token verification",
                    headers={"WWW-Authenticate": "Bearer"},
                )

        # Create JWK from the key data
        try:
            signing_key = jwk.JWK(**key_to_use)
        except Exception as e:
            logger.error(f"Error creating signing key: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid signing key",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Verify the JWT token
        try:
            jwt_token = JWT(jwt=token, key=signing_key)
            payload_str = jwt_token.claims
            payload = json.loads(payload_str)

            # Validate required claims
            required_claims = ['exp', 'sub', 'iss', 'aud']
            for claim in required_claims:
                if claim not in payload:
                    logger.warning(f"Missing required claim: {claim}")
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail=f"Missing required claim: {claim}",
                        headers={"WWW-Authenticate": "Bearer"},
                    )

            # Validate expiration
            exp = payload.get('exp')
            if exp and exp < time.time():
                logger.warning("Token has expired")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has expired",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            # Validate issuer
            iss = payload.get('iss')
            expected_issuer = settings.BASE_URL
            if iss != expected_issuer:
                logger.warning(f"Issuer mismatch: got {iss}, expected {expected_issuer}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token issuer",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            # Validate audience
            aud = payload.get('aud')
            expected_audience = settings.BASE_URL
            if aud != expected_audience:
                logger.warning(f"Audience mismatch: got {aud}, expected {expected_audience}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token audience",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            # Better Auth JWTs usually include 'sub' as the user ID.
            # We verify that 'sub' exists and is valid.
            user_id = payload.get("sub")
            if not user_id:
                logger.warning("Invalid token payload: missing sub claim in token")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token payload: missing sub",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            # Additional validation: ensure the sub is a string
            if not isinstance(user_id, (str, int)):
                logger.warning(f"Invalid user ID type in token: {type(user_id)}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token payload: invalid user ID",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            logger.info(f"Successfully decoded token for user: {user_id}")
            return payload

        except Exception as e:
            logger.warning(f"Token verification failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token signature",
                headers={"WWW-Authenticate": "Bearer"},
            )

    except HTTPException:
        # Re-raise HTTP exceptions as they are
        raise
    except Exception as e:
        logger.error(f"Unexpected error during token verification: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
