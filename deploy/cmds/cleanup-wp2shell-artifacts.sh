#! /bin/bash

###
# Removes artifacts left behind by wp2shell (CVE-2026-63030/CVE-2026-60137)
# exploitation attempts: customize_changeset and request posts created with
# the tool's placeholder post_date fingerprint (2020-01-01 00:00:00), along
# with their revisions/postmeta/term relationships; all oembed_cache posts
# (a pure, auto-regenerating cache with no unique data - on these low-traffic
# sites every entry observed so far has come from exploit activity, so it's
# simpler and more robust to remove them wholesale than to try to match a
# suspicious-activity time window); and any orphaned nav-menu-item postmeta
# left over from partial manual cleanup of injected menu items.
# Usage: ./cmds/cleanup-wp2shell-artifacts.sh <environment>
# environment: required. e.g. lang-prize, aggie-open, grad-prize, local-dev
###

set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $CMDS_DIR

ENVIRONMENT=$1
if [ -z "$ENVIRONMENT" ]; then
  echo "Environment is required, e.g. lang-prize"
  exit 1
fi

DEPLOYMENT_DIR="../compose/ucdlib-awards-$ENVIRONMENT"
if [ ! -d "$DEPLOYMENT_DIR" ]; then
  echo "Deployment directory does not exist: $DEPLOYMENT_DIR"
  exit 1
fi

cd "$DEPLOYMENT_DIR"

docker compose exec -T wordpress sh -c 'cat > /tmp/wp2shell-cleanup.php' <<'PHP'
<?php
global $wpdb;
$ids = $wpdb->get_col( "SELECT ID FROM $wpdb->posts WHERE post_date = '2020-01-01 00:00:00' AND post_type IN ('post','customize_changeset','request')" );
echo "Found " . count( $ids ) . " wp2shell artifact posts.\n";
if ( $ids ) {
    $in = implode( ',', array_map( 'intval', $ids ) );
    $wpdb->query( "DELETE FROM $wpdb->posts WHERE post_parent IN ($in)" );
    $wpdb->query( "DELETE FROM $wpdb->postmeta WHERE post_id IN ($in)" );
    $wpdb->query( "DELETE FROM $wpdb->term_relationships WHERE object_id IN ($in)" );
    $wpdb->query( "DELETE FROM $wpdb->posts WHERE ID IN ($in)" );
    echo "Removed posts: $in\n";
}

$oembed_ids = $wpdb->get_col( "SELECT ID FROM $wpdb->posts WHERE post_type = 'oembed_cache'" );
if ( $oembed_ids ) {
    $oembed_in = implode( ',', array_map( 'intval', $oembed_ids ) );
    $wpdb->query( "DELETE FROM $wpdb->postmeta WHERE post_id IN ($oembed_in)" );
    $wpdb->query( "DELETE FROM $wpdb->posts WHERE ID IN ($oembed_in)" );
    echo "Removed " . count( $oembed_ids ) . " oembed_cache posts.\n";
}

$orphaned = $wpdb->query( "DELETE pm FROM $wpdb->postmeta pm LEFT JOIN $wpdb->posts p ON p.ID = pm.post_id WHERE pm.meta_key LIKE '_menu_item_%' AND p.ID IS NULL" );
echo "Removed $orphaned orphaned nav-menu-item meta rows.\n";
PHP

docker compose exec -T wordpress wp eval-file /tmp/wp2shell-cleanup.php --allow-root

echo "Done. wp2shell artifacts removed from $ENVIRONMENT."
