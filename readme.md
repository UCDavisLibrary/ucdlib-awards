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


## Maintenance
Most maintenance tasks (adding judges, setting up a new cycle, changing automated emails, etc) can be performed by any site admin via the GUI. Documentation can be found in the [ITIS share drive](https://drive.google.com/drive/folders/1zIPVWnY__DCTLBaRyEYrDT1sZVOsssQF).

However, some tasks do require programmer intervention:

**Updating Supporter Email** - If an applicant enters in the wrong supporter email address in their application submission, you do not have to delete the submission and ask the applicant to resubmit. Instead:
1. bash into the backup container: `docker compose exec backup bash`
2. Go to wp install directory: `cd /usr/src/wordpress`
3. Run a php file using the wp cli: `wp eval-file --allow-root /deploy-utils/wp-scripts/update-supporter.php <applicantEmail> <badSupporterEmail> <goodSupporterEmail>`

