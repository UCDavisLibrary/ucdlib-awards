import path from 'path';
import fs from 'fs-extra'
import buildConfig from './config.js';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { fileURLToPath } from 'url';
import corkAppBuild from '@ucd-lib/cork-app-build';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let dist = `${buildConfig.publicDir}/${buildConfig.jsPublicDistDir}`;
let distFolder = path.join(__dirname, dist);
if( fs.existsSync(distFolder) ) {
  fs.removeSync(distFolder);
}

let config = corkAppBuild.dist({
  root : __dirname,
  entry : buildConfig.publicEntry,
  dist: distFolder,
  modern : `${buildConfig.fileName}.js`,
  ie: `${buildConfig.fileName}-ie.js`,
  clientModules : buildConfig.clientModules
});


if( !Array.isArray(config) ) config = [config];

// config.forEach(conf => {

//   // make stylesheet
//   if( !Array.isArray(conf.entry) ) conf.entry = [conf.entry];
//   conf.entry.push(path.join(__dirname, buildConfig.scssEntry));
//   conf.module.rules.push({
//     test: /\.s[ac]ss$/i,
//     use: [
//       { loader: MiniCssExtractPlugin.loader},
//       buildConfig.loaderOptions.css,
//       buildConfig.loaderOptions.scss,
//     ]
//   });

//   conf.plugins = [
//     new MiniCssExtractPlugin({
//       filename: `../../../public/css/${buildConfig.cssFileName}-min.css`
//     })
//   ];
// });


export default config;
