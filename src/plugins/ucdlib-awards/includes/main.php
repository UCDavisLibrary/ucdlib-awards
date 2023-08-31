<?php

require_once( __DIR__ . '/auth.php' );
require_once( __DIR__ . '/award-loader.php' );
require_once( __DIR__ . '/utils/db-tables.php' );

/**
 * @description Main plugin class.
 */
class UcdlibAwards {

  public function __construct(){
    $this->hookSlug = 'ucdlib_awards';
    $this->pluginSlug = 'ucdlib-awards';
    $this->award = new UcdlibAwardsAwardAbstract();
    $this->entryPoint = plugin_dir_path( __DIR__ ) . $this->pluginSlug .'.php';

    register_activation_hook($this->entryPoint, [$this, '_onActivation'] );

    add_action( 'plugins_loaded', [$this, 'loadModules'] );


  }

  /**
   * @description Loads the various modules of the plugin.
   */
  public function loadModules(){
    $this->loadAward();

    $this->auth = new UcdlibAwardsAuth( $this );
  }

  /**
   * @description Load the individual award plugin.
   *  i.e. Lang Prize, etc.
   */
  public function loadAward(){
    $this->awardLoader = new UcdlibAwardsAwardLoader( $this );
    if ( $this->awardLoader->award ) {
      $this->award = $this->awardLoader->award;
    }
  }

  /**
   * @description Callback for this plugin activation.
   */
  public function _onActivation(){
    UcdlibAwardsDbTables::install_database_tables();
  }
}
