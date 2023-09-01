<?php
require_once( __DIR__ . '/admin/main.php' );
require_once( __DIR__ . '/auth.php' );
require_once( __DIR__ . '/award-loader.php' );
require_once( __DIR__ . '/users/users.php' );
require_once( __DIR__ . '/utils/config.php' );
require_once( __DIR__ . '/utils/db-tables.php' );
require_once( __DIR__ . '/utils/icons.php' );
require_once( __DIR__ . '/utils/timber.php' );

/**
 * @description Main plugin class.
 */
class UcdlibAwards {

  public function __construct(){
    $this->config = new UcdlibAwardsConfig();
    $this->hookSlug = $this->config::$pluginHookSlug;
    $this->pluginSlug = $this->config::$pluginSlug;
    $this->twigNamespace = $this->config::$twigNamespace;
    $this->award = new UcdlibAwardsAwardAbstract();
    $this->entryPoint = plugin_dir_path( __DIR__ ) . $this->pluginSlug .'.php';

    register_activation_hook($this->entryPoint, [$this, '_onActivation'] );

    add_action( 'plugins_loaded', [$this, 'loadModules'] );
    add_filter( 'timber/locations', array($this, 'add_timber_locations') );

  }

  /**
   * @description Loads the various modules of the plugin.
   */
  public function loadModules(){
    $this->loadAward();

    $this->users = new UcdlibAwardsUsers( $this );

    $this->auth = new UcdlibAwardsAuth( $this );
    $this->admin = new UcdlibAwardsAdmin( $this );
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

  /**
   * Adds twig files under the @ucdlib-awards namespace
   */
  public function add_timber_locations($paths){
    $paths[$this->twigNamespace] = array(WP_PLUGIN_DIR . "/" . $this->pluginSlug . '/views');
    return $paths;
  }
}
