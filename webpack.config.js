const path = require('path');

module.exports = {
  target: 'webworker',
  entry: './src/index.js',
  mode: process.env.NODE_ENV || 'production',
  output: {
    filename: '_worker.js',
    path: path.join(__dirname, 'dist'),
  },
  optimization: {
    minimize: false
  },
  performance: {
    hints: false,
  },
  resolve: {
    extensions: ['.js', '.json'],
  },
}; 