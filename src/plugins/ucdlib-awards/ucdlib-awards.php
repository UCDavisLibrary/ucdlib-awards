<?php
/**
 * Plugin Name: UC Davis Library Awards
 * Plugin URI: https://github.com/UCDavisLibrary/ucdlib-awards
 * Description: Platform for accepting, managing, and evaluating submissions to a UC Davis Library awards program.
 * Author: UC Davis Library Online Strategy
 */

 require_once( __DIR__ . '/includes/main.php' );
$GLOBALS['ucdlibAwards'] =  new UcdlibAwards();
