#! /bin/bash

##
# Generate docker-compose deployment and local development files based on
# config.sh parameters
##

set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $CMDS_DIR/../templates

source ../config.sh

# generate main dc file
content=$(cat deployment.yaml)
for key in $(compgen -v); do
  if [[ $key == "COMP_WORDBREAKS" || $key == "content" || $key == "GOOGLE_KEY_FILE_CONTENT" ]]; then
    continue;
  fi
  escaped=$(printf '%s\n' "${!key}" | sed -e 's/[\/&]/\\&/g')
  content=$(echo "$content" | sed "s/{{$key}}/${escaped}/g")
done
echo "$content" > ../docker-compose.yaml

# cloud build file
content=$(cat cloudbuild.yaml)
for key in $(compgen -v); do
  if [[ $key == "COMP_WORDBREAKS" || $key == "content" || $key == "GOOGLE_KEY_FILE_CONTENT" ]]; then
    continue;
  fi
  escaped=$(printf '%s\n' "${!key}" | sed -e 's/[\/&]/\\&/g')
  content=$(echo "$content" | sed "s/{{$key}}/${escaped}/g")
done
echo "$content" > ../gcloud/cloudbuild.yaml

# generate local development dc file
content=$(cat local-dev.yaml)
LOCAL_BUILD=true source ../config.sh
for key in $(compgen -v); do
  if [[ $key == "COMP_WORDBREAKS" || $key == "content" || $key == "GOOGLE_KEY_FILE_CONTENT" ]]; then
    continue;
  fi
  escaped=$(printf '%s\n' "${!key}" | sed -e 's/[\/&]/\\&/g')
  content=$(echo "$content" | sed "s/{{$key}}/${escaped}/g")
done
if [ ! -d "../$LOCAL_DEV_DIRECTORY" ]; then
  mkdir ../$LOCAL_DEV_DIRECTORY
  touch ../$LOCAL_DEV_DIRECTORY/.env
fi

echo "$content" > ../$LOCAL_DEV_DIRECTORY/docker-compose.yaml
