<?php

require_once( __DIR__ . '/ajax.php' );
require_once( __DIR__ . '/menu.php' );

/**
 * @description Controller for admin functionality
 */
class UcdlibAwardsAdmin {

  public $plugin;
  public $menu;
  public $ajax;

  public function __construct( $plugin ){
    $this->plugin = $plugin;
    $this->menu = new UcdlibAwardsAdminMenu( $this );
    $this->ajax = new UcdlibAwardsAdminAjax( $this );
  }
}
