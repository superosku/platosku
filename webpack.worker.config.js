// https://dev.to/anxiny/a-simple-way-to-use-web-worker-with-react-create-app-no-eject-needed-1c08

const path = require('path');
const webpack = require('webpack');

const src = path.resolve(__dirname, './src');
const build = path.resolve(__dirname, './public'); // output worker.js to public folder


const tsLoader = {
  loader: 'ts-loader',
  options: { compilerOptions: { module: 'esnext', noEmit: false } }
}


module.exports = {
  mode: 'none',
  target: "webworker", //Importan! Use webworker target
  entry: './worker/worker.ts',
  output: {
    filename: 'worker.jsB',
    path: src + '/build',
    assetModuleFilename: 'asset-ignore-me',
  },
  resolve: {
    modules: [
      "node_modules",
      // src + '/game/'
    ],
    extensions: [".json", ".ts"],
  },
  watchOptions: {
    ignored: src + '/build',
  },

  plugins: [
    // new webpack.HotModuleReplacementPlugin(),
    // new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify('development') })
  ],
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: [tsLoader],
        type: 'javascript/auto',
      },
    ]
  }
};
