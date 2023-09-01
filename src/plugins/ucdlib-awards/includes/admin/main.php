<?php

require_once( __DIR__ . '/menu.php' );

/**
 * @description Controller for admin functionality
 */
class UcdlibAwardsAdmin {

  public function __construct( $plugin ){
    $this->plugin = $plugin;
    $this->menu = new UcdlibAwardsAdminMenu( $this );
  }
}
