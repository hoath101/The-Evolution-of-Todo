/**
 * JWT Utilities for secure token handling
 * These utilities treat JWTs as opaque strings as required by the specification
 */

export class JWTUtils {
  /**
   * Checks if a JWT token is expired without decoding it
   * @param token The JWT token to check
   * @returns True if the token is expired, false otherwise
   */
  static isTokenExpired(token: string): boolean {
    try {
      // Handle potential "Bearer " prefix
      const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;

      // Decode only the payload part of the JWT (the middle part)
      const parts = cleanToken.split('.');

      if (parts.length !== 3) {
        throw new Error('Invalid JWT token format');
      }

      // Decode the payload
      const payload = parts[1];
      // Add padding if needed
      const base64Payload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = atob(base64Payload);
      const parsedPayload = JSON.parse(decodedPayload);

      // Check if the token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      return parsedPayload.exp && parsedPayload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // Assume expired if we can't decode
    }
  }

  /**
   * Gets the expiration timestamp from a JWT token
   * @param token The JWT token to get expiration from
   * @returns The expiration timestamp or null if unable to decode
   */
  static getTokenExpiration(token: string): number | null {
    try {
      // Handle potential "Bearer " prefix
      const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;

      const parts = cleanToken.split('.');

      if (parts.length !== 3) {
        throw new Error('Invalid JWT token format');
      }

      const payload = parts[1];
      const base64Payload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = atob(base64Payload);
      const parsedPayload = JSON.parse(decodedPayload);

      return parsedPayload.exp ? parsedPayload.exp : null;
    } catch (error) {
      console.error('Error getting token expiration:', error);
      return null;
    }
  }

  /**
   * Gets the user ID from a JWT token
   * @param token The JWT token to get user ID from
   * @returns The user ID or null if unable to decode
   */
  static getUserId(token: string): string | null {
    try {
      // Handle potential "Bearer " prefix
      const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;

      const parts = cleanToken.split('.');

      if (parts.length !== 3) {
        throw new Error('Invalid JWT token format');
      }

      const payload = parts[1];
      const base64Payload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = atob(base64Payload);
      const parsedPayload = JSON.parse(decodedPayload);

      // Assuming the user ID is stored in the 'sub' claim (standard JWT claim)
      // Better Auth may use different claim names, so check both 'sub' and 'userId'
      return parsedPayload.sub || parsedPayload.userId || parsedPayload.id || null;
    } catch (error) {
      console.error('Error getting user ID from token:', error);
      return null;
    }
  }

  /**
   * Validates if a token exists and is properly formatted
   * @param token The token to validate
   * @returns True if token is valid, false otherwise
   */
  static isValidToken(token: string | null): boolean {
    if (!token) return false;

    try {
      // Handle potential "Bearer " prefix
      const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;

      const parts = cleanToken.split('.');
      return parts.length === 3 && parts.every(part => part.length > 0);
    } catch {
      return false;
    }
  }

  /**
   * Stores the JWT token in browser storage
   * @param token The JWT token to store
   */
  static storeToken(token: string): void {
    if (this.isValidToken(token)) {
      localStorage.setItem('access_token', token);
    } else {
      console.error('Invalid token provided for storage');
    }
  }

  /**
   * Retrieves the JWT token from browser storage
   * @returns The stored JWT token or null
   */
  static getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Removes the JWT token from browser storage
   */
  static removeToken(): void {
    localStorage.removeItem('access_token');
  }
}

export default JWTUtils;