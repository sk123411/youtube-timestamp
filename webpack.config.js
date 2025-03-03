const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js', // Entry point for your React app
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory
    filename: 'bundle.js', // Output bundle file name
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Apply Babel to all .js files
        exclude: /node_modules/, // Exclude node_modules
        use: {
          loader: 'babel-loader', // Use Babel for JavaScript
        },
      },
      {
        test: /\.css$/, // Apply CSS loaders to .css files
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', // Use this HTML template
    }),
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dist'), // Serve files from the dist folder
    compress: true, // Enable gzip compression
    port: 9000, // Port for the dev server
  },
};