import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/api-utils';
import { db } from '@/db';
import { getCategoryById, updateCategory, deleteCategory } from '@/lib/db-utils';

// GET /api/categories/[id] - Get a specific category
export const GET = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<Record<string, string>> }) => {
  try {
    const resolvedParams = await params;
    const categoryId = parseInt(resolvedParams.id);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }
    
    const category = await getCategoryById(db, categoryId);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
  }
});

// PUT /api/categories/[id] - Update a specific category
export const PUT = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<Record<string, string>> }) => {
  try {
    const resolvedParams = await params;
    const categoryId = parseInt(resolvedParams.id);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }
    
    const body = await req.json();
    
    const updatedCategory = await updateCategory(db, categoryId, body);
    if (updatedCategory.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedCategory[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
});

// DELETE /api/categories/[id] - Delete a specific category
export const DELETE = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<Record<string, string>> }) => {
  try {
    const resolvedParams = await params;
    const categoryId = parseInt(resolvedParams.id);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }
    
    const deletedCategory = await deleteCategory(db, categoryId);
    if (deletedCategory.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
});