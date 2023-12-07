<?php

/**
 * @description Model for a single awards user
 */
class UcdlibAwardsUser {

  public $plugin;
  public $table;
  public $metaTable;
  public $id;
  public $username;
  public $metaCache;

  public function __construct( $username=null, $record=null ){

    $this->metaCache = [];
    $this->plugin = $GLOBALS['ucdlibAwards'];

    $this->table = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::USERS );
    $this->metaTable = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::USER_META );
    $this->id = null;

    if ( $username ){
      $this->username = $username;
      if ( $record ) {
        $this->record = $record;
        $this->id = $record->user_id;
      }
    } else {
      $this->wpUser = wp_get_current_user();
      $this->username = empty($this->wpUser) ? 0 : $this->wpUser->user_login;

      // if does not have record by username, try by email, and update username
      // this occurs for judges who have not yet logged in
      if ( !empty($this->wpUser) && !$this->record() ){
        global $wpdb;
        $sql = "SELECT * FROM $this->table WHERE email = %s";
        $record = $wpdb->get_row( $wpdb->prepare( $sql, $this->wpUser->user_email ) );
        if ( $record ){
          $wpdb->update( $this->table, ['wp_user_login' => $this->wpUser->user_login], ['user_id' => $record->user_id] );
          $this->username = $this->wpUser->user_login;
          $this->record = null;
        }

      }
    }

    $this->assignedJudgesProps = $this->plugin->config::$assignedJudgesProps;
  }

  public function userIdMatches( $userId ){
    $record = $this->record();
    if ( empty($record) ) return false;
    return $record->user_id == $userId;
  }

  public function hasUserLogin() {
    $record = $this->record();
    if ( empty($record) ) return false;
    return !empty($record->wp_user_login) && !str_starts_with($record->wp_user_login, 'ph-');
  }

  public function name(){
    $record = $this->record();
    if ( empty($record) ) return '';
    return $record->first_name . ' ' . $record->last_name;
  }

  public function cycleMeta($cycleId=null){
    if ( !$cycleId ){
      $cycle = $this->plugin->cycles->activeCycle();
      if ( !$cycle ) return [];
      $cycleId = $cycle->cycleId;
    }
    if ( isset($this->metaCache[$cycleId]) ){
      return $this->metaCache[$cycleId];
    }

    // ensure we have user_id
    $this->record();
    if ( empty($this->id) ) return [];

    global $wpdb;
    $sql = "SELECT * FROM $this->metaTable WHERE user_id = %d AND cycle_id = %d";
    $meta = $wpdb->get_results( $wpdb->prepare( $sql, $this->id, $cycleId ) );
    $out = [];
    foreach( $meta as $m ){
      if ( $m->meta_key === 'supporterApplicant' ) {
        if ( !isset($out['supporterApplicant']) ){
          $out['supporterApplicant'] = [];
        }
        $out['supporterApplicant'][] = $m->meta_value;
      } else if ( !empty($m->is_json) ){
        $out[$m->meta_key] = json_decode( $m->meta_value, true );
      } else {
        $out[$m->meta_key] = $m->meta_value;
      }

    }
    $this->metaCache[$cycleId] = $out;
    return $this->metaCache[$cycleId];
  }

  public function cycleMetaItem($key, $cycleId=null){
    $meta = $this->cycleMeta($cycleId);
    if ( isset($meta[$key]) ){
      return $meta[$key];
    }
    return null;
  }

  private $applicationEntryExports;
  public function getApplicationEntryExport($cycleId){
    if ( isset($this->applicationEntryExports[$cycleId]) ){
      return $this->applicationEntryExports[$cycleId];
    }
    return [];
  }

  public function setApplicationEntryExport($cycleId, $export ){
    if ( !isset($this->applicationEntryExports) ){
      $this->applicationEntryExports = [];
    }
    $this->applicationEntryExports[$cycleId] = $export;

  }

  public function setSupportEntryExport($cycleId, $export ){
    if ( !isset($this->supportEntryExports) ){
      $this->supportEntryExports = [];
    }
    $this->supportEntryExports[$cycleId] = $export;
  }

  private $supportEntryExports;
  public function getSupportEntryExport($cycleId){
    if ( isset($this->supportEntryExports[$cycleId]) ){
      return $this->supportEntryExports[$cycleId];
    }
    return [];
  }

  public function applicationStatus($cycleId=null){
    $out = [
      'value' => 'not-submitted',
      'label' => 'Not Submitted',
      'assignedJudgeIds' => [],
      'evaluatedJudgeIds' => [],
      'assignedAndEvaluatedJudgeIds' => [],
      'conflictOfInterestJudgeIds' => [],
      'assignedAndConflictOfInterestJudgeIds' => []
    ];

    $assignedJudgeIds = $this->assignedJudgeIds($cycleId);
    $out['assignedJudgeIds'] = $assignedJudgeIds['assigned'];
    $out['evaluatedJudgeIds'] = $assignedJudgeIds['evaluated'];
    $out['conflictOfInterestJudgeIds'] = $assignedJudgeIds['conflictOfInterest'];
    $out['assignedAndEvaluatedJudgeIds'] = array_intersect( $out['assignedJudgeIds'], $out['evaluatedJudgeIds'] );
    $out['assignedAndConflictOfInterestJudgeIds'] = array_intersect( $out['assignedJudgeIds'], $out['conflictOfInterestJudgeIds'] );

    if ( count($out['assignedJudgeIds']) ){
      $assignedCt = count($out['assignedJudgeIds']);
      $evaluatedCt = count($out['assignedAndEvaluatedJudgeIds']);
      $out['label'] = $evaluatedCt . '/' . $assignedCt . ' Evaluations Completed';

      if ( count($out['assignedAndEvaluatedJudgeIds']) == $assignedCt ){
        $out['value'] = 'evaluated';
      } else {
        $out['value'] = 'assigned';
      }
      return $out;
    }

    $meta = $this->cycleMeta($cycleId);
    if ( !empty($meta['hasSubmittedApplication']) ){
      $out['value'] = 'submitted';
      $out['label'] = 'Submitted';
      return $out;
    }
    return null;
  }

  private $assignedJudgesProps;
  protected $assignedJudgeIds;
  public function assignedJudgeIds($cycleId){
    if ( isset($this->assignedJudgeIds[$cycleId]) ){
      return $this->assignedJudgeIds[$cycleId];
    }
    $props = $this->assignedJudgesProps;
    $meta_keys = array_column( $props, 'meta_key' );
    $out = [];
    foreach ($props as $prop) {
      $out[$prop['outKey']] = [];
    }

    if ( !$this->record() ) return $out;
    $meta_value = strval( $this->record()->user_id );
    global $wpdb;
    $sql = "SELECT * FROM $this->metaTable WHERE meta_key IN (%s, %s) AND meta_value = %s AND cycle_id = %d";
    $meta = $wpdb->get_results( $wpdb->prepare( $sql, $meta_keys[0], $meta_keys[1], $meta_value, $cycleId ) );
    foreach( $meta as $m ){
      foreach ($props as $prop) {
        if ( $m->meta_key == $prop['meta_key'] ){
          $out[$prop['outKey']][] = $m->user_id;
        }
      }
    }
    $this->assignedJudgeIds[$cycleId] = $out;
    return $this->assignedJudgeIds[$cycleId];
  }

  public function setAssignedJudgeIdsMeta($userMeta){
    $byCycle = [];
    foreach( $userMeta as $m ){
      if ( empty($m->cycle_id) ) continue;
      if ( !isset($byCycle[$m->cycle_id]) ){
        $byCycle[$m->cycle_id] = [];
        foreach ($this->assignedJudgesProps as $p) {
          $byCycle[$m->cycle_id][$p['outKey']] = [];
        }
      }
      foreach ($this->assignedJudgesProps as $prop) {
        if ( $m->meta_key == $prop['meta_key'] && $m->meta_value == $this->record()->user_id){
          $byCycle[$m->cycle_id][$prop['outKey']][] = $m->user_id;
        }
      }
    }
    if ( !isset($this->assignedJudgeIds) ){
      $this->assignedJudgeIds = [];
    }
    foreach ($byCycle as $cycleId => $props) {
      $this->assignedJudgeIds[$cycleId] = $props;
    }
  }

  /**
   * @description Bulk set the meta cache for a cycle
   * @param array $meta - array of meta records from the database
   * @param int $cycleId - the cycle id
   */
  public function setCycleMeta($meta, $cycleId){
    $m = [];
    foreach( $meta as $dbRow ){
      if ( !empty($dbRow->is_json) ){
        $m[$dbRow->meta_key] = json_decode( $dbRow->meta_value, true );
      } else {
        $m[$dbRow->meta_key] = $dbRow->meta_value;
      }
    }
    $this->metaCache[$cycleId] = $m;
  }

  /**
   * @description Get the WP_User object for this user
   */
  protected $wpUser;
  public function wpUser(){
    if ( !empty( $this->wpUser ) ){
      return $this->wpUser;
    }
    $user = get_user_by( 'login', $this->username );
    if ( !$user && $this->record() && !empty($this->record()->email) ){
      $user = get_user_by( 'email', $this->record()->email );
    }
    $this->wpUser = $user;
    return $this->wpUser;
  }

  public function setWpUser($user){
    $this->wpUser = $user;
  }

  /**
   * @description Check if this user is a ucdlib-awards admin
   * @return boolean
   */
  protected $isAdmin;
  public function isAdmin(){
    if ( !empty( $this->isAdmin ) ){
      return $this->isAdmin;
    }
    $this->isAdmin = false;
    if ( $this->wpUser() ){
      $siteAdmin = in_array( 'administrator', $this->wpUser()->roles );
      if ( $siteAdmin ){
        $this->isAdmin = true;
        return $this->isAdmin;
      }
    }
    if ( $this->isPrizeAdmin() ){
      $this->isAdmin = true;
      return $this->isAdmin;
    }
    return $this->isAdmin;
  }

  public function isPrizeAdmin(){
    return $this->record() && $this->record()->is_admin;
  }

  public function setPrizeAdmin($value){
    if ( !$this->record() ) return false;
    $value = empty($value) ? 0 : 1;
    global $wpdb;
    $wpdb->update( $this->table, ['is_admin' => $value], ['user_id' => $this->record()->user_id] );
    $this->record = null;
    return true;
  }

  public function isJudge( $cycleId ){
    $meta = $this->cycleMeta($cycleId);
    if ( !empty($meta['isJudge']) ){
      return true;
    }
    return false;
  }

  /**
   * @description Get the user record as an associative array
   */
  public function toArray($additionalProps = []){
    $out = (array) $this->record();

    if ( !empty($additionalProps['applicationEntry']) ){
      $out['applicationEntry'] = $this->applicationEntry();
    }
    if ( !empty($additionalProps['applicationEntryBrief']) ){
      $cycleId = $additionalProps['applicationEntryBrief'];
      $entry = $this->applicationEntry($cycleId);
      if ( $entry ) {
        $out['applicationEntry'] = [
          'entry_id' => $entry->entry_id,
          'form_id' => $entry->form_id,
          'date_created_sql' => $entry->date_created_sql
        ];
      } else {
        $out['applicationEntry'] = null;
      }

    }
    if ( !empty($additionalProps['applicationCategory']) ){
      $cycleId = $additionalProps['applicationCategory'];
      $out['applicationCategory'] = $this->applicationCategory($cycleId);
    }
    if ( !empty($additionalProps['applicationStatus']) ){
      $cycleId = $additionalProps['applicationStatus'];
      $out['applicationStatus'] = $this->applicationStatus($cycleId);
    }
    if ( !empty($additionalProps['assignedJudgeIds']) ){
      $cycleId = $additionalProps['assignedJudgeIds'];
      $out['assignedJudgeIds'] = $this->assignedJudgeIds($cycleId);
    }

    return $out;
  }

  public function applicationCategory($cycleId=null){
    $entry = $this->applicationEntry($cycleId);
    if ( !$entry ) return false;
    if ( !isset($entry->meta_data['forminator_addon_ucdlib-awards_category']['value']) ) return false;
    $value = $entry->meta_data['forminator_addon_ucdlib-awards_category']['value'];
    $out = [
      'value' => $value,
      'label' => 'Unknown'
    ];

    // get saved category label
    $cycle = $this->plugin->cycles->getById($cycleId);
    if ( !$cycle ) return $out;
    $fieldSlug = $cycle->record()->category_form_slug;
    if ( isset($entry->meta_data[$fieldSlug]['value']) ){
      $out['label'] = $entry->meta_data[$fieldSlug]['value'];
    }

    // replace with current category label if available
    $categories = $cycle->categories();
    if ( !$categories ) return $out;
    foreach ($categories as $category) {
      if ( $category['value'] == $value ){
        $out['label'] = $category['label'];
        break;
      }
    }

    return $out;

  }

  public function setApplicationEntry($entry, $cycleId){
    if ( empty($this->applicationEntry) ){
      $this->applicationEntry = [];
    }
    $this->applicationEntry[$cycleId] = $entry;
  }

  protected $applicationEntry;
  public function applicationEntry($cycleId=null){
    if ( empty($this->applicationEntry) ){
      $this->applicationEntry = [];
    }

    if ( !$cycleId || is_bool($cycleId) ){
      $activeCycle = $this->plugin->cycles->activeCycle();
      if ( !$activeCycle ) return false;
      $cycleId = $activeCycle->cycleId;
    }

    if ( isset($this->applicationEntry[$cycleId]) ){
      return $this->applicationEntry[$cycleId];
    }

    // check user record exists
    $this->record();
    if ( !$this->id ){
      $this->applicationEntry[$cycleId] = false;
      return $this->applicationEntry[$cycleId];
    }

    global $wpdb;
    $table = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::FORM_ENTRY_META );
    $keys = [
      'user' => 'forminator_addon_ucdlib-awards_applicant_id',
      'cycle' => 'forminator_addon_ucdlib-awards_cycle_id',
      'app' => 'forminator_addon_ucdlib-awards_is_application'
    ];
    $sql = "SELECT * FROM $table WHERE (meta_key = %s AND meta_value = %d) OR (meta_key = %s AND meta_value = %d) OR (meta_key = %s AND meta_value = %d) ORDER BY date_created DESC";
    $entryMeta = $wpdb->get_results( $wpdb->prepare( $sql, $keys['user'], $this->id, $keys['cycle'], $cycleId, $keys['app'], $cycleId ) );
    $entryId = null;
    $entryIds = [];
    foreach( $entryMeta as $meta ){
      if ( !isset($entryIds[$meta->entry_id]) ){
        $entryIds[$meta->entry_id] = 0;
      }
      $entryIds[$meta->entry_id]++;
      if ( $entryIds[$meta->entry_id] == count($keys) ){
        $entryId = $meta->entry_id;
        break;
      }
    }
    if ( !$entryId ){
      $this->applicationEntry[$cycleId] = false;
      return $this->applicationEntry[$cycleId];
    }

    $table = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::FORM_ENTRY );
    $sql = "SELECT form_id FROM $table WHERE entry_id = %d";
    $formId = $wpdb->get_var( $wpdb->prepare( $sql, $entryId ) );
    if ( !$formId ){
      $this->applicationEntry[$cycleId] = false;
      return $this->applicationEntry[$cycleId];
    }
    $this->applicationEntry[$cycleId] = $this->plugin->forms->getEntry( $formId, $entryId );
    return $this->applicationEntry[$cycleId];
  }

  /**
   * @description Get the user's ucdlib-awards record from the database
   */
  protected $record;
  public function record(){
    if ( !empty( $this->record ) ){
      return $this->record;
    }
    global $wpdb;
    $usersTable = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::USERS );
    $this->record = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $usersTable WHERE wp_user_login = %s", strval($this->username) ) );
    if ( isset($this->record->user_id) ){
      $this->id = $this->record->user_id;
    }
    return $this->record;
  }

  public function recordRetrieved(){
    return !empty($this->record);
  }

  public function setRecord($record){
    $this->record = $record;
  }

  public function create( $record ){
    $r = [
      'first_name' => !empty($record['first_name']) ? $record['first_name'] : '',
      'last_name' => !empty($record['last_name']) ? $record['last_name'] : '',
      'wp_user_login' => $this->username,
      'email' => !empty($record['email']) ? $record['email'] : '',
      'is_admin' => !empty($record['is_admin']) ? $record['is_admin'] : 0,
      'date_created' => date('Y-m-d H:i:s'),
      'date_updated' => date('Y-m-d H:i:s')
    ];
    global $wpdb;
    $wpdb->insert( $this->table, $r );
    $this->clearCache();
    return true;
  }

  public function createFromWpAccount( $isAdmin=false ){
    if ( !$this->wpUser() ){
      return false;
    }
    $record = [
      'first_name' => $this->wpUser()->user_firstname,
      'last_name' => $this->wpUser()->user_lastname,
      'wp_user_login' => $this->wpUser()->user_login,
      'email' => $this->wpUser()->user_email,
      'is_admin' => $isAdmin ? 1 : 0,
      'date_created' => date('Y-m-d H:i:s'),
      'date_updated' => date('Y-m-d H:i:s')
    ];
    global $wpdb;
    $wpdb->insert( $this->table, $record );
    $this->clearCache();
    return true;
  }

  public function updateNameFromWpAccount( ){
    if ( !$this->wpUser() ){
      return false;
    }
    $record = [
      'first_name' => $this->wpUser()->user_firstname,
      'last_name' => $this->wpUser()->user_lastname,
      'date_updated' => date('Y-m-d H:i:s')
    ];
    global $wpdb;
    $wpdb->update( $this->table, $record, ['wp_user_login' => $this->wpUser()->user_login] );
    $this->clearCache();
    return true;
  }

  // checks if value exists for key in meta table
  // if does not, inserts it
  public function updateMetaWithValue($key, $value, $cycleId) {
    global $wpdb;

    // create account if it doesn't exist
    if ( !$this->record() ){
      $this->createFromWpAccount();
    }
    if ( !$this->record() ){
      return false;
    }

    $is_json = 0;
    if ( is_string($value) ){
      $value = $value;
    } else {
      $value = json_encode( $value );
      $is_json = 1;
    }

    // check if meta record already exists
    $isUpdate = false;
    $sql = "SELECT * FROM $this->metaTable WHERE user_id = %d AND cycle_id = %d AND meta_key = %s AND meta_value = %s";
    $metaRecord = $wpdb->get_row( $wpdb->prepare($sql, $this->record()->user_id, $cycleId, $key, $value ) );
    if ( $metaRecord ){
      $isUpdate = true;
    }

    // update or insert meta record
    $record = [
      'user_id' => $this->record()->user_id,
      'cycle_id' => $cycleId,
      'meta_key' => $key,
      'meta_value' => $value,
      'date_updated' => date('Y-m-d H:i:s')
    ];

    if ( $isUpdate ){
      $wpdb->update( $this->metaTable, $record, ['meta_id' => $metaRecord->meta_id] );
    } else {
      $record['date_created'] = date('Y-m-d H:i:s');
      $wpdb->insert( $this->metaTable, $record );
    }

    // clear metacache
    if ( isset($this->metaCache[$cycleId]) ){
      unset($this->metaCache[$cycleId]);
    }
    return true;
  }

  public function updateMeta($key, $value, $cycleId){
    global $wpdb;

    // create account if it doesn't exist
    if ( !$this->record() ){
      $this->createFromWpAccount();
    }
    if ( !$this->record() ){
      return false;
    }

    // check if meta record already exists
    $isUpdate = false;
    $metaRecord = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $this->metaTable WHERE user_id = %d AND cycle_id = %d AND meta_key = %s", $this->record()->user_id, $cycleId, $key ) );
    if ( $metaRecord ){
      $isUpdate = true;
    }

    // update or insert meta record
    $record = [
      'user_id' => $this->record()->user_id,
      'cycle_id' => $cycleId,
      'meta_key' => $key,
      'date_updated' => date('Y-m-d H:i:s')
    ];
    if ( is_string($value) ){
      $record['meta_value'] = $value;
    } else {
      $record['meta_value'] = json_encode( $value );
      $record['is_json'] = 1;
    }
    if ( $isUpdate ){
      $wpdb->update( $this->metaTable, $record, ['meta_id' => $metaRecord->meta_id] );
    } else {
      $record['date_created'] = date('Y-m-d H:i:s');
      $wpdb->insert( $this->metaTable, $record );
    }

    // clear metacache
    if ( isset($this->metaCache[$cycleId]) ){
      unset($this->metaCache[$cycleId]);
    }
    return true;
  }

  public function deleteMetaWithValue($key, $value, $cycleId){
    global $wpdb;

    // delete meta record
    $wpdb->delete( $this->metaTable, ['user_id' => $this->record()->user_id, 'cycle_id' => $cycleId, 'meta_key' => $key, 'meta_value' => $value] );

    // clear metacache
    if ( isset($this->metaCache[$cycleId]) ){
      unset($this->metaCache[$cycleId]);
    }
    return true;
  }

  public function deleteMeta($key, $cycleId){
    global $wpdb;

    // delete meta record
    $wpdb->delete( $this->metaTable, ['user_id' => $this->record()->user_id, 'cycle_id' => $cycleId, 'meta_key' => $key] );

    // clear metacache
    if ( isset($this->metaCache[$cycleId]) ){
      unset($this->metaCache[$cycleId]);
    }
    return true;
  }

  public function clearCache(){
    $this->record = null;
    $this->metaCache = [];
    $this->id = null;
    $this->wpUser = null;
    $this->isAdmin = null;
    $this->applicationEntry = null;
  }

}
