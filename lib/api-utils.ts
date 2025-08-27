import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from "@/lib/auth";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export function withAuth(handler: (req: AuthenticatedRequest, context: { params: Promise<Record<string, string>> }) => Promise<NextResponse>) {
  return async function(req: NextRequest, context: { params: Promise<Record<string, string>> }) {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.user = session.user as { id: string; name: string; email: string };
    
    try {
      return await handler(authenticatedReq, context);
    } catch (error) {
      console.error('API Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  };
}