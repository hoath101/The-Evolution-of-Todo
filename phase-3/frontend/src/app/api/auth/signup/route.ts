import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Forward the request to Better Auth service
    const authResponse = await fetch('http://localhost:4000/api/auth/sign-up/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    const authData = await authResponse.json();

    if (!authResponse.ok) {
      return Response.json(authData, { status: authResponse.status });
    }

    // Get the set-cookie header from the authentication response
    const setCookieHeader = authResponse.headers.get('set-cookie');

    // If we have session cookies, try to get the JWT token
    let tokenData = {};
    if (setCookieHeader) {
      // Call the token endpoint to get the JWT token
      const tokenResponse = await fetch('http://localhost:4000/api/auth/token', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': setCookieHeader, // Pass the session cookies
        },
      });

      if (tokenResponse.ok) {
        tokenData = await tokenResponse.json();
      }
    }

    // Combine auth data with token data
    const combinedData = {
      ...authData,
      session: {
        ...authData.session,
        token: tokenData.token || authData.session?.token || null,
      }
    };

    // Create a response with combined data
    const res = Response.json(combinedData, { status: authResponse.status });

    // Copy cookies from the authentication response
    if (setCookieHeader) {
      res.headers.append('set-cookie', setCookieHeader);
    }

    return res;
  } catch (error) {
    console.error('Sign-up error:', error);
    return Response.json({ error: 'Sign-up failed' }, { status: 500 });
  }
}