const { merge } = require('webpack-merge');
const common = require('./webpack.common.cjs');
const NodemonPlugin = require('nodemon-webpack-plugin');
const path = require('path');

module.exports = merge(common, {
  mode: 'development',
  plugins: [
    new NodemonPlugin(),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
  },
});
