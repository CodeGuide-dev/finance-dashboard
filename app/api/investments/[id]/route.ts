import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/api-utils';
import { db } from '@/db';
import { getInvestmentById, updateInvestment, deleteInvestment } from '@/lib/db-utils';

// GET /api/investments/[id] - Get a specific investment
export const GET = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<Record<string, string>> }) => {
  try {
    const resolvedParams = await params;
    const investmentId = parseInt(resolvedParams.id);
    if (isNaN(investmentId)) {
      return NextResponse.json({ error: 'Invalid investment ID' }, { status: 400 });
    }
    
    const investment = await getInvestmentById(db, investmentId);
    if (!investment) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
    }
    
    // Check if the investment belongs to the current user
    if (investment.userId !== req.user!.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    return NextResponse.json(investment);
  } catch (error) {
    console.error('Error fetching investment:', error);
    return NextResponse.json({ error: 'Failed to fetch investment' }, { status: 500 });
  }
});

// PUT /api/investments/[id] - Update a specific investment
export const PUT = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<Record<string, string>> }) => {
  try {
    const resolvedParams = await params;
    const investmentId = parseInt(resolvedParams.id);
    if (isNaN(investmentId)) {
      return NextResponse.json({ error: 'Invalid investment ID' }, { status: 400 });
    }
    
    const existingInvestment = await getInvestmentById(db, investmentId);
    if (!existingInvestment) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
    }
    
    // Check if the investment belongs to the current user
    if (existingInvestment.userId !== req.user!.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const body = await req.json();
    
    const updatedInvestment = await updateInvestment(db, investmentId, body);
    return NextResponse.json(updatedInvestment[0]);
  } catch (error) {
    console.error('Error updating investment:', error);
    return NextResponse.json({ error: 'Failed to update investment' }, { status: 500 });
  }
});

// DELETE /api/investments/[id] - Delete a specific investment
export const DELETE = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<Record<string, string>> }) => {
  try {
    const resolvedParams = await params;
    const investmentId = parseInt(resolvedParams.id);
    if (isNaN(investmentId)) {
      return NextResponse.json({ error: 'Invalid investment ID' }, { status: 400 });
    }
    
    const existingInvestment = await getInvestmentById(db, investmentId);
    if (!existingInvestment) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
    }
    
    // Check if the investment belongs to the current user
    if (existingInvestment.userId !== req.user!.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const deletedInvestment = await deleteInvestment(db, investmentId);
    return NextResponse.json({ message: 'Investment deleted successfully' });
  } catch (error) {
    console.error('Error deleting investment:', error);
    return NextResponse.json({ error: 'Failed to delete investment' }, { status: 500 });
  }
});