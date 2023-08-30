<?php
/**
 * Plugin Name: Graduate Student Prize
 * Plugin URI: https://github.com/UCDavisLibrary/ucdlib-awards
 * Description: Customizations for the UC Davis Library Awards platform.
 * Author: UC Davis Library Online Strategy
 */

add_filter( 'ucdlib_awards/awards_loader', function($awards){
  require_once( __DIR__ . '/includes/main.php' );
  $awards[] = new GraduateStudentPrize();
  return $awards;
}, 10 );
