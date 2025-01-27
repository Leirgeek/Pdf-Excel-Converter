import { NextRequest, NextResponse } from 'next/server';
import { LlamaParseReader } from 'llamaindex';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { cleanupTempFiles } from '@/lib/cleanup';
import { AppError, ProcessingError } from '@/lib/errors';
import Logger from '@/lib/logger';

export async function POST(req: NextRequest) {
  const tempPath = join(tmpdir(), `upload-${Date.now()}.pdf`);

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw AppError.badRequest(
        'No file provided in form data',
        'Please select a PDF file to upload'
      );
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      throw AppError.badRequest(
        'Invalid file type: ' + file.type,
        'Please upload a PDF file'
      );
    }

    Logger.info('Processing file', { filename: file.name, size: file.size });

    // Create a temporary file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(tempPath, buffer);

    Logger.debug('Temporary file created', { path: tempPath });

    // Initialize LlamaParseReader
    const reader = new LlamaParseReader({ resultType: "markdown" });

    // Parse the document
    const documents = await reader.loadData(tempPath).catch((error) => {
      Logger.error('Failed to parse PDF', error, { filename: file.name });
      throw new ProcessingError(
        'Failed to parse PDF: ' + error.message,
        'Unable to read the PDF file. Please make sure it is not corrupted.'
      );
    });

    if (!documents || documents.length === 0) {
      throw new ProcessingError(
        'No content extracted from PDF',
        'The PDF file appears to be empty or unreadable'
      );
    }

    // Get the text from the first document
    const text = documents[0]?.text;
    
    if (!text) {
      throw new ProcessingError(
        'No text content in parsed document',
        'Could not extract text from the PDF'
      );
    }

    Logger.info('Successfully extracted text', { 
      filename: file.name,
      textLength: text.length 
    });

    return NextResponse.json({ text });
  } catch (error) {
    Logger.error('Error in extract route', error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.userMessage },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Failed to extract text from PDF' },
      { status: 500 }
    );
  } finally {
    // Clean up temporary files
    await cleanupTempFiles().catch((error) => {
      Logger.error('Failed to clean up temp files', error);
    });
  }
}
