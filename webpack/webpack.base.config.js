const os = require('os');
const paths = require('./paths');
const webpack = require('webpack');
const WebpackBar = require('webpackbar');
const postcssNormalize = require('postcss-normalize');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const HappyPack = require('happypack');
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });

const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const lessRegex = /\.less$/;
const lessModuleRegex = /\.module\.less$/;

function getWebPackBaseConfig(webpackEnv) {
  const isEnvDevelopment = webpackEnv === 'development';
  const isEnvProduction = webpackEnv === 'production';

  const getStyleLoaders = (cssOptions, preProcessor) => {
    const loaders = [
      isEnvDevelopment && require.resolve('style-loader'),
      isEnvProduction && MiniCssExtractPlugin.loader,
      {
        loader: require.resolve('css-loader'),
        options: cssOptions,
      },
      {
        loader: require.resolve('postcss-loader'),
        options: {
          ident: 'postcss',
          plugins: () => [
            require('postcss-flexbugs-fixes'),
            require('postcss-preset-env')({
              autoprefixer: { flexbox: 'no-2009' },
              stage: 3,
            }),
            postcssNormalize(),
          ],
          sourceMap: true,
        },
      },
    ].filter(Boolean);

    // θΏιεͺζ less-loader
    if (preProcessor) {
      loaders.push({
        loader: preProcessor,
        options: {
          lessOptions: {
            javascriptEnabled: true,
          },
        },
      });
    }
    return loaders;
  };

  return {
    resolve: {
      modules: ['node_modules', paths.appNodeModules],
      alias: {
        '@': paths.appSrc,
      },
    },

    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          include: paths.appSrc,
          exclude: paths.appNodeModules,
          use: 'happypack/loader?id=js',
        },

        // css
        {
          test: cssRegex,
          exclude: cssModuleRegex,
          use: getStyleLoaders({
            importLoaders: 1,
            sourceMap: true,
          }),
          sideEffects: true,
        },
        {
          test: cssModuleRegex,
          use: getStyleLoaders({
            importLoaders: 1,
            sourceMap: true,
            modules: {
              localIdentName: '[local]-[hash:5]',
            },
          }),
        },

        // less
        {
          test: lessRegex,
          exclude: lessModuleRegex,
          use: getStyleLoaders(
            {
              importLoaders: 3,
              sourceMap: isEnvProduction && true,
            },
            'less-loader',
          ),
          sideEffects: true,
        },
        {
          test: lessModuleRegex,
          use: getStyleLoaders(
            {
              importLoaders: 3,
              sourceMap: isEnvProduction && true,
              modules: {
                /**
                 * [path] θ‘¨η€Ίζ ·εΌθ‘¨ηΈε―ΉδΊι‘Ήη?ζ Ήη?ε½ζε¨θ·―εΎ
                 * [name] θ‘¨η€Ίζ ·εΌθ‘¨ζδ»Άεη§°
                 * [local] θ‘¨η€Ίζ ·εΌηη±»εε?δΉεη§°
                 * [hash:length] θ‘¨η€Ί32δ½ηhashεΌ
                 */
                localIdentName: '[local]-[hash:5]',
              },
            },
            'less-loader',
          ),
        },

        {
          test: /\.(woff|eot|ttf)$/,
          loader: 'url-loader',
          options: {
            limit: 10,
            name: 'fonts/[name].[hash:8].[ext]',
          },
        },

        {
          test: [/\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/],
          loader: 'url-loader',
          options: {
            limit: 1024 * 100, // ε½ε€§δΊ100kbζΆεοΌε°ζδ»Άζεε°publicPathδΈ­
            name: 'images/[name].[hash:8].[ext]',
          },
        },
      ],
    },

    plugins: [
      new WebpackBar({ color: 'green', profile: true }),
      new MomentLocalesPlugin(),
      new CaseSensitivePathsPlugin(),
      new webpack.IgnorePlugin({ resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/ }),
      new HappyPack({
        id: 'js',
        loaders: [
          {
            loader: 'babel-loader',
            options: {
              plugins: [isEnvDevelopment && require.resolve('react-refresh/babel')].filter(Boolean),
            },
          },
        ],
        //ε±δΊ«θΏη¨ζ± threadPool: HappyThreadPool δ»£θ‘¨ε±δΊ«θΏη¨ζ± οΌε³ε€δΈͺ HappyPack ε?δΎι½δ½Ώη¨εδΈδΈͺε±δΊ«θΏη¨ζ± δΈ­ηε­θΏη¨ε»ε€ηδ»»ε‘οΌδ»₯ι²ζ­’θ΅ζΊε η¨θΏε€γ
        threadPool: happyThreadPool,
        //εθ?Έ HappyPack θΎεΊζ₯εΏ
        verbose: true,
      }),

      new MiniCssExtractPlugin({
        filename: 'css/[name].[contenthash:8].css',
        chunkFilename: 'css/[name].[contenthash:8].chunk.css',
      }),

      // θΏιζδΈͺεθ?°ε½δΈ: https://blog.csdn.net/vv_bug/article/details/113845376
      new HtmlWebpackPlugin(
        Object.assign(
          {},
          {
            inject: true,
            hash: true,
            template: paths.appHtml,
            favicon: paths.appFavicon,
            templateParameters: {
              isEnvProduction,
            },
          },
          isEnvProduction
            ? {
                minify: {
                  removeComments: true,
                  collapseWhitespace: true,
                  removeRedundantAttributes: true,
                  useShortDoctype: true,
                  removeEmptyAttributes: true,
                  removeStyleLinkTypeAttributes: true,
                  keepClosingSlash: true,
                  minifyJS: true,
                  minifyCSS: true,
                  minifyURLs: true,
                },
            }
            : {},
        ),
      ),
    ],
  };
}
module.exports.getWebPackBaseConfig = getWebPackBaseConfig;
