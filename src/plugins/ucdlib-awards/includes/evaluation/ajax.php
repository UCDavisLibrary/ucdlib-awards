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
      $cycle = $this->plugin->cycles->activeCycle();
      if ( !$cycle ){
        $response['messages'][] = 'No active cycle found.';
        $this->utils->sendResponse($response);
      }
      $payload = json_decode( stripslashes($_POST['data']), true );
      $action = $_POST['subAction'];
      if ( $action === 'getApplicants' ){
        $response = $this->getApplicants($response, $cycle, $payload);
      } else if ( $action === 'getApplicationEntry' ){
        $response = $this->getApplicationEntry($response, $cycle, $payload);
      } else if ( $action === 'setConflictOfInterest' ){
        $response = $this->setConflictOfInterest($response, $cycle, $payload);
      } else if ( $action === 'getScores' ){
        $response = $this->getScores($response, $cycle, $payload);
      } else if ( $action === 'setScores' ){
        $response = $this->setScores($response, $cycle, $payload);
      } else {
        $response['messages'][] = 'Invalid subAction specified.';
      }
    } catch (\Throwable $th) {
      error_log('Error in UcdlibAwardsEvaluationAjax::evaluation(): ' . $th->getMessage());
    }
    $this->utils->sendResponse($response);
  }

  public function getScores($response, $cycle, $payload){
    $this->doAuth($response, $cycle, $payload);
    $cycleId = $cycle->cycleId;

    if ( empty($payload['applicant_id']) ){
      $response['messages'][] = 'No applicant ID specified.';
      $this->utils->sendResponse($response);
    }
    $applicantId = $payload['applicant_id'];
    $judgeId = $payload['judge_id'];
    $rubric = $cycle->rubric();
    $scores = $rubric->getScoresByUser($judgeId, $applicantId, false);
    $response['data'] = [
      'scores' => $scores
    ];
    $response['success'] = true;
    return $response;
  }

  public function setScores($response, $cycle, $payload){
    $this->doAuth($response, $cycle, $payload, true);
    $cycleId = $cycle->cycleId;
    $rubric = $cycle->rubric();

    $submitActions = ['save', 'finalize'];
    if ( empty($payload['submit_action']) || !in_array($payload['submit_action'], $submitActions) ){
      $response['messages'][] = 'No submit action specified.';
      $this->utils->sendResponse($response);
    }
    $submitAction = $payload['submit_action'];

    $applicant = $this->getApplicant($response, $cycle, $payload);
    $judge = $this->getJudge($response, $cycle, $payload);

    $assignedJudges = $applicant->assignedJudgeIds($cycleId)['assigned'];
    if ( !in_array($payload['judge_id'], $assignedJudges) ){
      $response['messages'][] = 'Judge is not assigned to this applicant.';
      $this->utils->sendResponse($response);
    }

    $applicationStatus = $applicant->applicationStatus($cycleId);
    if ( in_array($payload['judge_id'], $applicationStatus['conflictOfInterestJudgeIds']) ){
      $response['messages'][] = 'Judge has a potential conflict of interest with applicant.';
      $this->utils->sendResponse($response);
    }
    if ( in_array($payload['judge_id'], $applicationStatus['evaluatedJudgeIds']) ){
      $response['messages'][] = 'Judge has already evaluated this applicant.';
      $this->utils->sendResponse($response);
    }

    if ( empty($payload['scores']) || !is_array($payload['scores']) ){
      $response['messages'][] = 'No scores submitted.';
      $this->utils->sendResponse($response);
    }

    foreach ($payload['scores'] as $rubricItemId => $itemScores) {
      if (!in_array($rubricItemId, $rubric->itemIds())){
        $response['messages'][] = 'Invalid rubric item ID submitted - ' . $rubricItemId;
      }
      $rubricItem = $rubric->getItemById($rubricItemId);
      if ( !is_array($itemScores) || !isset($itemScores['score']) ){
        $response['messages'][] = 'Invalid scores submitted for rubric item - ' . $rubricItem->title;
      }
      if ( !$rubric->isValidScore($rubricItemId, $itemScores['score']) ){
        $response['messages'][] = 'Invalid score submitted for rubric item - ' . $rubricItem->title;
      }
    }
    if ( $submitAction === 'finalize' && count($payload['scores']) !== count($rubric->itemIds()) ){
      $response['messages'][] = 'A score must be submitted for all rubric items.';
    }
    if ( count($response['messages']) > 0 ){
      $this->utils->sendResponse($response);
    }

    $rubric->setScoresByUser($judge->record()->user_id, $applicant->record()->user_id, $payload['scores']);
    if ( $submitAction === 'finalize' ){
      $judge->updateMeta('evaluatedApplicant', $payload['applicant_id'], $cycleId);
    }

    $response['success'] = true;
    return $response;
  }

  public function setConflictOfInterest($response, $cycle, $payload){
    $this->doAuth($response, $cycle, $payload, true);
    $cycleId = $cycle->cycleId;
    $applicant = $this->getApplicant($response, $cycle, $payload);

    $judge = $this->getJudge($response, $cycle, $payload);

    $assignedJudges = $applicant->assignedJudgeIds($cycleId)['assigned'];
    if ( !in_array($payload['judge_id'], $assignedJudges) ){
      $response['messages'][] = 'Judge is not assigned to this applicant.';
      $this->utils->sendResponse($response);
    }

    $judge->updateMeta('conflictOfInterestApplicant', $payload['applicant_id'], $cycleId);
    if ( !empty($payload['coi_details']) ){
      $metaKey = 'conflictOfInterestApplicant' . $payload['applicant_id'] . 'Details';
      $judge->updateMeta($metaKey, $payload['coi_details'], $cycleId);
    }

    $this->logger->logConflictOfInterest($cycleId, $judge->record()->user_id, $payload['applicant_id']);
    $response['success'] = true;

    return $response;
  }

  private function getJudge($response, $cycle, $payload){
    $cycleId = $cycle->cycleId;
    if ( empty($payload['judge_id']) ){
      $response['messages'][] = 'No judge ID specified.';
      $this->utils->sendResponse($response);
    }
    $judge = $this->plugin->users->getByUserIds($payload['judge_id']);
    if ( empty($judge) ){
      $response['messages'][] = 'No judge found.';
      $this->utils->sendResponse($response);
    }
    $judge = $judge[0];

    if ( !$judge->isJudge($cycleId) ){
      $response['messages'][] = 'User is not a judge.';
      $this->utils->sendResponse($response);
    }
    return $judge;
  }

  private function getApplicant($response, $cycle, $payload){
    $cycleId = $cycle->cycleId;
    if ( empty($payload['applicant_id']) ){
      $response['messages'][] = 'No applicant ID specified.';
      $this->utils->sendResponse($response);
    }
    $applicant = $this->plugin->users->getByUserIds($payload['applicant_id']);
    if ( empty($applicant) ){
      $response['messages'][] = 'No applicant found.';
      $this->utils->sendResponse($response);
    }
    $applicant = $applicant[0];
    if ( empty($applicant->applicationEntry($cycleId)) ) {
      $response['messages'][] = 'No application entry found.';
      $this->utils->sendResponse($response);
    }
    return $applicant;
  }

  public function getApplicationEntry($response, $cycle, $payload){
    $this->doAuth($response, $cycle, $payload);

    foreach (['form_id', 'entry_id'] as $key) {
      if ( empty($payload[$key]) ){
        $response['messages'][] = 'No ' . $key . ' specified.';
        $this->utils->sendResponse($response);
      }
    }

    $formsModel = $this->plugin->forms;
    $formEntry = $formsModel->getEntry($payload['form_id'], $payload['entry_id']);
    if ( empty($formEntry) ){
      $response['messages'][] = 'No form entry found.';
      $this->utils->sendResponse($response);
    }

    $applicantId = $formEntry->get_meta('forminator_addon_ucdlib-awards_applicant_id');
    $applicant = $this->plugin->users->getByUserIds($applicantId);
    if ( empty($applicant) ){
      $response['messages'][] = 'No applicant found.';
      $this->utils->sendResponse($response);
    }
    $applicant = $applicant[0];

    $entryValues = $formsModel->exportEntry($formEntry, true);
    $response['data'] = [
      'entryValues' => $entryValues,
      'formId' => $payload['form_id'],
      'entryId' => $payload['entry_id'],
      'htmlDoc' =>  UcdlibAwardsTimber::getApplicationHtml($applicant, $entryValues, $this->plugin->award)
    ];
    $response['success'] = true;
    return $response;
  }

  public function getApplicants($response, $cycle, $payload){

    $this->doAuth($response, $cycle, $payload);
    $judgeId = $payload['judge_id'];
    $cycleId = $cycle->cycleId;

    $args = [
      'applicationEntry' => true,
      'userMeta' => true
    ];
    $allApplicants = $cycle->getApplicants($args);
    $applicants = array_filter($allApplicants, function($applicant) use ($judgeId, $cycleId){
      $assignedJudges = $applicant->assignedJudgeIds($cycleId)['assigned'];
      return in_array($judgeId, $assignedJudges);
    });

    $args = [
      'applicationEntryBrief' => $cycleId,
      'assignedJudgeIds' => $cycleId
    ];
    $response['data'] = [
      'applicants' => $this->plugin->users->toArrays($applicants, $args)
    ];
    $response['success'] = true;
    return $response;
  }

  public function doAuth($response, $cycle, $payload, $isWriteAction = false){
    $cycleId = $cycle->cycleId;
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
      $response['messages'][] = 'You are not authorized to perform this action.';
      $this->utils->sendResponse($response);
    }

    if (
      $isWriteAction &&
      !$currentUser->userIdMatches($judgeId) &&
      !$this->plugin->award->getAdminCanImpersonateJudge() ){
        $response['messages'][] = 'You are not authorized to perform this action.';
        $this->utils->sendResponse($response);
    }
  }

}
