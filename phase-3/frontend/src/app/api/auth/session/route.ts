import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Forward the request to Better Auth service's session endpoint
    const response = await fetch('http://localhost:4000/api/auth/session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '', // Pass cookies for session validation
      },
    });

    const data = await response.json();

    // Return the session data from Better Auth
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error('Session check error:', error);
    return Response.json({ error: 'Session check failed' }, { status: 500 });
  }
}