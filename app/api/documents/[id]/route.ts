import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/api-utils';
import { db } from '@/db';
import { getDocumentById, updateDocument, deleteDocument } from '@/lib/db-utils';

// GET /api/documents/[id] - Get a specific document
export const GET = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<Record<string, string>> }) => {
  try {
    const resolvedParams = await params;
    const documentId = parseInt(resolvedParams.id);
    if (isNaN(documentId)) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }
    
    const document = await getDocumentById(db, documentId);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    // Check if the document belongs to the current user
    if (document.userId !== req.user!.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    return NextResponse.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
  }
});

// PUT /api/documents/[id] - Update a specific document
export const PUT = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<Record<string, string>> }) => {
  try {
    const resolvedParams = await params;
    const documentId = parseInt(resolvedParams.id);
    if (isNaN(documentId)) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }
    
    const existingDocument = await getDocumentById(db, documentId);
    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    // Check if the document belongs to the current user
    if (existingDocument.userId !== req.user!.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const body = await req.json();
    
    const updatedDocument = await updateDocument(db, documentId, body);
    return NextResponse.json(updatedDocument[0]);
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
});

// DELETE /api/documents/[id] - Delete a specific document
export const DELETE = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<Record<string, string>> }) => {
  try {
    const resolvedParams = await params;
    const documentId = parseInt(resolvedParams.id);
    if (isNaN(documentId)) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }
    
    const existingDocument = await getDocumentById(db, documentId);
    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    // Check if the document belongs to the current user
    if (existingDocument.userId !== req.user!.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const deletedDocument = await deleteDocument(db, documentId);
    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
});