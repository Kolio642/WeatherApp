#!/bin/bash
echo "Starting Weather Website in development mode..."
echo
echo "Building project..."
npm run build
echo
echo "Starting local development server..."
echo
echo "Press Ctrl+C to stop the server"
npm run dev:worker 