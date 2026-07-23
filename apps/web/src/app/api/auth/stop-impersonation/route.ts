import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('iep_impersonation_token')?.value;

  if (token) {
    try {
      const apiUrl = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      await fetch(`${apiUrl}/admin/impersonate/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (e) {
      console.error('Failed to log stop impersonation', e);
    }
  }

  // We're stopping the impersonation session, so redirect back to the Admin Console.
  // The Admin Console runs on port 3001 locally.
  const adminUrl = process.env.ADMIN_URL || 'http://localhost:3001';
  
  const response = NextResponse.redirect(`${adminUrl}/users`);
  response.cookies.delete('iep_impersonation_token');
  
  return response;
}
