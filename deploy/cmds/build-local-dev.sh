#! /bin/bash

###
# Build images for local development.  They will be tagged with local-dev and are
# meant to be used with $LOCAL_DEV_DIRECTORY/docker-compose.yaml
# Note: these images should never be pushed to docker hub
###

set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $CMDS_DIR

LOCAL_BUILD=true ./build.sh
