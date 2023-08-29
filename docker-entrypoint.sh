#! /bin/bash

mkdir -p $WP_UPLOADS_DIR
chown -R www-data:www-data $WP_UPLOADS_DIR

mkdir -p $WP_LOG_ROOT
chown -R www-data:www-data $WP_LOG_ROOT

exec /usr/local/bin/docker-entrypoint.sh "$@"
