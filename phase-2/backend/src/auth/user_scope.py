
from fastapi import Depends, HTTPException, status
from typing import Annotated
from .jwt import verify_token
import logging

# Configure logger
logger = logging.getLogger(__name__)

def validate_user_scope(
    user_id: str,
    token_payload: Annotated[dict, Depends(verify_token)]
) -> str:
    """
    Validates that the authenticated user (from JWT) matches the path parameter user_id.
    Returns the user_id if valid.
    """
    jwt_user_id = token_payload.get("sub")

    if not jwt_user_id:
        logger.warning(f"No user ID found in JWT token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing user ID"
        )

    # Ensure both user_id and jwt_user_id are strings for comparison
    jwt_user_id_str = str(jwt_user_id)
    user_id_str = str(user_id)

    if jwt_user_id_str != user_id_str:
        logger.warning(f"User ID mismatch: JWT={jwt_user_id_str}, Path={user_id_str}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You can only access your own resources"
        )

    logger.info(f"Successfully validated user scope for user: {jwt_user_id_str}")
    return jwt_user_id_str
