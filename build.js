const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
console.log('Creating dist directory...');
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// Copy static files
console.log('Copying static files...');
fs.copyFileSync('index.html', 'dist/index.html');
fs.copyFileSync('styles.css', 'dist/styles.css');
fs.copyFileSync('scripts.js', 'dist/scripts.js');
fs.copyFileSync('_worker.js', 'dist/_worker.js');

// Create workers-site directory
console.log('Copying worker files...');
if (!fs.existsSync('dist/workers-site')) {
  fs.mkdirSync('dist/workers-site', { recursive: true });
}

// Copy worker files if they exist
try {
  if (fs.existsSync('workers-site/index.js')) {
    fs.copyFileSync('workers-site/index.js', 'dist/workers-site/index.js');
  }
  if (fs.existsSync('workers-site/package.json')) {
    fs.copyFileSync('workers-site/package.json', 'dist/workers-site/package.json');
  }
} catch (err) {
  console.error('Error copying workers-site files:', err);
}

// Copy environment configuration
console.log('Setting up environment...');
if (fs.existsSync('.env.example')) {
  fs.copyFileSync('.env.example', 'dist/.env');
}

console.log('Build completed successfully!');
console.log('Files in dist directory:');
fs.readdirSync('dist').forEach(file => {
  console.log(`- ${file}`);
}); 