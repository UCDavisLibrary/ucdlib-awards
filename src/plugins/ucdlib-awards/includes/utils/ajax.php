<?php

require_once( __DIR__ . '/config.php' );

class UcdlibAwardsAjaxUtils {
  public function sendResponse($response, $statusCode=null, $options=0){
    if ( !$response['success'] && empty($response['messages']) ){
      $response['messages'][] = 'An unknown error occurred. Please try again.';
    }
    wp_send_json( $response, $statusCode, $options);
  }

  /**
   * @description The json response object
   * Properties include:
   * success (boolean) - Whether the request was successful
   * data (object) - The data returned by the request (if any)
   * messages (array) - Any messages to be displayed to the user, usually displayed at top of the form
   * errorFields (associative array) - Any fields that have errors, usually displayed next to the field
   *
   */
  public function getResponseTemplate(){
    return [
      'success' => false,
      'data' => null,
      'messages' => [],
      'errorFields' => (object) array()
    ];
  }

  /**
   * @description Should be passed to an element's wpAjax property, so it can use the wp-ajax.js controller
   */
  public function getAjaxElementProperty($action){
    $action = UcdlibAwardsConfig::$ajaxActions[$action];
    return [
      'url' => admin_url( 'admin-ajax.php' ),
      'nonce' => wp_create_nonce( $action ),
      'action' => $action,
      'responseTemplate' => $this->getResponseTemplate()
    ];
  }
}
