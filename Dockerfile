# Multistage build args
ARG WP_CORE_VERSION="6.8.2"
ARG NODE_VERSION="20"
ARG THEME_TAG="v4.1.0"
ARG REDIRECTION_ZIP_FILE="redirection-5.5.2.zip"
ARG SMTP_MAILER_ZIP_FILE="smtp-mailer-1.1.20.zip"
ARG FORMINATOR_ZIP_FILE="forminator-pro-1.44.zip"
ARG OPENID_CONNECT_GENERIC_DIR="openid-connect-generic-3.10.0"
ARG OPENID_CONNECT_GENERIC_ZIP_FILE="${OPENID_CONNECT_GENERIC_DIR}.zip"

# Download plugins from Google Cloud Storage
FROM google/cloud-sdk:alpine AS gcloud
RUN mkdir -p /cache
WORKDIR /cache
ARG GC_BUCKET_PLUGINS="wordpress-general/plugins"
ARG REDIRECTION_ZIP_FILE
ARG OPENID_CONNECT_GENERIC_ZIP_FILE
ARG SMTP_MAILER_ZIP_FILE
ARG FORMINATOR_ZIP_FILE

RUN --mount=type=secret,id=google_key gcloud auth activate-service-account --key-file=/run/secrets/google_key
RUN gsutil cp gs://${GC_BUCKET_PLUGINS}/openid-connect-generic/${OPENID_CONNECT_GENERIC_ZIP_FILE} . \
&& gsutil cp gs://${GC_BUCKET_PLUGINS}/smtp-mailer/${SMTP_MAILER_ZIP_FILE} . \
&& gsutil cp gs://${GC_BUCKET_PLUGINS}/forminator-pro/${FORMINATOR_ZIP_FILE} . \
&& gsutil cp gs://${GC_BUCKET_PLUGINS}/redirection/${REDIRECTION_ZIP_FILE} .

# Main build
FROM wordpress:${WP_CORE_VERSION} AS wordpress

# WP Filesystem paths
ARG WP_LOG_ROOT=/var/log/wordpress
ARG WP_SRC_ROOT=/usr/src/wordpress
ARG WP_CONTENT_DIR=$WP_SRC_ROOT/wp-content
ARG WP_THEME_DIR=$WP_CONTENT_DIR/themes
ARG WP_PLUGIN_DIR=$WP_CONTENT_DIR/plugins
ARG WP_UPLOADS_DIR=$WP_CONTENT_DIR/uploads

# WP Filesystem env vars
ENV WP_LOG_ROOT=${WP_LOG_ROOT}
ENV WP_SRC_ROOT=${WP_SRC_ROOT}
ENV WP_UPLOADS_DIR=${WP_UPLOADS_DIR}

WORKDIR $WP_SRC_ROOT

# node setup
ARG NODE_VERSION
RUN apt-get update \
&& apt-get install -y ca-certificates curl gnupg \
&& mkdir -p /etc/apt/keyrings \
&& curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
&& echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_VERSION.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list

# Install Composer Package Manager (theme needs Timber and Twig)
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install debian packages
RUN apt-get update && apt-get install -y unzip git vim nodejs

# WP config
COPY wp-config-docker.php wp-config-docker.php

# Apache config
COPY .htaccess .htaccess

# Switch apache to use wp src
RUN set -eux; \
	find /etc/apache2 -name '*.conf' -type f -exec sed -ri -e "s!/var/www/html!$PWD!g" -e "s!Directory /var/www/!Directory $PWD!g" '{}' +; \
	cp -s wp-config-docker.php wp-config.php

# WP CLI
RUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
&& chmod +x wp-cli.phar \
&& mv wp-cli.phar /usr/local/bin/wp

# Install composer dependencies for theme and plugins
ENV COMPOSER_ALLOW_SUPERUSER=1;
COPY composer.json .
RUN composer install

# get our prebuilt theme
WORKDIR $WP_THEME_DIR
RUN rm -rf */
ARG THEME_TAG
ARG THEME_FILE="ucdlib-theme-wp-${THEME_TAG}.tar.gz"
RUN curl -OL https://github.com/UCDavisLibrary/ucdlib-theme-wp/releases/download/${THEME_TAG}/${THEME_FILE} \
&& tar -xzf ${THEME_FILE} \
&& rm ${THEME_FILE}

# remove default plugins and insert the plugins we downloaded from GCS
ARG OPENID_CONNECT_GENERIC_DIR
ARG OPENID_CONNECT_GENERIC_ZIP_FILE
ARG REDIRECTION_ZIP_FILE
ARG SMTP_MAILER_ZIP_FILE
ARG FORMINATOR_ZIP_FILE
WORKDIR $WP_PLUGIN_DIR
RUN rm -rf */ && rm -f hello.php
COPY src/plugins .
COPY --from=gcloud /cache/${OPENID_CONNECT_GENERIC_ZIP_FILE} .
COPY --from=gcloud /cache/${REDIRECTION_ZIP_FILE} .
COPY --from=gcloud /cache/${SMTP_MAILER_ZIP_FILE} .
COPY --from=gcloud /cache/${FORMINATOR_ZIP_FILE} .
RUN unzip ${OPENID_CONNECT_GENERIC_ZIP_FILE} && rm ${OPENID_CONNECT_GENERIC_ZIP_FILE} \
&& unzip ${SMTP_MAILER_ZIP_FILE} && rm ${SMTP_MAILER_ZIP_FILE} \
&& unzip ${FORMINATOR_ZIP_FILE} && rm ${FORMINATOR_ZIP_FILE} \
&& unzip ${REDIRECTION_ZIP_FILE} && rm ${REDIRECTION_ZIP_FILE}
RUN mv $OPENID_CONNECT_GENERIC_DIR openid-connect-generic

# Retrieve any custom plugins from github
RUN git -c advice.detachedHead=false \
	clone https://github.com/UCDavisLibrary/forminator-theme-styles.git \
	--branch v1.2.0 --single-branch --depth 1

# Copy our custom awards plugins
COPY src/plugins/aggie-open aggie-open
COPY src/plugins/graduate-student-prize graduate-student-prize
COPY src/plugins/lang-prize lang-prize
COPY src/plugins/ucdlib-awards ucdlib-awards

# build js
RUN cd ucdlib-awards/assets \
&& npm install \
&& npm run dist \
&& npm run dist-public \
&& rm -rf node_modules

# Back to site root so wordpress can do the rest of its thing
WORKDIR $WP_SRC_ROOT

# override docker entry point, so we can ensure apache can write to our volumes
COPY docker-entrypoint.sh /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]

# start apache
CMD ["apache2-foreground"]
