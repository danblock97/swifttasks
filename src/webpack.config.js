const path = require("path");
const webpack = require("webpack"); // Import webpack

module.exports = {
	entry: "./src/index.js", // Adjust to your entry point
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "dist"),
	},
	resolve: {
		fallback: {
			fs: false, // No polyfill for fs
			path: require.resolve("path-browserify"),
			os: require.resolve("os-browserify/browser"),
			crypto: require.resolve("crypto-browserify"),
			stream: require.resolve("stream-browserify"),
			process: require.resolve("process/browser"),
		},
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
				},
			},
		],
	},
	plugins: [
		new webpack.ProvidePlugin({
			process: "process/browser",
			Buffer: ["buffer", "Buffer"],
		}),
	],
	devServer: {
		static: "./dist", // Adjust to your static content directory
		hot: true,
	},
};
