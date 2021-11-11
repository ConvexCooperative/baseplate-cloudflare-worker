const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

/** @type {import('@types/webpack').Configuration} */
const config = {
  target: "webworker",
  entry: "./src/single-spa-foundry-worker.ts",
  mode: "development",
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "babel-loader",
      },
    ],
  },
  plugins: [new ForkTsCheckerWebpackPlugin()],
};

module.exports = config;
