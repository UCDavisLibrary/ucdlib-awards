#! /bin/bash

###
# Main build process to cutting production images
###

VERSION=$1
if [ -z "$VERSION" ]; then
  echo "Please provide a version number"
  exit 1
fi

cork-kube build gcb \
  --project ucdlib-awards \
  --version $VERSION \
  --depth ALL
