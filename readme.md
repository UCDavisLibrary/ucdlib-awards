# UC Davis Library Awards

This is a platform for accepting, managing, and evaluating submissions to a UC Davis Library awards program, such as the Lang Prize, Aggie Open, and the Graduate Research Prize.

## Local Development

To get the app up and running on your machine:

1. `cd deploy`
2. Run `./cmds/init-local-dev.sh`
3. Modify your env file that was downloaded to `compose/ucdlib-awards-local-dev` to match the instance you are running
4. Build you local images with `./cmds/build-local-dev.sh sandbox`
5.  Enter the local dev compose directory, and run `docker compose up -d` to bring up your local cluster


## Maintenance
Most maintenance tasks (adding judges, setting up a new cycle, changing automated emails, etc) can be performed by any site admin via the GUI. Documentation can be found in the [ITIS share drive](https://drive.google.com/drive/folders/1zIPVWnY__DCTLBaRyEYrDT1sZVOsssQF).

However, some tasks do require programmer intervention:

**Updating Supporter Email** - If an applicant enters in the wrong supporter email address in their application submission, you do not have to delete the submission and ask the applicant to resubmit. Instead:
1. bash into the backup container: `docker compose exec backup bash`
2. Go to wp install directory: `cd /usr/src/wordpress`
3. Run a php file using the wp cli: `wp eval-file --allow-root /deploy-utils/wp-scripts/update-supporter.php <applicantEmail> <badSupporterEmail> <goodSupporterEmail>`

