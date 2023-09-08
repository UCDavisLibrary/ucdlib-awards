<?php

/**
 * @description Model for a single awards user
 */
class UcdlibAwardsUser {

  public function __construct( $username=null ){
    if ( $username ){
      $this->username = $username;
    } else {
      $this->wpUser = wp_get_current_user();
      $this->username = $this->wpUser->user_login;
    }
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

}
