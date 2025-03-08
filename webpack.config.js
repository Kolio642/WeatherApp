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
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
        },
      },
    ],
  },
}; 