import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Forward the request to Better Auth service
    const response = await fetch('http://localhost:4000/api/auth/signout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    // Create a response
    const res = Response.json(data, { status: response.status });

    // Copy any cookies from the Better Auth response
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      res.headers.append('set-cookie', setCookieHeader);
    }

    return res;
  } catch (error) {
    console.error('Sign-out error:', error);
    return Response.json({ error: 'Sign-out failed' }, { status: 500 });
  }
}