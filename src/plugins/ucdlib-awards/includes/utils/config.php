<?php

class UcdlibAwardsConfig {

  public static $pluginVersion = '1.0.0';

  public static $pluginSlug = 'ucdlib-awards';
  public static $pluginHookSlug = 'ucdlib_awards';
  public static $twigNamespace = 'ucdlib-awards';
  public static $adminJsSlug = 'ucdlib-awards';

  public static $urlQueryParams = [
    'cycle' => 'cycle'
  ];

  /**
   * @description Get App env (dev or prod) - determines what assets to load
   */
  protected $appEnv;
  public function appEnv(){
    if ( !empty( $this->appEnv ) ){
      return $this->appEnv;
    }
    $this->appEnv = getenv('APP_ENV') ?: 'prod';
    return $this->appEnv;
  }

  /**
   * @description Get App version - Set in config.sh and set as env in dockerfile
   */
  protected $appVersion;
  public function appVersion(){
    if ( !empty( $this->appVersion ) ){
      return $this->appVersion;
    }
    $this->appVersion = getenv('APP_VERSION');
    return $this->appVersion;
  }

  /**
   * @description Get App bundle version - Breaks browser cache when app version changes, or in local dev
   */
  protected $bundleVersion;
  public function bundleVersion(){
    if ( !empty( $this->bundleVersion ) ){
      return $this->bundleVersion;
    }
    $appVersion = $this->appVersion();
    if ( substr_compare($appVersion, '-1', -strlen('-1')) === 0 ) {
      $this->bundleVersion = (new DateTime())->getTimestamp();
    } else {
      $this->bundleVersion = $appVersion;
    }
    return $this->bundleVersion;
  }

}
