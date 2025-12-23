import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting Vercel build process...');

// Install dependencies
console.log('Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  
  // Run the build script
  console.log('Running build script...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Ensure the output directory exists
  const outputDir = join(process.cwd(), 'dist');
  if (!existsSync(outputDir)) {
    console.error('Build failed: dist directory not found after build');
    process.exit(1);
  }
  
  console.log('Build completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
