/**
 * @description Shared config values for dist and dev builds
 */
const config = {
  fileName: 'ucdlib-awards',
  cssFileName: 'ucdlib-awards',
  entry: '../src/js/index.js',
  jsDevDir: 'js/dev',
  jsPublicDevDir: 'js/public-dev',
  jsDistDir: 'js/dist',
  jsPublicDistDir: 'js/public-dist',
  publicEntry: '../src/js/public-index.js',
  scssEntry: '../src/scss/style.scss',
  publicDir: '../public',
  clientModules: [
    './src/node_modules',
  ],
  loaderOptions: {
    css: {
      loader: 'css-loader',
      options : {
        url: false
      }
    },
    scss: {
      loader: 'sass-loader',
      options: {
        sassOptions: {
          includePaths: [
            "node_modules/@ucd-lib/theme-sass",
            "node_modules/breakpoint-sass/stylesheets",
            "node_modules/sass-toolkit/stylesheets"]
        }
      }
    }
  },
};

export default config;
