# UC Davis Library Awards

This is a platform for accepting, managing, and evaluating submissions to a UC Davis Library awards program, such as the Lang Prize, Aggie Open, and the Graduate Research Prize.

## Local Development

To get the app up and running on your machine:

1. `cd deploy`
2. Make sure you have access to view the `GC_READER_KEY_SECRET`.
3. `./cmds/init-local-dev.sh`
4. `./cmds/build-local-dev.sh`
5. `./cmds/generate-deployment-files.sh`, which will create a directory called `ucdlib-awards-local-dev` will have been created.
6.  Enter it, and run `docker compose up`
