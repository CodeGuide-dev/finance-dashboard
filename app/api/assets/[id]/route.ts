import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/api-utils';
import { db } from '@/db';
import { getAssetById, updateAsset, deleteAsset } from '@/lib/db-utils';

// GET /api/assets/[id] - Get a specific asset
export const GET = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<Record<string, string>> }) => {
  try {
    const resolvedParams = await params;
    const assetId = parseInt(resolvedParams.id);
    if (isNaN(assetId)) {
      return NextResponse.json({ error: 'Invalid asset ID' }, { status: 400 });
    }
    
    const asset = await getAssetById(db, assetId);
    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }
    
    // Check if the asset belongs to the current user
    if (asset.userId !== req.user!.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error fetching asset:', error);
    return NextResponse.json({ error: 'Failed to fetch asset' }, { status: 500 });
  }
});

// PUT /api/assets/[id] - Update a specific asset
export const PUT = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<Record<string, string>> }) => {
  try {
    const resolvedParams = await params;
    const assetId = parseInt(resolvedParams.id);
    if (isNaN(assetId)) {
      return NextResponse.json({ error: 'Invalid asset ID' }, { status: 400 });
    }
    
    const existingAsset = await getAssetById(db, assetId);
    if (!existingAsset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }
    
    // Check if the asset belongs to the current user
    if (existingAsset.userId !== req.user!.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const body = await req.json();
    
    const updatedAsset = await updateAsset(db, assetId, body);
    return NextResponse.json(updatedAsset[0]);
  } catch (error) {
    console.error('Error updating asset:', error);
    return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 });
  }
});

// DELETE /api/assets/[id] - Delete a specific asset
export const DELETE = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<Record<string, string>> }) => {
  try {
    const resolvedParams = await params;
    const assetId = parseInt(resolvedParams.id);
    if (isNaN(assetId)) {
      return NextResponse.json({ error: 'Invalid asset ID' }, { status: 400 });
    }
    
    const existingAsset = await getAssetById(db, assetId);
    if (!existingAsset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }
    
    // Check if the asset belongs to the current user
    if (existingAsset.userId !== req.user!.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const deletedAsset = await deleteAsset(db, assetId);
    return NextResponse.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
  }
});