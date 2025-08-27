import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/api-utils';
import { db } from '@/db';
import { getInvestments, createInvestment, updateInvestment, deleteInvestment, getInvestmentById } from '@/lib/db-utils';

// GET /api/investments - Get all investments
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const investments = await getInvestments(db, req.user!.id);
    return NextResponse.json(investments);
  } catch (error) {
    console.error('Error fetching investments:', error);
    return NextResponse.json({ error: 'Failed to fetch investments' }, { status: 500 });
  }
});

// POST /api/investments - Create a new investment
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    
    // Ensure the investment is associated with the current user
    const investmentData = {
      ...body,
      userId: req.user!.id
    };
    
    const newInvestment = await createInvestment(db, investmentData);
    return NextResponse.json(newInvestment[0], { status: 201 });
  } catch (error) {
    console.error('Error creating investment:', error);
    return NextResponse.json({ error: 'Failed to create investment' }, { status: 500 });
  }
});