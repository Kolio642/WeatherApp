const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define directories
const SRC_DIR = 'src';
const PUBLIC_DIR = 'public';
const DIST_DIR = 'dist';

// Create dist directory if it doesn't exist
console.log('Creating dist directory...');
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Copy public files to dist if public dir exists
console.log('Copying static files...');
if (fs.existsSync(PUBLIC_DIR)) {
  console.log('Copying from public directory...');
  copyDirectory(PUBLIC_DIR, DIST_DIR);
}

// Also copy any essential files from root that might be needed
console.log('Checking for additional static files in root...');
['styles.css', 'scripts.js', 'index.html'].forEach(file => {
  if (fs.existsSync(file) && !fs.existsSync(path.join(DIST_DIR, file))) {
    console.log(`Copying ${file} from root to dist...`);
    fs.copyFileSync(file, path.join(DIST_DIR, file));
  }
});

// Bundle worker code with webpack
console.log('Bundling worker code with webpack...');
try {
  execSync('npx webpack', { stdio: 'inherit' });
  console.log('Webpack bundling completed successfully.');
} catch (error) {
  console.error('Error bundling worker code:', error.message);
  process.exit(1);
}

// Copy environment configuration
console.log('Setting up environment...');
if (fs.existsSync('.env')) {
  fs.copyFileSync('.env', path.join(DIST_DIR, '.env'));
} else if (fs.existsSync('.env.example')) {
  fs.copyFileSync('.env.example', path.join(DIST_DIR, '.env'));
}

// Helper function to copy a directory
function copyDirectory(sourceDir, targetDir) {
  if (!fs.existsSync(sourceDir)) {
    console.warn(`Source directory ${sourceDir} does not exist!`);
    return;
  }

  const files = fs.readdirSync(sourceDir);
  files.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    
    if (fs.statSync(sourcePath).isDirectory()) {
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
      }
      copyDirectory(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

console.log('Build completed successfully!');
console.log('Files in dist directory:');
listDirectory(DIST_DIR);

// Helper function to list directory contents
function listDirectory(dir, indent = '') {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    console.log(`${indent}- ${file}`);
    
    if (fs.statSync(filePath).isDirectory()) {
      listDirectory(filePath, `${indent}  `);
    }
  });
} 