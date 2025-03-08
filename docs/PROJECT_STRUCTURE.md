# Weather Website Project Structure

This document outlines the organization of the Weather Website project.

## Directory Structure

```
weather-website/
├── dist/                  # Build output directory
├── docs/                  # Documentation
├── node_modules/          # Node.js dependencies
├── public/                # Static assets
├── scripts/               # Utility scripts
│   ├── server/            # Server-related scripts
│   └── ...                # Other scripts
├── src/                   # Source code
│   ├── config/            # Configuration files
│   ├── constants/         # Constants and enums
│   ├── handlers/          # Request handlers
│   ├── middleware/        # Middleware functions
│   ├── utils/             # Utility functions
│   ├── index.js           # Entry point for local development
│   └── worker.js          # Main Cloudflare Worker script
├── .env                   # Environment variables (not in git)
├── .env.example           # Example environment variables
├── .gitignore             # Git ignore file
├── build.js               # Build script
├── jsconfig.json          # JavaScript configuration
├── package.json           # Node.js package configuration
├── README.md              # Project overview
└── webpack.config.js      # Webpack configuration
```

## Key Components

### Source Code (`src/`)

- **config/**: Configuration files and environment variable handling
- **constants/**: Constant values, API endpoints, and status codes
- **handlers/**: Request handlers for different routes
- **middleware/**: Middleware functions for request/response processing
- **utils/**: Utility functions for common tasks
- **worker.js**: Main entry point for the Cloudflare Worker

### Scripts (`scripts/`)

- **server/**: Server-related scripts for local development
- **deploy.bat**: Script for deploying to Cloudflare Workers
- **dev.bat**: Script for running in development mode
- **run-local.bat**: Script for running the local development server
- **start.bat**: Script for starting the Express server

### Static Assets (`public/`)

- **index.html**: Main HTML file
- **styles.css**: CSS styles
- **scripts.js**: Client-side JavaScript

## Build Process

The build process is handled by `build.js` and uses webpack to bundle the worker code. The process:

1. Creates the `dist` directory
2. Copies static files from `public/` to `dist/`
3. Bundles the worker code with webpack
4. Copies environment configuration

## Deployment

The project is deployed to Cloudflare Workers using Wrangler. The deployment process:

1. Builds the project
2. Uploads the assets to Cloudflare KV storage
3. Deploys the worker script

## Local Development

For local development, you can use:

- `npm run dev`: Starts the development server with hot reloading
- `npm run build`: Builds the project
- `npm run start`: Starts the Express server 