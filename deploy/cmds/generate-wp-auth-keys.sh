#! /bin/bash

###
# Generates fresh random values for the 8 WordPress auth key/salt env vars
# (WORDPRESS_AUTH_KEY, WORDPRESS_SECURE_AUTH_KEY, etc - see wp-config-docker.php).
# Prints them in .env format for manual copy/paste. Does not write to any
# .env file itself.
# Usage: ./cmds/generate-wp-auth-keys.sh
###

set -e

for key in AUTH_KEY SECURE_AUTH_KEY LOGGED_IN_KEY NONCE_KEY AUTH_SALT SECURE_AUTH_SALT LOGGED_IN_SALT NONCE_SALT; do
  val=$(openssl rand -base64 64 | tr -d '\n')
  echo "WORDPRESS_${key}='${val}'"
done
