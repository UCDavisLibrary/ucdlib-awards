<?php

/**
 * @description Loads the JS and CSS assets for this plugin.
 */
class UcdlibAwardsAssets {

    public function __construct( $plugin ){
      $this->plugin = $plugin;
      add_action( 'admin_enqueue_scripts', array( $this, 'enqueueAdminScripts' ) );

      // needs to be on the_post hook so we can check if we're on a page with an active awards form
      add_action( 'the_post', array( $this, 'enqueuePublicScripts' ) );
    }

    /**
     * @description Enqueue the public JS bundle.
     */
    public function enqueuePublicScripts(){

      // only load assets if we're on a page with an active awards form
      if ( !$this->plugin->formsCtl->isApplicationForm && !$this->plugin->formsCtl->isSupportForm ) return;

      // main JS bundle
      $jsSlug = $this->plugin->config::$publicJsSlug;
      $jsUrl = $this->plugin->jsUrl() . ($this->plugin->config->appEnv() === 'prod' ? '/public-dist/' : '/public-dev/') . $jsSlug . '.js';
      wp_enqueue_script(
        $jsSlug,
        $jsUrl,
        [],
        $this->plugin->config->bundleVersion(),
        true
      );

      // pass data to our public JS bundle
      wp_add_inline_script(
        $jsSlug,
        'window.awardFormConfig = ' . json_encode($this->plugin->formsCtl->getAwardFormConfig()),
        'before'
      );
    }

    /**
     * @description Enqueue the admin JS bundle - served on wp-admin pages.
     */
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
