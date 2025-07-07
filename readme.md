# UC Davis Library Awards

This is a platform for accepting, managing, and evaluating submissions to a UC Davis Library awards program, such as the Lang Prize, Aggie Open, and the Graduate Research Prize.

## Local Development

To get the app up and running on your machine:

1. `cd deploy`
2. Run `./cmds/init-local-dev.sh`
3. Modify your env file that was downloaded to `compose/ucdlib-awards-local-dev` to match the instance you are running
4. Build you local images with `./cmds/build-local-dev.sh sandbox`
5.  Enter the local dev compose directory, and run `docker compose up -d` to bring up your local cluster


## Deployment
1. Create a PR into main and merge
2. Pull most recent changes on main and tag your release: `git tag v1.2.3` `git push origin --tags`
3. Update build information in [cork-build-registry](https://github.com/ucd-library/cork-build-registry)
4. Build image with `deploy/cmds/build.sh <tag>`
5. Update image version in relevant files in `deploy/compose` and push changes
6. ssh into `awards.library.ucdavis.edu`, and go to `opt/ucdlib-awards/deploy/compose`
7. Go to an award, and run `git pull` and then `docker compose pull`
8. Take down cluster with `docker compose down`, and bring it back up with `docker compose up -d`. There will be a brief service outage.


## Maintenance
Most maintenance tasks (adding reviewers, setting up a new cycle, changing automated emails, etc) can be performed by any site admin via the GUI. Documentation can be found in the [ITIS share drive](https://drive.google.com/drive/folders/1zIPVWnY__DCTLBaRyEYrDT1sZVOsssQF).

However, some tasks do require programmer intervention by running a php file with the wp cli.
1. bash into the backup container: `docker compose exec backup bash`
2. Go to wp install directory: `cd /usr/src/wordpress`

Then run one of the scripts listed below:

### Updating Supporter Email
If an applicant enters in the wrong supporter email address in their application submission, you do not have to delete the submission and ask the applicant to resubmit. Instead:

Run `wp eval-file --allow-root /deploy-utils/wp-scripts/update-supporter.php <applicantEmail> <badSupporterEmail> <goodSupporterEmail>`

### Updating a file upload
If an applicant uploads a wrong file (like a bibliography) or needs to update it, you can replace the file with:
`wp eval-file --allow-root /deploy-utils/wp-scripts/update-upload.php <applicantEmail> <uploadFieldId> <mediaLibraryUrl>`

- You can get the applicantEmail by looking at the `applicants` property of the `ucdlib-awards-applicants-display` element
- The `uploadFieldId` can be found in the form editing interface for the field.
- `mediaLibraryUrl` is the file URL for a document that you upload via the WP media library interface. It will be deleted from the media library after it successfully replaces the original document

