<?php
require_once( __DIR__ . '/admin/main.php' );
require_once( __DIR__ . '/evaluation/main.php' );
require_once( __DIR__ . '/assets.php' );
require_once( __DIR__ . '/auth.php' );
require_once( __DIR__ . '/award-loader.php' );
require_once( __DIR__ . '/forms/main.php' );
require_once( __DIR__ . '/models/cycles/cycles.php' );
require_once( __DIR__ . '/models/rubrics/rubrics.php' );
require_once( __DIR__ . '/models/users/users.php' );
require_once( __DIR__ . '/models/forms.php' );
require_once( __DIR__ . '/models/logs.php' );
require_once( __DIR__ . '/utils/ajax.php' );
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
    $this->version = $this->config::$pluginVersion;
    $this->hookSlug = $this->config::$pluginHookSlug;
    $this->pluginSlug = $this->config::$pluginSlug;
    $this->twigNamespace = $this->config::$twigNamespace;
    $this->award = new UcdlibAwardsAwardAbstract();
    $this->entryPoint = plugin_dir_path( __DIR__ ) . $this->pluginSlug .'.php';

    register_activation_hook($this->entryPoint, [$this, '_onActivation'] );

    add_action( 'plugins_loaded', [$this, 'loadModules'], 2 );
    add_filter( 'timber/locations', array($this, 'add_timber_locations') );

  }

  /**
   * @description Loads the various modules of the plugin.
   * Hooked onto the plugins_loaded action, since this depends on several other plugins.
   */
  public function loadModules(){
    $this->loadAward();

    // models
    $this->users = new UcdlibAwardsUsers( $this );
    $this->cycles = new UcdlibAwardsCycles( $this );
    $this->forms = new UcdlibAwardsForms( $this );
    $this->logs = new UcdlibAwardsLogs( $this );
    $this->rubrics = new UcdlibAwardsRubrics( $this );

    // modules/controllers
    $this->auth = new UcdlibAwardsAuth( $this );
    $this->admin = new UcdlibAwardsAdmin( $this );
    $this->assets = new UcdlibAwardsAssets( $this );
    $this->evaluation = new UcdlibAwardsEvaluation( $this );
    $this->formsCtl = new UcdlibAwardsFormsMain( $this );
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

  /**
   * @description Get the URL for this plugin
   */
  protected $url;
  public function url(){
    if ( !empty( $this->url ) ){
      return $this->url;
    }
    $this->url = trailingslashit( plugins_url() ) . $this->pluginSlug;
    return $this->url;
  }

  /**
   * @description Get the URL for this plugin's public assets
   */
  protected $assetsUrl;
  public function assetsUrl(){
    if ( !empty( $this->assetsUrl ) ){
      return $this->assetsUrl;
    }
    $this->assetsUrl = $this->url() . '/assets/public';
    return $this->assetsUrl;
  }

  /**
   * @description Get the URL for this plugin's js assets
   */
  protected $jsUrl;
  public function jsUrl(){
    if ( !empty( $this->jsUrl ) ){
      return $this->jsUrl;
    }
    $this->jsUrl = $this->assetsUrl() . '/js';
    return $this->jsUrl;
  }

  protected $cssUrl;
  public function cssUrl(){
    if ( !empty( $this->cssUrl ) ){
      return $this->cssUrl;
    }
    $this->cssUrl = $this->assetsUrl() . '/css';
    return $this->cssUrl;
  }
}
