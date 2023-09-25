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
    $this->recordArray = null;
    $this->isActive = null;
    $this->allApplicants = null;
    $this->applicantCount = null;
    $this->categories = null;
    $this->applicationWindowStatus = null;
    $this->evaluationWindowStatus = null;
    $this->supportWindowStatus = null;
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
    return !empty($rubric->items);
  }

  public function rubric(){
    return $this->plugin->rubrics->getByCycleId( $this->cycleId );
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
    error_log('applicationEntries()');
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
      foreach( $userMeta as $meta ){
        if ( !isset($userMetaByUserId[ $meta->user_id ]) ){
          $userMetaByUserId[ $meta->user_id ] = [];
        }
        $userMetaByUserId[ $meta->user_id ][] = $meta;
      }
    }

    foreach( $allApplicants as &$applicant ){

      if ( isset($entriesByUserId[ $applicant->id ]) ){
        $applicant->setApplicationEntry( $entriesByUserId[ $applicant->id ], $this->cycleId );
      }

      if ( isset($userMetaByUserId[ $applicant->id ]) ){
        $applicant->setCycleMeta( $userMetaByUserId[ $applicant->id ], $this->cycleId );
      }

    }
    return $allApplicants;
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
