<?php

/**
 * @description Model for a single awards user
 */
class UcdlibAwardsUser {

  public function __construct( $username=null, $record=null ){
    $this->id = null;
    if ( $username ){
      $this->username = $username;
      if ( $record ) {
        $this->record = $record;
        $this->id = $record->user_id;
      }
    } else {
      $this->wpUser = wp_get_current_user();
      $this->username = $this->wpUser->user_login;
    }
    $this->metaCache = [];
    $this->plugin = $GLOBALS['ucdlibAwards'];

    $this->table = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::USERS );
    $this->metaTable = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::USER_META );
  }

  public function hasUserLogin() {
    $record = $this->record();
    if ( empty($record) ) return false;
    return !empty($record->wp_user_login) && !str_starts_with($record->wp_user_login, 'ph-');
  }

  public function name(){
    $record = $this->record();
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
      if ( !empty($m->is_json) ){
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

  public function applicationStatus($cycleId=null){
    # assigned to x reviewers
    # reviewed by x/y reviewers
    $meta = $this->cycleMeta($cycleId);
    if ( !empty($meta['hasSubmittedApplication']) ){
      return ['value' => 'submitted', 'label' => 'Submitted'];

    }

    // status two: x/y reviewers
    return null;
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
    $this->wpUser = get_user_by( 'login', $this->username );
    return $this->wpUser;
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
    if ( $this->record() && $this->record()->is_admin ){
      $this->isAdmin = true;
      return $this->isAdmin;
    }
    return $this->isAdmin;
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
      'cycle' => 'forminator_addon_ucdlib-awards_cycle_id'
    ];
    $sql = "SELECT * FROM $table WHERE (meta_key = %s AND meta_value = %d) OR (meta_key = %s AND meta_value = %d) ORDER BY date_created DESC";
    $entryMeta = $wpdb->get_results( $wpdb->prepare( $sql, $keys['user'], $this->id, $keys['cycle'], $cycleId ) );
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
    $this->record = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $usersTable WHERE wp_user_login = %s", $this->username ) );
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

  public function clearCache(){
    $this->record = null;
    $this->metaCache = [];
    $this->id = null;
    $this->wpUser = null;
    $this->isAdmin = null;
    $this->applicationEntry = null;
  }

}
