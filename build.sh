#!/bin/bash
# Custom build script for Cloudflare Pages

# Create output directory
echo "Creating dist directory..."
mkdir -p dist

# Copy static files
echo "Copying static files..."
cp index.html dist/
cp styles.css dist/
cp scripts.js dist/
cp _worker.js dist/

# Copy worker files
echo "Copying worker files..."
mkdir -p dist/workers-site
cp workers-site/index.js dist/workers-site/
cp workers-site/package.json dist/workers-site/

# Copy environment configuration
echo "Setting up environment..."
cp .env.example dist/.env

# Final message
echo "Build completed successfully!"
ls -la dist/ 