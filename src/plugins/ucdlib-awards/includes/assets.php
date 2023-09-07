<?php

/**
 * @description Loads the JS and CSS assets for this plugin.
 */
class UcdlibAwardsAssets {

    public function __construct( $plugin ){
      $this->plugin = $plugin;
      add_action( 'admin_enqueue_scripts', array( $this, 'enqueueAdminScripts' ) );
    }

    public function enqueueAdminScripts(){

      // Only load assets on our admin pages
      $page = isset($_GET['page']) ? $_GET['page'] : '';
      $adminSlugs = array_values($this->plugin->award->getAdminMenuSlugs());
      if ( !in_array( $page, $adminSlugs ) ) return;

      // main JS bundle
      $jsSlug = $this->plugin->config::$adminJsSlug;
      $jsUrl = $this->plugin->jsUrl() . ($this->plugin->config->appEnv() === 'prod' ? '/dist/' : '/dev/') . $jsSlug . '.js';
      wp_enqueue_script(
        $jsSlug,
        $jsUrl,
        [],
        $this->plugin->config->bundleVersion(),
        true
      );

      // load proximanova/font awesome fonts from theme assets folder
      $fontsUrl = $this->plugin->cssUrl() . '/fonts.css';
      wp_enqueue_style(
        'ucdlib-awards-fonts',
        $fontsUrl,
        [],
        $this->plugin->config->bundleVersion()
      );
    }
}
