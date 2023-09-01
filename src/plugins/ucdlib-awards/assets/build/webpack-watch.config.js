import path from 'path';
import fs from 'fs-extra'
import buildConfig from './config.js';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { fileURLToPath } from 'url';
import corkAppBuild from '@ucd-lib/cork-app-build';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let preview = `${buildConfig.publicDir}/js/dev`;
let previewFolder = path.join(__dirname, preview);
if( fs.existsSync(previewFolder) ) {
  fs.removeSync(previewFolder);
}

let config = corkAppBuild.watch({
  root : __dirname,
  entry : buildConfig.entry,
  preview : preview,
  modern : `${buildConfig.fileName}.js`,
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
//       filename: `../../../public/css/${buildConfig.cssFileName}.css`
//     })
//   ];
// });


export default config;
