const path = require('path');

module.exports = {
  target: 'webworker',
  entry: './src/index.js',
  mode: 'development',
  output: {
    filename: 'worker.js',
    path: path.join(__dirname, 'dist'),
  },
  optimization: {
    minimize: false
  },
  performance: {
    hints: false,
  },
  devtool: 'cheap-module-source-map',
  resolve: {
    extensions: ['.js', '.json'],
  },
}; 