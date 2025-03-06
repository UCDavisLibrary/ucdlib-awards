#! /bin/bash

###
# npm install and build client dev bundles
###

set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $CMDS_DIR/../../src/plugins/ucdlib-awards/assets
npm install
npm run create-dev-bundle
npm run create-public-dev-bundle
