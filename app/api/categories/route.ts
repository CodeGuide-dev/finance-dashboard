import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/api-utils';
import { db } from '@/db';
import { getCategories, createCategory, updateCategory, deleteCategory, getCategoryById } from '@/lib/db-utils';

// GET /api/categories - Get all categories
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || undefined;
    
    const categories = await getCategories(db, type);
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
});

// POST /api/categories - Create a new category
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    
    const newCategory = await createCategory(db, body);
    return NextResponse.json(newCategory[0], { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
});