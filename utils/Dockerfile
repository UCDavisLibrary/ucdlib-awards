ARG BASE_IMAGE
FROM ${BASE_IMAGE}

RUN apt-get update && apt-get install -y apt-transport-https ca-certificates gnupg curl cron procps

# Prep work for gsutil
RUN mkdir -p /usr/share/keyrings \
    && curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg \
       | gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg
RUN echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" \
    > /etc/apt/sources.list.d/google-cloud-sdk.list

# Install gcloud/gsutils
RUN apt-get update && apt-get install -y mariadb-client \
  wait-for-it google-cloud-sdk

RUN mkdir -p /deploy-utils/data
WORKDIR /deploy-utils
COPY wp-scripts wp-scripts
COPY tail.sh .

# Backup
RUN mkdir data/backup
COPY backup backup
COPY backup/cron /etc/cron.d/backup
RUN chmod 0644 /etc/cron.d/backup

# Init
RUN mkdir data/init
COPY init init

ENTRYPOINT [ "bash", "-c" ]
CMD ["echo 'Use command arg to specify a script to run.'"]
