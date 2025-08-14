const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    code: './src/code.ts',
    ui: './src/ui.ts',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: false,
            compilerOptions: {
              target: 'es5',
              module: 'es6',
              downlevelIteration: true,
            },
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf|svg|png|jpg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: './',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    globalObject: 'this',
    clean: true,
  },
  target: ['web', 'es5'],
  optimization: {
    minimize: false, // Disable minification for better debugging
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'ui.html',
      filename: 'ui.html',
      inject: 'body',
      chunks: ['ui'],
      scriptLoading: 'blocking',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json', to: './' },
        { from: 'TutuIcons-regular.ttf', to: './' },
        { from: 'assets', to: './assets' },
      ],
    }),
  ],
};
