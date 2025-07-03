<?php

// updates a form upload for an applicant in the current cycle with a different file in the media library
// e.g. if the applicant entered the wrong file in their application submission, and you dont want to delete the submission and ask the applicant to resubmit.
if ( $args && count($args) == 3 ) {
  $applicantEmail = $args[0];
  $uploadFieldId = $args[1];
  $mediaLibraryUrl = $args[2];

  $cycle=$GLOBALS['ucdlibAwards']->cycles->activeCycle();
  $r = $cycle->updateUploadField($applicantEmail, $uploadFieldId, $mediaLibraryUrl, '/uploads');
  if ( $r['success'] ) {
    echo "Upload $uploadFieldId updated for $applicantEmail\n";
  } else {
    echo "Error updating upload for $applicantEmail: {$r['message']}\n";
  }
} else {
  echo "Usage: wp update-upload <applicant-email> <upload-file-id> <media-library-url>\n";
  exit;
}
