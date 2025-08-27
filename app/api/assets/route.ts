import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/api-utils';
import { db } from '@/db';
import { getAssets, createAsset, updateAsset, deleteAsset, getAssetById } from '@/lib/db-utils';

// GET /api/assets - Get all assets
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const assets = await getAssets(db, req.user!.id);
    return NextResponse.json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
  }
});

// POST /api/assets - Create a new asset
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    
    // Ensure the asset is associated with the current user
    const assetData = {
      ...body,
      userId: req.user!.id
    };
    
    const newAsset = await createAsset(db, assetData);
    return NextResponse.json(newAsset[0], { status: 201 });
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 });
  }
});