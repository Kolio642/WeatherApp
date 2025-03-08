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

// Copy environment configuration
console.log('Setting up environment...');
if (fs.existsSync('.env')) {
  fs.copyFileSync('.env', 'dist/.env');
} else if (fs.existsSync('.env.example')) {
  fs.copyFileSync('.env.example', 'dist/.env');
}

// Write README for Cloudflare
fs.writeFileSync('dist/README.md', 
  '# Weather Website\n\n' +
  'This is a weather website deployed on Cloudflare Pages.\n' +
  'Built at: ' + new Date().toISOString() + '\n'
);

console.log('Build completed successfully!');
console.log('Files in dist directory:');
fs.readdirSync('dist').forEach(file => {
  console.log(`- ${file}`);
}); 