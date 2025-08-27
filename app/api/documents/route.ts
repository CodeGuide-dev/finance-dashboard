import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/api-utils';
import { db } from '@/db';
import { getDocuments, createDocument, updateDocument, deleteDocument, getDocumentById } from '@/lib/db-utils';

// GET /api/documents - Get all documents
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const documents = await getDocuments(db, req.user!.id);
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
});

// POST /api/documents - Create a new document
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    
    // Ensure the document is associated with the current user
    const documentData = {
      ...body,
      userId: req.user!.id
    };
    
    const newDocument = await createDocument(db, documentData);
    return NextResponse.json(newDocument[0], { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
});