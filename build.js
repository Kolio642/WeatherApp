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

// Clean up previous builds - remove worker.js and worker.js.map
const filesToClean = ['worker.js', 'worker.js.map'];
filesToClean.forEach(file => {
  const filePath = path.join(DIST_DIR, file);
  if (fs.existsSync(filePath)) {
    console.log(`Removing previous build file: ${file}`);
    fs.unlinkSync(filePath);
  }
});

// Check for and copy public files
console.log('Copying static files...');
if (fs.existsSync(PUBLIC_DIR)) {
  console.log('Copying from public directory...');
  
  // Check if public dir has files
  const publicFiles = fs.readdirSync(PUBLIC_DIR);
  console.log(`Found ${publicFiles.length} files in public directory`);
  
  if (publicFiles.length === 0) {
    console.warn('Warning: Public directory exists but is empty!');
  }
  
  // Copy each file individually for better logging
  publicFiles.forEach(file => {
    const sourcePath = path.join(PUBLIC_DIR, file);
    const targetPath = path.join(DIST_DIR, file);
    
    if (fs.statSync(sourcePath).isFile()) {
      console.log(`Copying ${file} to dist...`);
      fs.copyFileSync(sourcePath, targetPath);
    } else {
      // It's a directory, handle recursively
      console.log(`Copying directory ${file} to dist...`);
      copyDirectory(sourcePath, targetPath);
    }
  });
} else {
  console.warn('Warning: Public directory does not exist!');
}

// Force copy essential files
const essentialFiles = ['index.html', 'styles.css', 'scripts.js'];
console.log('Checking for essential static files...');

// First look in the public directory
essentialFiles.forEach(file => {
  const publicPath = path.join(PUBLIC_DIR, file);
  const distPath = path.join(DIST_DIR, file);
  
  if (fs.existsSync(publicPath) && !fs.existsSync(distPath)) {
    console.log(`Copying essential file ${file} from public to dist...`);
    fs.copyFileSync(publicPath, distPath);
  }
});

// Also check in root
console.log('Checking for additional static files in root...');
essentialFiles.forEach(file => {
  const rootPath = file;
  const distPath = path.join(DIST_DIR, file);
  
  if (fs.existsSync(rootPath) && !fs.existsSync(distPath)) {
    console.log(`Copying ${file} from root to dist...`);
    fs.copyFileSync(rootPath, distPath);
  }
});

// Verify essential files
console.log('Verifying essential files were copied...');
essentialFiles.forEach(file => {
  const distPath = path.join(DIST_DIR, file);
  if (!fs.existsSync(distPath)) {
    console.warn(`WARNING: Essential file ${file} is missing from dist!`);
    // If file is available in public, force copy it
    const publicPath = path.join(PUBLIC_DIR, file);
    if (fs.existsSync(publicPath)) {
      console.log(`Force copying ${file} from public to dist...`);
      fs.copyFileSync(publicPath, distPath);
    }
  } else {
    console.log(`✓ Essential file ${file} is present in dist`);
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

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
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
  if (!fs.existsSync(dir)) {
    console.log(`${indent}Directory ${dir} does not exist!`);
    return;
  }
  
  const files = fs.readdirSync(dir);
  
  if (files.length === 0) {
    console.log(`${indent}(empty directory)`);
    return;
  }
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    const fileSize = (stats.size / 1024).toFixed(2) + 'KB';
    
    if (stats.isDirectory()) {
      console.log(`${indent}- ${file}/ (directory)`);
      listDirectory(filePath, `${indent}  `);
    } else {
      console.log(`${indent}- ${file} (${fileSize})`);
    }
  });
} 