// Quick test to check if getUserConnections is properly exported
import { createClient } from '@supabase/supabase-js';

// Test if the function exists in the compiled module
async function testImport() {
  try {
    // This would fail if using server-side imports, so let's just check the file structure
    console.log('Testing sessions module structure...');
    
    // Read the sessions.ts file to check exports
    const fs = await import('fs');
    const path = await import('path');
    
    const sessionsPath = path.join(process.cwd(), 'src', 'lib', 'actions', 'sessions.ts');
    const content = fs.readFileSync(sessionsPath, 'utf-8');
    
    // Check if getUserConnections is exported
    const hasExport = content.includes('export async function getUserConnections');
    console.log('getUserConnections export found:', hasExport);
    
    // Check for any syntax issues around the function
    const lines = content.split('\n');
    const exportLineIndex = lines.findIndex(line => line.includes('export async function getUserConnections'));
    
    if (exportLineIndex >= 0) {
      console.log('Function export line:', lines[exportLineIndex]);
      console.log('Next few lines:');
      for (let i = exportLineIndex + 1; i < Math.min(exportLineIndex + 5, lines.length); i++) {
        console.log(`${i + 1}: ${lines[i]}`);
      }
    }
    
  } catch (error) {
    console.error('Error testing import:', error);
  }
}

testImport();
