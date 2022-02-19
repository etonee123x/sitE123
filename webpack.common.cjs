const nodeExternals = require('webpack-node-externals');

module.exports = {
  devtool: 'inline-source-map',
  entry: './bin/www',
  target: 'node',
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
