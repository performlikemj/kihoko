const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new Dotenv({ systemvars: true }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public', to: '.', noErrorOnMissing: true, globOptions: { ignore: ['**/index.html'] } },
      ],
    }),
  ],
  devServer: {
    static: path.join(__dirname, 'public'),
    hot: true,
    port: 3000,
    historyApiFallback: true,
  },
};
