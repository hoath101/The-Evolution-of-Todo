#!/usr/bin/env python3
"""
Test script to verify authentication functionality works with the database
"""
import requests
import json

def test_auth_endpoints():
    """Test the authentication endpoints"""
    base_url = "http://localhost:8000/api/v1"

    # Test data
    test_user = {
        "email": "test@example.com",
        "password": "securepassword123",
        "name": "Test User"
    }

    print("Testing registration endpoint...")
    try:
        response = requests.post(f"{base_url}/auth/register", json=test_user)
        print(f"Registration status: {response.status_code}")
        print(f"Registration response: {response.text}")

        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get("access_token")
            print("Registration successful!")

            # Test login with the same credentials
            print("\nTesting login endpoint...")
            login_data = {
                "email": test_user["email"],
                "password": test_user["password"]
            }

            response = requests.post(f"{base_url}/auth/login", json=login_data)
            print(f"Login status: {response.status_code}")
            print(f"Login response: {response.text}")

            if response.status_code == 200:
                print("Login successful!")

                # Test getting user info
                print("\nTesting get current user endpoint...")
                headers = {"Authorization": f"Bearer {access_token}"}
                response = requests.get(f"{base_url}/auth/me", headers=headers)
                print(f"Get user status: {response.status_code}")
                print(f"Get user response: {response.text}")

                if response.status_code == 200:
                    print("Get user info successful!")
                else:
                    print("Failed to get user info")
            else:
                print("Login failed")
        else:
            print("Registration failed")

    except requests.exceptions.ConnectionError:
        print("Server is not running. Please start the server before running this test.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    test_auth_endpoints()