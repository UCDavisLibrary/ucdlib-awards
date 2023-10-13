<?php

/**
 * @description Model for a single awards/application cycle
 */
class UcdlibAwardsCycle {

  /**
   * @param $cycle int|string|object - Can be cycle id or cycle db record
   */
  public function __construct( $cycle ){
    $this->plugin = $GLOBALS['ucdlibAwards'];
    $this->record = null;
    $this->cycleId = null;
    if ( is_int($cycle) ){
      $this->cycleId = $cycle;
    } elseif ( is_string($cycle) ) {
      $this->cycleId = $this->getCycleIdFromSlug( $cycle );
    } elseif ( is_object($cycle) ) {
      $this->record = $cycle;
      $this->cycleId = $this->record->cycle_id;
    }
  }

  public function update($data){
    if ( isset($data['cycle_id']) ) unset($data['cycle_id']);
    if ( isset($data['date_created']) ) unset($data['date_created']);

    $validColumns = array_keys(UcdlibAwardsDbTables::get_table_column_labels( UcdlibAwardsDbTables::CYCLES ));
    foreach( $data as $key => $value ){
      if ( !in_array($key, $validColumns) ){
        unset($data[$key]);
      }
    }

    $data['date_updated'] = date('Y-m-d H:i:s');
    global $wpdb;
    $cyclesTable = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::CYCLES );
    $wpdb->update(
      $cyclesTable,
      $data,
      ['cycle_id' => $this->cycleId]
    );
    $this->clearCache();
  }

  public function delete(){
    global $wpdb;

    // delete cycle record
    $cyclesTable = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::CYCLES );
    $wpdb->delete(
      $cyclesTable,
      ['cycle_id' => $this->cycleId]
    );

    // delete logs
    $logsTable = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::LOGS );
    $wpdb->delete(
      $logsTable,
      ['cycle_id' => $this->cycleId]
    );

    // get rubric ids for cycle
    $rubricItemsTable = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::RUBRIC_ITEMS );
    $sql = "SELECT rubric_item_id FROM $rubricItemsTable WHERE cycle_id = %d";
    $rubricItemIds = $wpdb->get_col( $wpdb->prepare( $sql, $this->cycleId ) );

    // delete rubric items
    $wpdb->delete(
      $rubricItemsTable,
      ['cycle_id' => $this->cycleId]
    );

    // delete scores for cycle rubric items
    if ( count($rubricItemIds) ){
      $scoresTable = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::SCORES );
      $sql = "DELETE FROM $scoresTable WHERE rubric_id IN (" . implode(',', $rubricItemIds) . ")";
      $wpdb->query( $sql );
    }

    // delete user meta
    $userMetaTable = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::USER_META );
    $wpdb->delete(
      $userMetaTable,
      ['cycle_id' => $this->cycleId]
    );

    $this->clearCache();
  }

  public function clearCache(){
    $this->record = null;
    $this->isActive = null;
    $this->allApplicants = null;
    $this->applicantCount = null;
    $this->categories = null;
    $this->applicationWindowStatus = null;
    $this->evaluationWindowStatus = null;
    $this->supportWindowStatus = null;
    $this->applicationForm = null;
    $this->applicationEntries = null;
    $this->userMeta = null;
    $this->cycleMeta = null;
  }

  public function title(){
    $record = $this->record();
    return $record->title;
  }

  public function supportIsEnabled(){
    $record = $this->record();
    return $record->has_support ? true : false;
  }

  public function applicationFormId(){
    $record = $this->record();
    return $record->application_form_id;
  }

  public function supportFormId(){
    $record = $this->record();
    if ( !$record->has_support ) return false;
    return $record->support_form_id;
  }

  protected $cycleMeta;
  public function cycleMeta(){
    if ( isset($this->cycleMeta) ) return $this->cycleMeta;
    $record = $this->record();
    if ( empty($record->cycle_meta) ) {
      $this->cycleMeta = [];
      return $this->cycleMeta;
    }
    $this->cycleMeta = json_decode( $record->cycle_meta, true );
    return $this->cycleMeta;
  }

  public function updateMeta($items){
    $cycleMeta = $this->cycleMeta();

    foreach ($items as $key => $value) {
      $cycleMeta[$key] = $value;
    }

    global $wpdb;
    $cyclesTable = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::CYCLES );
    $wpdb->update(
      $cyclesTable,
      ['cycle_meta' => json_encode($cycleMeta)],
      ['cycle_id' => $this->cycleId]
    );
    $this->record = null;
    $this->cycleMeta = null;
  }

  /**
   * @description returns current status of application window: 'active', 'upcoming', or 'past'
   */
  protected $applicationWindowStatus;
  public function applicationWindowStatus(){
    if ( !empty( $this->applicationWindowStatus ) ) return $this->applicationWindowStatus;
    $record = $this->record();
    if ( empty($record->application_start) || empty($record->application_end) ) return false;
    $this->applicationWindowStatus = $this->dateRangeStatus( $record->application_start, $record->application_end );
    return $this->applicationWindowStatus;
  }

  /**
   * @description returns current status of evaluation window: 'active', 'upcoming', or 'past'
   */
  protected $evaluationWindowStatus;
  public function evaluationWindowStatus(){
    if ( !empty( $this->evaluationWindowStatus ) ) return $this->evaluationWindowStatus;
    $record = $this->record();
    if ( empty($record->evaluation_start) || empty($record->evaluation_end) ) return false;
    $this->evaluationWindowStatus = $this->dateRangeStatus( $record->evaluation_start, $record->evaluation_end );
    return $this->evaluationWindowStatus;
  }

  /**
   * @description returns current status of support window: 'active', 'upcoming', or 'past'
   */
  protected $supportWindowStatus;
  public function supportWindowStatus(){
    if ( !empty( $this->supportWindowStatus ) ) return $this->supportWindowStatus;
    $record = $this->record();
    if ( !$this->supportIsEnabled() || empty($record->support_start) || empty($record->support_end) ) return false;
    $this->supportWindowStatus = $this->dateRangeStatus( $record->support_start, $record->support_end );
    return $this->supportWindowStatus;
  }

  private function dateRangeStatus($start, $end){
    $now = new DateTime( 'now', new DateTimeZone('America/Los_Angeles') );
    $applicationStart = new DateTime( $start, new DateTimeZone('America/Los_Angeles') );
    $applicationEnd = new DateTime( $end, new DateTimeZone('America/Los_Angeles') );
    if ( $now < $applicationStart ) {
      return 'upcoming';
    } elseif ( $now > $applicationEnd ) {
      return 'past';
    } else {
      return 'active';
    }
  }

  protected $applicationForm;
  public function applicationForm(){
    if ( isset($this->applicationForm) ) return $this->applicationForm;
    $formId = $this->applicationFormId();
    if ( !$formId ) {
      $this->applicationForm = false;
      return $this->applicationForm;
    }
    $forms = $this->plugin->forms->getForms([ $formId ]);
    if ( empty($forms) ) {
      $this->applicationForm = false;
      return $this->applicationForm;
    }
    $this->applicationForm = $forms[0];
    return $this->applicationForm;
  }

  public function hasRubric(){
    $rubric = $this->rubric();
    return !empty($rubric->items());
  }

  public function rubric(){
    return $this->plugin->rubrics->getByCycleId( $this->cycleId );
  }

  protected $judgeIds;
  public function judgeIds(){
    if ( isset($this->judgeIds) ) return $this->judgeIds;
    global $wpdb;
    $table = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::USER_META );
    $sql = "SELECT user_id FROM $table WHERE cycle_id = %d AND meta_key = 'isJudge' AND meta_value = 'true'";
    $this->judgeIds = $wpdb->get_col( $wpdb->prepare( $sql, $this->cycleId ) );
    return $this->judgeIds;
  }

  public function deleteApplicants($applicantIds){
    if ( empty($applicantIds) ) return;
    if ( !is_array($applicantIds) ) $applicantIds = [$applicantIds];
    global $wpdb;

    // remove from user meta
    $table = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::USER_META );
    $meta_keys = ['isApplicant', 'hasSubmittedApplication'];
    $sql = "DELETE FROM $table WHERE cycle_id = %d AND user_id IN (" . implode(',', $applicantIds) . ") AND meta_key IN ('" . implode("','", $meta_keys) . "')";
    $wpdb->query( $wpdb->prepare( $sql, $this->cycleId ) );

    // remove from judge user meta assignments
    $table = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::USER_META );
    $meta_keys = array_map(function($item){
      return $item['meta_key'];
    }, $this->plugin->config::$assignedJudgesProps);
    $sql = "DELETE FROM $table WHERE cycle_id = %d AND meta_value IN ('" . implode("','", $applicantIds) . "') AND meta_key IN ('" . implode("','", $meta_keys) . "')";
    $wpdb->query( $wpdb->prepare( $sql, $this->cycleId ) );

    // remove from scores
    $this->removeApplicantScores( $applicantIds );

    // remove applications
    if ( $this->applicationFormId() ){
      $this->plugin->forms->deleteEntriesByApplicantId( $this->applicationFormId(), $applicantIds );
    }

    $this->clearCache();
    $this->plugin->users->clearCache();
  }

  public function removeJudges($judgeIds){
    if ( empty($judgeIds) ) return;
    if ( !is_array($judgeIds) ) $judgeIds = [$judgeIds];
    global $wpdb;

    // remove from user meta
    $table = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::USER_META );
    $meta_keys = ['isJudge', 'judgeCategory', 'assignedApplicant'];
    $sql = "DELETE FROM $table WHERE cycle_id = %d AND user_id IN (" . implode(',', $judgeIds) . ") AND meta_key IN ('" . implode("','", $meta_keys) . "')";
    $wpdb->query( $wpdb->prepare( $sql, $this->cycleId ) );

    // remove from scores
    $this->removeJudgeScores( $judgeIds );
    $this->judgeIds = null;

  }

  public function removeJudgeScores($judgeIds){
    if ( empty($judgeIds) ) return;
    if ( !is_array($judgeIds) ) $judgeIds = [$judgeIds];

    if ( !$this->hasRubric() ) return;
    $rubricItemIds = $this->rubric()->itemIds();
    if ( empty($rubricItemIds) ) return;

    global $wpdb;
    $table = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::SCORES );
    $sql = "DELETE FROM $table WHERE rubric_id IN (" . implode(',', $rubricItemIds) . ") AND judge_id IN (" . implode(',', $judgeIds) . ")";
    $wpdb->query( $sql );
  }

  public function removeApplicantScores($applicantIds){
    if ( empty($applicantIds) ) return;
    if ( !is_array($applicantIds) ) $applicantIds = [$applicantIds];

    if ( !$this->hasRubric() ) return;
    $rubricItemIds = $this->rubric()->itemIds();
    if ( empty($rubricItemIds) ) return;

    global $wpdb;
    $table = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::SCORES );
    $sql = "DELETE FROM $table WHERE rubric_id IN (" . implode(',', $rubricItemIds) . ") AND applicant_id IN (" . implode(',', $applicantIds) . ")";
    $wpdb->query( $sql );
  }


  public function judgeAssignmentMap(){
    $judgeIds = $this->judgeIds();
    $assignments = $this->userMetaItem('assignedApplicant');
    $out = [];
    foreach( $judgeIds as $judgeId ){
      $out[ $judgeId ] = [];
      foreach( $assignments as $assignment ){
        if ( $assignment->user_id == $judgeId ){
          $out[ $judgeId ][] = $assignment->meta_value;
        }
      }
    }
    return $out;
  }

  public function judges($returnArray=false, $arrayFields=[]){
    $judges = [];

    $judgeIds = $this->judgeIds();
    if ( empty($judgeIds) ) return $judges;
    $users = $this->plugin->users->getByUserIds( $judgeIds );
    if ( !$returnArray ) return $users;

    // categories
    $categoriesBySlug = [];
    $categories = $this->categories();
    if ( !empty($categories) ){
      foreach( $categories as $category ){
        $categoriesBySlug[ $category['value'] ] = $category;
      }
    }

    if ( !empty($arrayFields['assignments'])){
      $assignmentsByJudge = $this->judgeAssignmentMap();
    }

    foreach( $users as $user ){
      $judge = [
        'id' => $user->record()->user_id,
        'name' => $user->name(),
        'email' => $user->record()->email,
        'hasUserLogin' => $user->hasUserLogin()
      ];
      $category = $user->cycleMetaItem('judgeCategory', $this->cycleId);
      if ( !empty($category) ){
        $judge['category'] = $category;
        if ( !empty($categoriesBySlug[ $category ]) ){
          $judge['categoryObject'] = $categoriesBySlug[ $category ];
        }
      }

      if ( !empty($arrayFields['assignments']) ){
        if ( !empty($assignmentsByJudge[ $judge['id'] ]) ){
          $judge['assignments'] = $assignmentsByJudge[ $judge['id'] ];
        } else {
          $judge['assignments'] = [];
        }
      }

      $judges[] = $judge;
    }
    return $judges;
  }

  /**
   * @description Get the basic cycle record from the db table
   */
  protected $record;
  public function record(){
    if ( !empty($this->record) ) return $this->record;
    global $wpdb;
    $cyclesTable = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::CYCLES );
    $sql = "SELECT * FROM $cyclesTable WHERE cycle_id = %d";
    $this->record = $wpdb->get_row( $wpdb->prepare( $sql, $this->cycleId ) );
    return $this->record;
  }

  /**
   * @description Get the cycle record as an associative array
   */
  public function recordArray($additionalProps = []){
    $out = (array) $this->record();
    if ( !empty($additionalProps['applicantCount']) ){
      $out['applicantCount'] = $this->applicantCount();
    }
    return $out;
  }

  /**
   * @description This is the active application cycle
   */
  protected $isActive;
  public function isActive(){
    if ( isset($this->isActive) ) return $this->isActive;
    $record = $this->record();
    $this->isActive = $record->is_active;
    return $this->isActive;
  }

  protected $allApplicants;
  public function allApplicants(){
    if ( isset($this->allApplicants) ) return $this->allApplicants;
    $this->allApplicants = $this->plugin->users->getAllApplicants( $this->cycleId );
    return $this->allApplicants;
  }

  protected $applicationEntries;
  public function applicationEntries(){
    if ( isset($this->applicationEntries) ) return $this->applicationEntries;
    if ( !$this->applicationForm() ) {
      $this->applicationEntries = [];
      return $this->applicationEntries;
    }
    $this->applicationEntries = $this->plugin->forms->getEntries( $this->applicationForm()->id );
    return $this->applicationEntries;
  }

  /**
   * @description Get all applicants for the cycle with any additional specified metadata
   */
  public function getApplicants($args=[]){
    $allApplicants = $this->allApplicants();
    if ( empty($allApplicants) ) return [];
    if ( empty($args) ) return $allApplicants;

    if ( !empty($args['applicationEntry']) ){
      $entries = $this->applicationEntries();
      usort($entries, function($a, $b){
        return $b->date_created_sql <=> $a->date_created_sql;
      });

      $entriesByUserId = [];
      $key_app = 'forminator_addon_ucdlib-awards_applicant_id';
      $key_cycle = 'forminator_addon_ucdlib-awards_cycle_id';
      foreach( $entries as $entry ){
        if ( empty($entry->meta_data[$key_cycle]) ) continue;
        if ( $entry->meta_data[$key_cycle]['value'] != $this->cycleId ) continue;
        if (
          !empty($entry->meta_data[$key_app]['value'])
          && empty($entriesByUserId[ $entry->meta_data[$key_app]['value'] ])
          ) {
          $entriesByUserId[ $entry->meta_data[$key_app]['value'] ] = $entry;
        }
      }
    }

    if ( !empty($args['userMeta']) ){
      $userMeta = $this->userMeta();
      $userMetaByUserId = [];
      $assignedJudgesMeta = [];
      foreach( $userMeta as $meta ){
        if ( !isset($userMetaByUserId[ $meta->user_id ]) ){
          $userMetaByUserId[ $meta->user_id ] = [];
        }
        $userMetaByUserId[ $meta->user_id ][] = $meta;

        $applicantKeys = array_map(function($item){
          return $item['meta_key'];
        }, $this->plugin->config::$assignedJudgesProps);
        if ( in_array($meta->meta_key, $applicantKeys) ){
          $assignedJudgeIdsMeta[] = $meta;
        }
      }
    }

    foreach( $allApplicants as &$applicant ){

      if ( isset($entriesByUserId[ $applicant->id ]) ){
        $applicant->setApplicationEntry( $entriesByUserId[ $applicant->id ], $this->cycleId );
      }

      if ( isset($userMetaByUserId[ $applicant->id ]) ){
        $applicant->setCycleMeta( $userMetaByUserId[ $applicant->id ], $this->cycleId );
      }

      if ( isset($assignedJudgeIdsMeta) ){
        $applicant->setAssignedJudgeIdsMeta( $assignedJudgeIdsMeta );
      }

    }
    return $allApplicants;
  }

  public function assignApplicants($applicant_ids, $judge_ids){
    if ( !is_array($applicant_ids) ) $applicant_ids = [$applicant_ids];
    if ( !is_array($judge_ids) ) $judge_ids = [$judge_ids];
    if ( empty($applicant_ids) || empty($judge_ids) ) return;
    $metaKey = 'assignedApplicant';

    $existingAssignments = $this->userMetaItem($metaKey);
    $existingAssignmentsByJudgeId = [];
    foreach( $existingAssignments as $assignment ){
      if ( !isset($existingAssignmentsByJudgeId[ $assignment->user_id ]) ){
        $existingAssignmentsByJudgeId[ $assignment->user_id ] = [];
      }
      $existingAssignmentsByJudgeId[ $assignment->user_id ][] = $assignment->meta_value;
    }

    $newAssignments = [];
    foreach( $judge_ids as $judge_id ){
      if ( !isset($existingAssignmentsByJudgeId[ $judge_id ]) ){
        $existingAssignmentsByJudgeId[ $judge_id ] = [];
      }
      $newAssignments[ $judge_id ] = array_diff( $applicant_ids, $existingAssignmentsByJudgeId[ $judge_id ] );
    }
    $newAssignments = array_filter( $newAssignments );

    global $wpdb;
    $table = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::USER_META );

    foreach( $newAssignments as $judge_id => $applicant_ids ){
      foreach( $applicant_ids as $applicant_id ){
        $wpdb->insert(
          $table,
          [
            'user_id' => $judge_id,
            'cycle_id' => $this->cycleId,
            'meta_key' => $metaKey,
            'meta_value' => $applicant_id,
            'date_created' => date('Y-m-d H:i:s'),
            'date_updated' => date('Y-m-d H:i:s')
          ]
        );
      }
    }

    $this->userMeta = null;

    return $newAssignments;
  }

  public function userMetaItem($metaKey){
    $out = [];
    $userMeta = $this->userMeta();
    if ( empty($userMeta) ) return $out;
    foreach( $userMeta as $meta ){
      if ( $meta->meta_key == $metaKey ) {
        $out[] = $meta;
      }
    }
    return $out;
  }

  protected $userMeta;
  public function userMeta(){
    if ( isset($this->userMeta) ) return $this->userMeta;
    global $wpdb;
    $userMetaTable = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::USER_META );
    $sql = "SELECT * FROM $userMetaTable WHERE cycle_id = %d";
    $this->userMeta = $wpdb->get_results( $wpdb->prepare( $sql, $this->cycleId ) );
    return $this->userMeta;
  }

  protected $applicantCount;
  public function applicantCount(){
    if ( isset($this->applicantCount) ) return $this->applicantCount;
    $this->applicantCount = $this->plugin->users->getApplicantCount( $this->cycleId );
    return $this->applicantCount;
  }

  protected $categories;
  public function categories(){
    if ( isset($this->categories) ) return $this->categories;
    $record = $this->record();
    if (
       empty($record->has_categories ) ||
       empty($record->category_form_slug) ||
       empty($record->application_form_id)
       ) {
      $this->categories = false;
      return $this->categories;
       }
    $formFields = $this->plugin->forms->getFormFields( $record->application_form_id );
    if ( empty($formFields) ) {
      $this->categories = false;
      return $this->categories;
    }
    foreach( $formFields as $fieldWrapper ){
      if ( !is_array($fieldWrapper['fields']) ) continue;
      foreach( $fieldWrapper['fields'] as $field ){
        if ( $field['element_id'] != $record->category_form_slug ) continue;
        if ( !is_array($field['options']) || !count($field['options']) ) continue;
        $this->categories = $field['options'];
        return $this->categories;
      }
    }
    $this->categories = null;
    return $this->categories;
  }
}
