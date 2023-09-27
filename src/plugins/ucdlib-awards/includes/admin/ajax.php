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
    add_action( 'wp_ajax_' . $this->actions['adminLogs'], [$this, 'logs'] );
    add_action( 'wp_ajax_' . $this->actions['adminRubric'], [$this, 'rubric'] );
  }

  public function rubric(){
    check_ajax_referer( $this->actions['adminRubric'] );
    $response = $this->utils->getResponseTemplate();

    try {
      $this->validateRequest($response);
      $action = $_POST['subAction'];
      if ( $action === 'updateItems' ){
        $payload = json_decode( stripslashes($_POST['data']), true );

        if ( !is_array($payload) || !count($payload) ){
          $response['messages'][] = 'Form is empty. Fill out the form and try submitting again.';
          $this->utils->sendResponse($response);
          return;
        }

        $rubricItems = [];
        $errorMessages = [];
        $errorFields = [];
        $isValid = true;
        foreach ($payload as $i => $payloadItem) {
          $payloadItem['item_order'] = $i;
          $valid = $this->plugin->rubrics->validateRubric($payloadItem);
          if ( !$valid[0] ) {
            $isValid = false;
            $errorMessages = array_merge($errorMessages, $valid[1]['errorMessages']);
            foreach ($valid[1]['errorFields'] as $field => $value) {
              if ( !isset($errorFields[$field]) ) $errorFields[$field] = [];
              $errorFields[$field][] = $i;
            }
          }
          $rubricItems[] = $payloadItem;
        }
        if ( !$isValid ) {
          $response['messages'] = array_unique($errorMessages);
          if ( count($errorFields) ){
            $response['errorFields'] = $errorFields;
          }
          $this->utils->sendResponse($response);
          return;
        }
      }
    } catch (\Throwable $th) {
      error_log('Error in UcdlibAwardsAdminAjax::rubric(): ' . $th->getMessage());
    }

    $this->utils->sendResponse($response);
  }

  public function logs(){
    check_ajax_referer( $this->actions['adminLogs'] );
    $response = $this->utils->getResponseTemplate();

    try {
      $this->validateRequest($response);
      $action = $_POST['subAction'];
      if ( $action === 'getFilters' ){
        $filters = $this->logger->getFilters();
        $response['data'] = ['filters' => $filters];
        $response['success'] = true;
      } else if ( $action === 'query' ){
        $dataIn = json_decode( stripslashes($_POST['data']), true );
        $dataOut = $this->logger->query($dataIn['query']);
        $userIds = $this->logger->extractUserIds($dataOut['results']);
        $dataOut['results'] = $this->logger->getLogTypeLabel($dataOut['results']);
        $users = $this->plugin->users->getByUserIds($userIds);
        $dataOut['users'] = array_map(function($user){
          return $user->record();
        }, $users);
        $response['data'] = $dataOut;
        $response['success'] = true;
      }
    } catch (\Throwable $th) {
      error_log('Error in UcdlibAwardsAdminAjax::logs(): ' . $th->getMessage());
    }
    $this->utils->sendResponse($response);

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
          $response['data'] = ['cycle' => $cycle->recordArray(['applicantCount' => true])];
        } else {
          if ( $data['is_active'] ){
            $this->plugin->cycles->deactivateAll();
          }
          $cycleId = $this->plugin->cycles->create($data);
          $this->logger->logCycleEvent($cycleId, 'create');
          $response['messages'][] = 'Cycle added successfully.';
          $cycle = $this->plugin->cycles->getById($cycleId);
          $cycle = $cycle->recordArray(['applicantCount' => true]);
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
      } else if ( $action == 'getFormFields' ){
        if ( !$data['form_id'] ){
          $response['messages'][] = 'No form specified.';
          $this->utils->sendResponse($response);
          return;
        }
        $fields = $this->plugin->forms->getFormFields( intval($data['form_id']) );
        $response['data'] = ['fields' => $fields];
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

    // create record in user table if one does not exist
    if ( !$this->plugin->users->currentUser()->record() ){
      $success = $this->plugin->users->currentUser()->createFromWpAccount(true);
      if ( !$success ){
        $response['messages'][] = 'Error creating user record.';
        $this->utils->sendResponse($response);
      }
    }
  }

}
