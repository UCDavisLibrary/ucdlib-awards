#! /bin/bash

###
# Make sure everything is in place for local development. Should only need to run once.
###

set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $CMDS_DIR/..

source ./config.sh

touch ./gc-writer-key.json
touch ./gc-reader-key.json

./cmds/get-reader-key.sh
./cmds/get-writer-key.sh
