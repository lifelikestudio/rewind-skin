const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (_env, argv = {}) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? false : 'eval',
    entry: {
      global: './src/global.js',
      'outbound-tracking': './src/outbound-tracking.js',
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'assets'),
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].css',
      }),
    ],
  };
};
