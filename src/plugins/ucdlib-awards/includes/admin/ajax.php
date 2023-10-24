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
    add_action( 'wp_ajax_' . $this->actions['adminJudges'], [$this, 'judges'] );
    add_action( 'wp_ajax_' . $this->actions['adminApplicants'], [$this, 'applicants'] );
    add_action( 'wp_ajax_' . $this->actions['adminEmail'], [$this, 'email'] );

  }

  public function email(){
    check_ajax_referer( $this->actions['adminEmail'] );
    $response = $this->utils->getResponseTemplate();
    try {
      $this->validateRequest($response);
      $action = $_POST['subAction'];
      if ( $action === 'updateMetaGroup' ){
        $payload = json_decode( stripslashes($_POST['data']), true );
        $cycle = $this->getCycle($payload, $response);
        $cycleId = $cycle->cycleId;

        if ( empty($payload['group']) ){
          $response['messages'][] = 'No group specified.';
          $this->utils->sendResponse($response);
          return;
        }

        $fields = array_filter($this->plugin->email->metaFields, function($field) use ($payload){
          return $field['group'] === $payload['group'];
        });
        if ( !count($fields) ){
          $response['messages'][] = 'No fields found for group.';
          $this->utils->sendResponse($response);
          return;
        }
        $fieldsToWrite = array_intersect_key(isset($payload['data']) ? $payload['data'] : [], $fields);
        if ( !count($fieldsToWrite) ){
          $response['messages'][] = 'No fields to write.';
          $this->utils->sendResponse($response);
          return;
        }

        foreach ($fieldsToWrite as $key => $value) {
          $fieldType = $fields[$key]['type'];
          $fieldLabel = $fields[$key]['label'];
          $isArray = $fields[$key]['isArray'];

          if ( !is_array($value) ) $value = [$value];
          foreach ($value as &$v) {
            if ( $fieldType === 'boolean' ){
              $v = $v ? true : false;
            } else if ( $fieldType === 'email' ){
              $v = sanitize_email($v);
              if ( !is_email($v) ){
                $preposition = $isArray ? ' contains an ' : ' is an ';
                $response['messages'][] = $fieldLabel . $preposition . 'invalid email address.';
                $response['errorFields'][$key] = true;
                break;
              }
            } else if ( $fieldType === 'text' ){
              $v = sanitize_text_field($v);
            } else if ( $fieldType === 'textArea' ){
              $v = sanitize_textarea_field($v);
            }
          }
          if ( !$isArray ) $value = $value[0];
          $fieldsToWrite[$key] = $value;
        }
        if ( count($response['messages']) ){
          $this->utils->sendResponse($response);
          return;
        }

        $cycle->updateEmailMeta($fieldsToWrite);
        $this->logger->logEmailSettingChange($cycleId);
        $emailMeta = $cycle->getEmailMeta(true);
        $response['data'] = ['emailMeta' => $emailMeta[$payload['group']]];
        $response['messages'][] = 'Email settings updated successfully.';
        $response['success'] = true;

      }
    } catch (\Throwable $th) {
      error_log('Error in UcdlibAwardsAdminAjax::email(): ' . $th->getMessage());
    }
    $this->utils->sendResponse($response);
  }

  public function applicants(){
    check_ajax_referer( $this->actions['adminApplicants'] );
    $response = $this->utils->getResponseTemplate();
    try {
      $this->validateRequest($response);
      $action = $_POST['subAction'];
      if ($action === 'delete') {
        $payload = json_decode( stripslashes($_POST['data']), true );
        $cycle = $this->getCycle($payload, $response);
        $cycleId = $cycle->cycleId;

        if ( empty($payload['applicant_ids'])){
          $response['messages'][] = 'No applicant ids specified.';
          $this->utils->sendResponse($response);
          return;
        }

        $userIds = is_array($payload['applicant_ids']) ? $payload['applicant_ids'] : [$payload['applicant_ids']];
        $allApplicantIds = array_map(function($applicant){
          return $applicant->record()->user_id;
        }, $cycle->allApplicants());
        $missingApplicantIds = array_diff($userIds, $allApplicantIds);
        if ( count($missingApplicantIds) ){
          $response['messages'][] = 'One or more applicants could not be deleted because they could not be found.';
          $this->utils->sendResponse($response);
          return;
        }
        $cycle->deleteApplicants($userIds);
        foreach ($userIds as $userId) {
          $this->logger->logApplicationDelete($cycleId, $userId);
        }
        if ( count($userIds) > 1 ){
          $response['messages'][] = 'Applicants deleted successfully.';
        } else {
          $response['messages'][] = 'Applicant deleted successfully.';
        }
        $args = [
          'applicationEntry' => true,
          'userMeta' => true
        ];
        $applicants = $cycle->getApplicants($args);
        $args = [
          'applicationEntryBrief' => $cycle->cycleId,
          'applicationCategory' => $cycle->cycleId,
          'applicationStatus' => $cycle->cycleId
        ];
        $response['data'] = ['applicants' => $this->plugin->users->toArrays($applicants, $args)];
        $response['success'] = true;

      } else if ( $action === 'getApplications' ){
        $payload = json_decode( stripslashes($_POST['data']), true );

        $cycle = $this->getCycle($payload, $response);
        $cycleId = $cycle->cycleId;
        $formId = $cycle->applicationFormId();
        if ( empty($formId) ){
          $response['messages'][] = 'No application form found.';
          $this->utils->sendResponse($response);
          return;
        }

        $formsModel = $this->plugin->forms;
        $entries = $formsModel->getEntries($formId);
        $entriesByApplicantId = [];
        foreach ($entries as $entry) {
          $applicantId = $entry->get_meta('forminator_addon_ucdlib-awards_applicant_id');
          if ( !empty($applicantId) ){
            $entriesByApplicantId[$applicantId] = $entry;
          }
        }

        if ( empty($payload['applicant_ids'])){
          $response['messages'][] = 'No applicant ids specified.';
          $this->utils->sendResponse($response);
          return;
        }
        $applicantIds = is_array($payload['applicant_ids']) ? $payload['applicant_ids'] : [$payload['applicant_ids']];
        $applicants = $this->plugin->users->getByUserIds($applicantIds);

        foreach ($applicants as &$applicant) {
          $entry = isset($entriesByApplicantId[$applicant->id]) ? $entriesByApplicantId[$applicant->id] : false;
          if ( $entry ){
            $entry = $formsModel->exportEntry($entry, true);
            $applicant->setApplicationEntryExport($cycleId, $entry);
          }
        }
        $response['data'] = [
          'htmlDoc' =>  UcdlibAwardsTimber::getApplicationsHtml($applicants, $this->plugin->award, $cycleId)
        ];
        $response['success'] = true;

      }
    } catch (\Throwable $th) {
      error_log('Error in UcdlibAwardsAdminAjax::applicants(): ' . $th->getMessage());
    }
    $this->utils->sendResponse($response);
  }

  public function judges(){
    check_ajax_referer( $this->actions['adminJudges'] );
    $response = $this->utils->getResponseTemplate();
    try {
      $this->validateRequest($response);
      $action = $_POST['subAction'];
      if ($action === 'add') {
        $payload = json_decode( stripslashes($_POST['data']), true );
        $cycle = $this->getCycle($payload, $response);
        $cycleId = $cycle->cycleId;

        if ( empty($payload['judge']['email'])){
          $response['messages'][] = 'No judge email specified.';
          $this->utils->sendResponse($response);
          return;
        }

        $user = $this->plugin->users->getByEmail($payload['judge']['email']);
        if ( empty( $user) ){
          $phUsername = 'ph_' . explode('@', $payload['judge']['email'])[0];
          $user = $this->plugin->users->getByUsername($phUsername);
          $user->create([
            'email' => $payload['judge']['email'],
            'first_name' => isset($payload['judge']['first_name']) ? $payload['judge']['first_name'] : '',
            'last_name' => isset($payload['judge']['last_name']) ? $payload['judge']['last_name'] : ''
          ]);
        }
        if ( $user->cycleMetaItem('isJudge', $cycleId) ){
          $response['messages'][] = 'User is already a judge for this cycle.';
          $this->utils->sendResponse($response);
          return;
        }
        $user->updateMeta('isJudge', true, $cycleId);
        if ( !empty($payload['judge']['category']) ){
          $user->updateMeta('judgeCategory', $payload['judge']['category'], $cycleId);
        }
        $this->logger->logJudgeAddition($cycleId, $user->id);
        $response['messages'][] = 'Judge added successfully.';
        $response['data'] = ['judges' => $cycle->judges(true, ['assignments' => true, 'conflictsOfInterest' => true, 'completedEvaluations' => true])];
        $response['success'] = true;
      } else if ($action == 'delete'){

        $payload = json_decode( stripslashes($_POST['data']), true );
        $cycle = $this->getCycle($payload, $response);
        $cycleId = $cycle->cycleId;

        if ( empty($payload['judge_ids'])){
          $response['messages'][] = 'No judge ids specified.';
          $this->utils->sendResponse($response);
          return;
        }

        $userIds = is_array($payload['judge_ids']) ? $payload['judge_ids'] : [$payload['judge_ids']];
        $existingJudgeIds = $cycle->judgeIds();
        $missingJudgeIds = array_diff($userIds, $existingJudgeIds);
        if ( count($missingJudgeIds) ){
          $response['messages'][] = 'One or more judges could not be deleted because they could not be found.';
          $this->utils->sendResponse($response);
          return;
        }

        $cycle->removeJudges($userIds);
        foreach ($userIds as $userId) {
          $this->logger->logJudgeRemoval($cycleId, $userId);
        }
        if ( count($userIds) > 1 ){
          $response['messages'][] = 'Judges deleted successfully.';
        } else {
          $response['messages'][] = 'Judge deleted successfully.';
        }
        $response['data'] = ['judges' => $cycle->judges(true, ['assignments' => true, 'conflictsOfInterest' => true, 'completedEvaluations' => true])];
        $response['success'] = true;
      } else if ( $action === 'assign' ){

        $payload = json_decode( stripslashes($_POST['data']), true );
        $cycle = $this->getCycle($payload, $response);
        $cycleId = $cycle->cycleId;

        if ( empty($payload['judge_ids'])){
          $response['messages'][] = 'No judge ids specified.';
          $this->utils->sendResponse($response);
          return;
        }

        if ( empty($payload['applicant_ids']) ){
          $response['messages'][] = 'No applicants specified.';
          $this->utils->sendResponse($response);
          return;
        }

        $assignments = $cycle->assignApplicants( $payload['applicant_ids'], $payload['judge_ids'] );
        if ( empty($assignments) ){
          $response['messages'][] = 'All applicant(s) are already assigned to specified judge(s).';
          $this->utils->sendResponse($response);
          return;
        } else {
          foreach ($assignments as $judge => $applicants) {
            $this->logger->logApplicationAssignment($cycleId, $judge, $applicants);
          }
        }

        $response['messages'][] = 'Applicants assigned successfully.';
        $response['data'] = ['judges' => $cycle->judges(true, ['assignments' => true, 'conflictsOfInterest' => true, 'completedEvaluations' => true])];
        $response['success'] = true;
      } else if ( $action === 'unassign' ){
        $payload = json_decode( stripslashes($_POST['data']), true );
        $cycle = $this->getCycle($payload, $response);
        $cycleId = $cycle->cycleId;

        if ( empty($payload['judge_ids'])){
          $response['messages'][] = 'No judge ids specified.';
          $this->utils->sendResponse($response);
          return;
        }

        if ( empty($payload['applicant_ids']) ){
          $response['messages'][] = 'No applicants specified.';
          $this->utils->sendResponse($response);
          return;
        }

        $removed = $cycle->unassignApplicants( $payload['applicant_ids'], $payload['judge_ids'] );
        if ( empty($removed) ){
          $response['messages'][] = 'All applicant(s) are already unassigned from specified judge(s).';
          $this->utils->sendResponse($response);
          return;
        } else {
          foreach ($removed as $judge => $applicants) {
            $this->logger->logApplicationUnassignment($cycleId, $judge, $applicants);
          }
        }

        $response['messages'][] = 'Applicants assigned successfully.';
        $response['data'] = ['judges' => $cycle->judges(true, ['assignments' => true, 'conflictsOfInterest' => true, 'completedEvaluations' => true])];
        $response['success'] = true;
      }
    } catch (\Throwable $th) {
      error_log('Error in UcdlibAwardsAdminAjax::cycles(): ' . $th->getMessage());
    }
    $this->utils->sendResponse($response);

  }

  public function getCycle($payload, $response){
    if ( empty($payload['cycle_id']) ){
      $response['messages'][] = 'No cycle specified.';
      $this->utils->sendResponse($response);
      return;
    }
    $cycleId = $payload['cycle_id'];
    $cycle = $this->plugin->cycles->getById($cycleId);
    if ( !$cycle ){
      $response['messages'][] = 'Cycle not found.';
      $this->utils->sendResponse($response);
      return;
    }

    return $cycle;
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
        $cycleId = false;
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
          if (!empty($payloadItem['cycle_id'])) $cycleId = $payloadItem['cycle_id'];
        }

        if ( !$isValid ) {
          $response['messages'] = array_unique($errorMessages);
          if ( count($errorFields) ){
            $response['errorFields'] = $errorFields;
          }
          $this->utils->sendResponse($response);
          return;
        }

        // verify any updated items actually exist
        $rubric = $this->plugin->rubrics->getByCycleId($cycleId);

        if ( $rubric->hasScores() ){
          $response['messages'][] = 'Rubric items could not be updated because scores have already been submitted.';
          $this->utils->sendResponse($response);
          return;
        }
        $existingItemIds = $rubric->itemIds();
        $payloadItemIds = array_filter(array_map(function($item){
          return !empty($item['rubric_item_id']) ? $item['rubric_item_id'] : false;
        }, $payload));
        $missingItemIds = array_diff($payloadItemIds, $existingItemIds);
        if ( count($missingItemIds) ){
          $response['messages'][] = 'One or more rubric items could not be updated because they could not be found.';
          $this->utils->sendResponse($response);
          return;
        }

        // create or update items
        foreach ($rubricItems as $item) {
          $rubric->createOrUpdateItem($item);
        }

        // delete items
        $deletedItemIds = array_diff($existingItemIds, $payloadItemIds);
        if ( count($deletedItemIds) ){
          $rubric->deleteItemsById($deletedItemIds);
        }

        $logSubtype = count($existingItemIds) ? 'update' : 'create';
        $this->logger->logRubricEvent($cycleId, $logSubtype);

        $response['data'] = ['rubricItems' => $rubric->items()];
        $response['messages'][] = 'Rubric items updated successfully.';
        $response['success'] = true;
      } else if ( $action === 'copyFromExisting' ){
        $payload = json_decode( stripslashes($_POST['data']), true );

        $cycleId = $payload['cycle_id'];
        $copyFromCycleId = $payload['copy_cycle_id'];

        // verify both cyles exists
        foreach ([$cycleId, $copyFromCycleId] as $id) {
          $cycle = $this->plugin->cycles->getById($id);
          if ( !$cycle ){
            $response['messages'][] = 'Cycle not found.';
            $this->utils->sendResponse($response);
            return;
          }
        }

        $this->plugin->rubrics->copyFromCycle($copyFromCycleId, $cycleId);
        $this->logger->logRubricEvent($cycleId, 'create');

        $rubric = $this->plugin->rubrics->getByCycleId($cycleId);
        $response['data'] = [
          'rubricItems' => $rubric->items(),
          'scoringCalculation' => $cycle->rubric()->scoringCalculation(),
          'uploadedFile' => $cycle->rubric()->uploadedFile()
        ];
        $response['messages'][] = 'Rubric items copied successfully.';
        $response['success'] = true;
      } else if ( $action === 'updateCalculation' ){
        $payload = json_decode( stripslashes($_POST['data']), true );
        $cycle = $this->plugin->cycles->getById($payload['cycle_id']);
        if ( !$cycle ){
          $response['messages'][] = 'Cycle not found.';
          $this->utils->sendResponse($response);
          return;
        }
        if ( empty($payload['scoring_calculation']) ){
          $response['messages'][] = 'No scoring calculation specified.';
          $this->utils->sendResponse($response);
          return;
        }
        $cycle->updateMeta(['rubric_scoring_calculation' => $payload['scoring_calculation']]);
        $this->logger->logRubricEvent($cycle->cycleId, 'update');
        $response['messages'][] = 'Scoring calculation updated successfully.';
        $response['success'] = true;
      } else if ( $action === 'uploadRubricFile' ){
        $cycle = $this->plugin->cycles->getById($_POST['cycle_id']);
        if ( !$cycle ){
          $response['messages'][] = 'Cycle not found.';
          $this->utils->sendResponse($response);
          return;
        }
        $file = $_FILES['file'];
        if ( ! function_exists( 'wp_handle_upload' ) ) {
          require_once( ABSPATH . 'wp-admin/includes/file.php' );
        }
        $movefile = wp_handle_upload($file, ['test_form' => false]);
        if ( $movefile && !isset( $movefile['error'] ) ) {
          $cycle->updateMeta(['rubric_file' => $movefile['url']]);
          $this->logger->logRubricEvent($cycle->cycleId, 'update');
          $response['messages'][] = 'Rubric file uploaded successfully.';
          $response['data'] = ['rubricFile' => $movefile['url']];
          $response['success'] = true;
        } else {
          $response['messages'][] = 'Error uploading file.';
        }
      } else if ($action === 'deleteRubricFile') {
        $payload = json_decode( stripslashes($_POST['data']), true );
        $cycle = $this->plugin->cycles->getById($payload['cycle_id']);
        if ( !$cycle ){
          $response['messages'][] = 'Cycle not found.';
          $this->utils->sendResponse($response);
          return;
        }
        $cycle->updateMeta(['rubric_file' => '']);
        $this->logger->logRubricEvent($cycle->cycleId, 'update');
        $response['messages'][] = 'Rubric file deleted successfully.';
        $response['success'] = true;
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
        $results = $this->logger->getLogTypeLabel($dataOut['results']);
        $results = $this->logger->decodeLogDetails($results);
        $dataOut['results'] = $results;
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
