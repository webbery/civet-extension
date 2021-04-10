var nodeExternals = require('webpack-node-externals');
var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

/* helper function to get into build directory */
var distPath = function(name) {
  if (undefined === name) {
    return path.join('dist');
  }

  return path.join('dist', name);
};

var webpack_opts = {
  entry: './civet.ts',
  mode: "production",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: 'index.js',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    modules: ['node_modules', 'src']
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      options: {
        test: /\.ts$/,
        ts: {
          compiler: 'typescript',
          configFileName: 'tsconfig.json'
        },
        tslint: {
          emitErrors: true,
          failOnHint: true
        }
      }
    })
  ],
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ["babel-loader", "awesome-typescript-loader"],
        exclude: [path.resolve(__dirname, "node_modules")]
      }
    ]
  },
  externals: [nodeExternals()]
};

module.exports = webpack_opts;