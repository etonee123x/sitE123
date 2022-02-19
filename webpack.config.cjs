const nodeExternals = require('webpack-node-externals');
const NodemonPlugin = require('nodemon-webpack-plugin');
module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: './bin/www',
  target: 'node',
  plugins: [
    new NodemonPlugin(), // Dong
  ],
  externals: [nodeExternals()],
  output: {
    filename: 'server.cjs',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [{ test: /\.tsx?$/, loader: 'ts-loader' }],
  },
};
