<?php

// due to a change in forminator integration api, we need to update the meta_key for all rows in wp_frmt_form_entry_meta
global $wpdb;

// get number of rows that will be affected
$sql = "
  SELECT COUNT(*)
  FROM wp_frmt_form_entry_meta
  WHERE meta_key LIKE 'forminator_addon_ucdlib-awards_%';";
$count = $wpdb->get_var($sql);

if ( !$count ) {
  echo "No rows to update\n";
  return;
} else {
  echo "Updating $count rows\n";
}

$sql = "
  UPDATE wp_frmt_form_entry_meta
  SET meta_key = REPLACE(meta_key, 'forminator_addon_ucdlib-awards_', 'forminator_addon_ucdlibawards_')
  WHERE meta_key LIKE 'forminator_addon_ucdlib-awards_%';";
$wpdb->query($sql);

echo "Done\n";

