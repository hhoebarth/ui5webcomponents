const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
  entry: './src/index.js',
  output: {
        path: path.resolve(__dirname, "dist"),
        filename: 'main.js',
        library: 'main',
        libraryTarget:'var'
  },
  module: {
    rules: [
      {
        test: /\.(css)$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
	  {
        test: /\.properties$/,
        loader: 'file-loader',
		options: {
          outputPath: 'i18n',
        },
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "index.html")
    })
  ]
};