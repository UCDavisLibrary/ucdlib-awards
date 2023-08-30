<?php

require_once( __DIR__ . '/auth.php' );
require_once( __DIR__ . '/award-loader.php' );

class UcdlibAwards {

  public function __construct(){
    $this->hookSlug = 'ucdlib_awards';
    $this->award = new UcdlibAwardsAwardAbstract();
    add_action( 'plugins_loaded', [$this, 'loadModules'] );

  }

  /**
   * @description Loads the various modules of the plugin.
   */
  public function loadModules(){
    $this->auth = new UcdlibAwardsAuth( $this );
    $this->awardLoader = new UcdlibAwardsAwardLoader( $this );
    if ( $this->awardLoader->award ) {
      $this->award = $this->awardLoader->award;
    }
  }
}
