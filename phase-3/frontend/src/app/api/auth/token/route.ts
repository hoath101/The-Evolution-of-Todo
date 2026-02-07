import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get cookies from the incoming request
    const cookieHeader = request.headers.get('cookie');

    // Forward the request to Better Auth service's token endpoint
    const response = await fetch('http://localhost:4000/api/auth/token', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { 'Cookie': cookieHeader }), // Pass cookies if available
      },
    });

    const data = await response.json();

    // Create a response
    const res = Response.json(data, { status: response.status });

    return res;
  } catch (error) {
    console.error('Token retrieval error:', error);
    return Response.json({ error: 'Token retrieval failed' }, { status: 500 });
  }
}