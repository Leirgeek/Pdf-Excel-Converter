import { unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const TEMP_FILE_PREFIX = 'upload-';

export async function cleanupTempFiles() {
  try {
    // Get all files in temp directory
    const tempDir = tmpdir();
    const files = await require('fs').promises.readdir(tempDir);
    
    // Find and delete our temp files
    const cleanupPromises = files
      .filter(file => file.startsWith(TEMP_FILE_PREFIX) && file.endsWith('.pdf'))
      .map(file => {
        const filePath = join(tempDir, file);
        return unlink(filePath).catch(err => {
          console.error(`Failed to delete temp file ${filePath}:`, err);
        });
      });

    await Promise.all(cleanupPromises);
  } catch (error) {
    console.error('Error cleaning up temp files:', error);
  }
}
