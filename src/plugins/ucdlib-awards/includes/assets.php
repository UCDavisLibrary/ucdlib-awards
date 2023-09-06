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
      $jsSlug = $this->plugin->config::$adminJsSlug;
      $jsUrl = $this->plugin->jsUrl() . ($this->plugin->config->appEnv() === 'prod' ? '/dist/' : '/dev/') . $jsSlug . '.js';
      wp_enqueue_script(
        $jsSlug,
        $jsUrl,
        [],
        $this->plugin->config->bundleVersion(),
        true );
    }
}
