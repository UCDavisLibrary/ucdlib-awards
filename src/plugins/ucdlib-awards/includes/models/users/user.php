<?php

/**
 * @description Model for a single awards user
 */
class UcdlibAwardsUser {

  public function __construct( $username=null, $record=null ){
    if ( $username ){
      $this->username = $username;
      if ( $record ) {
        $this->record = $record;
      }
    } else {
      $this->wpUser = wp_get_current_user();
      $this->username = $this->wpUser->user_login;
    }
    $this->table = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::USERS );
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

  public function clearCache(){
    $this->record = null;
    $this->wpUser = null;
    $this->isAdmin = null;
  }

}
