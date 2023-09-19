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

  public function name(){
    $record = $this->record();
    return $record->first_name . ' ' . $record->last_name;
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

  protected $applicationEntry;
  public function applicationEntry($cycleId){
    if ( !empty( $this->applicationEntry ) ){
      return $this->applicationEntry;
    }

    if ( !$cycleId ){
      $activeCycle = $this->plugin->cycles->activeCycle();
      if ( !$activeCycle ) return false;
      $cycleId = $activeCycle->cycleId;
    }

    // check user record exists
    $this->record();
    if ( !$this->id ){
      return false;
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
      return false;
    }

    $table = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::FORM_ENTRY );
    $sql = "SELECT form_id FROM $table WHERE entry_id = %d";
    $formId = $wpdb->get_var( $wpdb->prepare( $sql, $entryId ) );
    if ( !$formId ){
      return false;
    }
    $this->applicationEntry = $this->plugin->forms->getEntry( $formId, $entryId );
    return $this->applicationEntry;
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
      'meta_value' => json_encode( $value ),
      'date_updated' => date('Y-m-d H:i:s')
    ];
    if ( $isUpdate ){
      $wpdb->update( $this->metaTable, $record, ['meta_id' => $metaRecord->meta_id] );
    } else {
      $record['date_created'] = date('Y-m-d H:i:s');
      $wpdb->insert( $this->metaTable, $record );
    }
    if ( !isset($this->metaCache[$cycleId]) ){
      $this->metaCache[$cycleId] = [];
    }
    $this->metaCache[$cycleId][$key] = $value;
    return true;
  }

  public function clearCache(){
    $this->record = null;
    $this->metaCache = [];
    $this->id = null;
    $this->wpUser = null;
    $this->isAdmin = null;
  }

}
