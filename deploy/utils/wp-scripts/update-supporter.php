<?php

// updates the supporter email for an applicant in the current cycle
// e.g. if the applicant entered the wrong email address
if ( $args && count($args) == 3 ) {
  $applicantEmail = $args[0];
  $currentSupporterEmail = $args[1];
  $newSupporterEmail = $args[2];

  $cycle=$GLOBALS['ucdlibAwards']->cycles->activeCycle();
  $r = $cycle->updateApplicantSupporter($applicantEmail, $currentSupporterEmail, $newSupporterEmail);
  if ( $r['success'] ) {
    echo "Supporter updated for $applicantEmail\n";
  } else {
    echo "Error updating supporter for $applicantEmail: {$r['message']}\n";
  }
} else {
  echo "Usage: wp update-supporter <applicant-email> <current-supporter-email> <new-supporter-email>\n";
  exit;
}
