<?php

class UcdlibAwardsEvaluationAjax {

  public function __construct( $evaluation ){
    $this->evaluation = $evaluation;
    $this->plugin = $evaluation->plugin;
    $this->actions = $this->plugin->config::$ajaxActions;
    $this->logger = $this->plugin->logs;
    $this->utils = new UcdlibAwardsAjaxUtils();

    add_action( 'wp_ajax_' . $this->actions['evaluation'], [$this, 'evaluation'] );

  }

  public function evaluation(){
    check_ajax_referer( $this->actions['evaluation'] );
    $response = $this->utils->getResponseTemplate();

    if ( !isset($_POST['subAction']) ){
      $response['messages'][] = 'No subAction specified.';
      $this->utils->sendResponse($response);
    }

    try {
      $action = $_POST['subAction'];
      if ( $action === 'getApplicants' ){

        $cycle = $this->plugin->cycles->activeCycle();
        if ( !$cycle ){
          $response['messages'][] = 'No active cycle found.';
          $this->utils->sendResponse($response);
        }

        $payload = json_decode( stripslashes($_POST['data']), true );
        if ( empty($payload['judge_id']) ){
          $response['messages'][] = 'No judge ID specified.';
          $this->utils->sendResponse($response);
        }
        $judgeId = $payload['judge_id'];

        $currentUser = $this->plugin->users->currentUser();
        if (
          !$currentUser->userIdMatches($judgeId) &&
          !$currentUser->isAdmin()
           ){
          $response['messages'][] = 'You are not authorized to view this data.';
          $this->utils->sendResponse($response);
        }


      }
    } catch (\Throwable $th) {
      error_log('Error in UcdlibAwardsEvaluationAjax::evaluation(): ' . $th->getMessage());
    }
    $this->utils->sendResponse($response);
  }

}
