const path = require("path");

module.exports = {
  mode: "development",
  entry: "./index.js", // Adjust this path to your actual entry file
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  // Configure other options and loaders as needed
};
