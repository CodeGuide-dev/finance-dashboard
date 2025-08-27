import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/api-utils';
import { db } from '@/db';
import { getDashboardSummary } from '@/lib/db-utils';

// GET /api/dashboard - Get dashboard summary
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const summary = await getDashboardSummary(db, req.user!.id);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard summary' }, { status: 500 });
  }
});