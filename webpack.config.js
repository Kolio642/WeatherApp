const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './src/worker.js',
  output: {
    filename: 'worker.js',
    path: path.join(__dirname, 'dist'),
  },
  target: 'webworker',
  mode: process.env.NODE_ENV || 'production',
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  browsers: ['last 2 versions'],
                },
                modules: false,
              }],
            ],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.mjs', '.json', '.wasm'],
    fallback: {
      "path": false,
      "fs": false
    }
  }
}; 