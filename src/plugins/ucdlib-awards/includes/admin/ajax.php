<?php

class UcdlibAwardsAdminAjax {

  public function __construct( $admin ){
    $this->admin = $admin;
    $this->plugin = $admin->plugin;
    $this->actions = $this->plugin->config::$ajaxActions;
    $this->utils = new UcdlibAwardsAjaxUtils();

    add_action( 'wp_ajax_' . $this->actions['adminCycles'], [$this, 'cycles'] );
  }

  public function cycles(){
    check_ajax_referer( $this->actions['adminCycles'] );
    $response = $this->utils->getResponseTemplate();

    try {

      if ( !$this->plugin->users->currentUser() || !$this->plugin->users->currentUser()->isAdmin() ){
        $response['messages'][] = 'You do not have permission to perform this action.';
        $this->utils->sendResponse($response);
      }

      if ( !isset($_POST['subAction']) ){
        $response['messages'][] = 'No subAction specified.';
        $this->utils->sendResponse($response);
      }
      $data = json_decode( stripslashes($_POST['data']), true );
      $action = $_POST['subAction'];
      if ( $action == 'edit' || $action == 'add' ){
        $valid = $this->plugin->cycles->validateCycle($data);
        if ( !$valid[0] ) {
          $response['messages'] = $valid[1]['errorMessages'];
          if ( count($valid[1]['errorFields']) ){
            $response['errorFields'] = $valid[1]['errorFields'];
          }
          $this->utils->sendResponse($response);
        }
      }


    } catch (\Throwable $th) {
      // log error to wordpress debug.log
      error_log('Error in UcdlibAwardsAdminAjax::cycles(): ' . $th->getMessage());

    }

    $this->utils->sendResponse($response);

  }

}
