import { config } from 'dotenv';
config();

import { Configuration } from 'webpack';
import path from 'path';
import HtmlPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import DotenvPlugin from 'dotenv-webpack';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';

const stage = process.env.NODE_ENV || 'development';

const mode = stage === 'staging' || stage === 'production' ? 'production' : 'development';

const excludedDirectories = [/node_modules/, /dev-app/, /\.stories\.tsx$/];

const options: Configuration = {
  mode: mode,
  entry: {
    popup: path.join(__dirname, 'src', 'pages', 'Popup', 'index.tsx'),
    walletpopup: path.join(__dirname, 'src', 'pages', 'WalletPopup', 'index.tsx'),
    background: path.join(__dirname, 'src', 'scripts', 'background.ts'),
    attach: path.join(__dirname, 'src', 'scripts', 'attach.ts'),
    'attach.content': path.join(__dirname, 'src', 'scripts', 'attach.content.ts'),
    explorer: path.join(__dirname, 'src', 'scripts', 'explorer.ts'),
    'explorer.content': path.join(__dirname, 'src', 'scripts', 'explorer.content.ts'),
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'build'),
    clean: true,
  },
  module: {
    rules: [
      {
        // CSS Files
        test: /\.(css)$/,
        // in the `src` directory
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
        ],
      },
      // HTML Files
      {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: excludedDirectories,
      },
      // Images
      {
        test: /\.(png|jpe?g|gif)$/i,
        loader: 'file-loader',
        exclude: excludedDirectories,
      },
      // SVG Images
      {
        test: /\.svg$/i,
        type: 'asset',
        resourceQuery: /url/, // *.svg?url
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: [/url/] }, // exclude react component if *.svg?url
        use: ['@svgr/webpack'],
      },
      // TypeScript
      {
        test: /\.(ts|tsx)$/,
        exclude: excludedDirectories,
        loader: 'ts-loader',
      },
      // React JSX
      {
        test: /\.(js|jsx)$/,
        exclude: excludedDirectories,
        use: [
          {
            loader: 'source-map-loader',
          },
          {
            loader: 'babel-loader',
          },
        ],
      },
    ],
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.svg'],
  },
  devtool: 'source-map', // Source map generation must be turned on
  plugins: [
    // Clean build/* folder prior to building
    new CleanWebpackPlugin({ verbose: false }),

    new ESLintPlugin(),

    new DotenvPlugin({
      path: `.env.${stage}`,
      systemvars: true,
    }),

    // Copy manifest.json file to build + update internal fields
    new CopyPlugin({
      patterns: [
        {
          from: 'dist/manifest.json',
          to: path.join(__dirname, 'build'),
          force: true,
          transform: function (content, path) {
            return Buffer.from(
              JSON.stringify({
                description: process.env.npm_package_description,
                version: process.env.npm_package_version,
                ...JSON.parse(content.toString()),
              })
            );
          },
        },
      ],
    }),

    // Copy assets
    new CopyPlugin({
      patterns: [
        {
          from: 'src/assets',
          to: path.join(__dirname, 'build/assets'),
          force: true,
        },
      ],
    }),

    // Copy HTML file
    new HtmlPlugin({
      template: path.join(__dirname, 'src', 'pages', 'WalletPopup', 'index.html'),
      filename: 'walletpopup.html',
      chunks: ['walletpopup'],
      cache: false,
    }),

    new HtmlPlugin({
      template: path.join(__dirname, 'src', 'pages', 'Popup', 'index.html'),
      filename: 'popup.html',
      chunks: ['popup'],
      cache: false,
    }),
  ],
};

// Remove 'eval' and minify on production
if (stage === 'development') {
  options.devtool = 'cheap-module-source-map';
} else {
  options.optimization = {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  };
}

module.exports = options;
