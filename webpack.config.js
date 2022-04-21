var nodeExternals = require('webpack-node-externals');
var webpack = require('webpack');
var path = require('path');

function DtsBundlePlugin() {}
DtsBundlePlugin.prototype.apply = function (compiler) {
  compiler.hooks.afterEmit.tap({name: 'DtsBundlePlugin'}, function() {
    setTimeout(function() {
      var Generator = require('npm-dts').Generator
      var generator = new Generator({
        entry: 'src/civet.ts'
      }, true, true);
      generator.generate().catch(function(e) {
        throw e;
      });
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