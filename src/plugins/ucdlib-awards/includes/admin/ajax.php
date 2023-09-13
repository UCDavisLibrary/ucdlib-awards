<?php

class UcdlibAwardsAdminAjax {

  public function __construct( $admin ){
    $this->admin = $admin;
    $this->plugin = $admin->plugin;
    $this->actions = $this->plugin->config::$ajaxActions;
    $this->logger = $this->plugin->logs;
    $this->utils = new UcdlibAwardsAjaxUtils();

    add_action( 'wp_ajax_' . $this->actions['adminCycles'], [$this, 'cycles'] );
    add_action( 'wp_ajax_' . $this->actions['adminGeneral'], [$this, 'general'] );
  }

  /**
   * @description Admin actions for general admin page - aka page header/template.
   */
  public function general(){
    check_ajax_referer( $this->actions['adminGeneral'] );
    $response = $this->utils->getResponseTemplate();

    try {
      $this->validateRequest($response);
      $action = $_POST['subAction'];
      if ( $action === 'getCycles' ){
        $cycles = $this->plugin->cycles->getRecordArrays();
        $response['data'] = ['cycles' => $cycles];
        $response['success'] = true;
      }
    } catch (\Throwable $th) {
      error_log('Error in UcdlibAwardsAdminAjax::cycles(): ' . $th->getMessage());
    }
    $this->utils->sendResponse($response);
  }

  /**
   * @description Admin actions for application cycle management page.
   */
  public function cycles(){
    check_ajax_referer( $this->actions['adminCycles'] );
    $response = $this->utils->getResponseTemplate();

    try {
      $this->validateRequest($response);
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
          return;
        }
        if ( $action == 'edit' ){
          $cycleId = $data['cycle_id'];
          $cycle = $this->plugin->cycles->getById($cycleId);
          if ( !$cycle->isActive() && $data['is_active'] ){
            $this->plugin->cycles->deactivateAll();
          }
          $cycle->update($data);
          $this->logger->logCycleEvent($cycleId, 'update');
          $response['messages'][] = 'Cycle updated successfully.';
          $response['data'] = ['cycle' => $cycle->recordArray()];
        } else {
          if ( $data['is_active'] ){
            $this->plugin->cycles->deactivateAll();
          }
          $cycleId = $this->plugin->cycles->create($data);
          $this->logger->logCycleEvent($cycleId, 'create');
          $response['messages'][] = 'Cycle added successfully.';
          $cycle = $this->plugin->cycles->getById($cycleId);
          $cycle = $cycle->recordArray();
          $response['data'] = ['cycle' => $cycle];
        }
        $response['success'] = true;
      } else if ( $action == 'delete' ){
        if ( empty($data['cycle_id']) ){
          $response['messages'][] = 'No cycle specified.';
          $this->utils->sendResponse($response);
          return;
        }
        $cycle = $this->plugin->cycles->getById($data['cycle_id']);
        if ( !$cycle ){
          $response['messages'][] = 'Cycle not found.';
          $this->utils->sendResponse($response);
          return;
        }
        if ( $cycle->isActive() ){
          $response['messages'][] = 'Cannot delete an active cycle. Make another cycle active, and then try again.';
          $this->utils->sendResponse($response);
          return;
        }
        $titleConfirm = isset($data['title_confirm']) ? $data['title_confirm'] : '';
        if ( $titleConfirm !== $cycle->title() ){
          $response['messages'][] = 'The title you entered does not match the cycle title. Please try again.';
          $response['errorFields']['title_confirm'] = true;
          $this->utils->sendResponse($response);
          return;
        }
        $cycle->delete();
        $this->logger->logCycleEvent($cycle->cycleId, 'delete');

        $response['success'] = true;
      }


    } catch (\Throwable $th) {
      error_log('Error in UcdlibAwardsAdminAjax::cycles(): ' . $th->getMessage());
    }

    $this->utils->sendResponse($response);

  }

  public function validateRequest($response){
    if ( !$this->plugin->users->currentUser() || !$this->plugin->users->currentUser()->isAdmin() ){
      $response['messages'][] = 'You do not have permission to perform this action.';
      $this->utils->sendResponse($response);
    }

    if ( !isset($_POST['subAction']) ){
      $response['messages'][] = 'No subAction specified.';
      $this->utils->sendResponse($response);
    }
  }

}
