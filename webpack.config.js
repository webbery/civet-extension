var nodeExternals = require('webpack-node-externals');
var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

/* helper function to get into build directory */
// var distPath = function(name) {
//   if (undefined === name) {
//     return path.join('dist');
//   }

//   return path.join('dist', name);
// };

function DtsBundlePlugin() {}
DtsBundlePlugin.prototype.apply = function (compiler) {
  compiler.plugin('done', function() {
    var dts = require('dts-bundle')
    dts.bundle({
      name: 'civet',
      main: 'src/civet.d.ts',
      out: '../index.d.ts',
      removeSource: true,
      outputAsModuleFolder: true
    })
  })
}

var webpack_opts = {
  entry: './src/civet.ts',
  mode: "production",
  output: {
    path: path.resolve(__dirname, "."),
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
    }),
    new DtsBundlePlugin()
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