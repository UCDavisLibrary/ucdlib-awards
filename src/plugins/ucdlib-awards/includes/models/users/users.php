<?php

require_once( __DIR__ . '/user.php' );

/**
 * @description Model for querying awards users
 */
class UcdlibAwardsUsers {

  public function __construct( $plugin ){
    $this->plugin = $plugin;

    // associative array of username => UcdlibAwardsUser object
    $this->userCache = [];

    $this->table = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::USERS );
    $this->metaTable = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::USER_META );
  }

  /**
   * @description Get the logged in user
   */
  protected $currentUser;
  public function currentUser(){
    if ( !empty( $this->currentUser ) ){
      return $this->currentUser;
    }
    $user = new UcdlibAwardsUser();
    $this->userCache[ $user->username ] = $user;
    $this->currentUser = &$this->userCache[ $user->username ];
    return $this->currentUser;
  }

  public function getByUsername($username){
    if ( isset( $this->userCache[ $username ] ) ){
      return $this->userCache[ $username ];
    }
    $user = new UcdlibAwardsUser( $username );
    $this->userCache[ $username ] = $user;
    return $this->userCache[ $username ];
  }

  public function getByUserIds($userIds){
    if ( !$userIds ) return [];
    if ( !is_array($userIds) ) {
      $userIds = [$userIds];
    }
    if ( empty($userIds) ) return [];

    global $wpdb;
    $sql = "SELECT * FROM $this->table WHERE user_id IN (" . implode(',', $userIds) . ")";
    $results = $wpdb->get_results( $sql );
    $users = [];
    foreach ( $results as $result ){
      $user = new UcdlibAwardsUser( $result->wp_user_login, $result );
      $users[] = $user;
      $this->userCache[ $user->username ] = $user;
    }
    return $users;
  }

  public function getAllApplicants($cycleId){
    if ( !$cycleId ) return [];
    global $wpdb;
    $sql = "
    SELECT
      u.*
    FROM
      $this->table u
    INNER JOIN
      $this->metaTable m
    ON
      u.user_id = m.user_id
    WHERE
      m.meta_key = 'isApplicant' AND
      m.meta_value = 'true' AND
      m.cycle_id = $cycleId
    ";
    $results = $wpdb->get_results( $sql );
    $users = [];
    foreach ( $results as $result ){
      $user = new UcdlibAwardsUser( $result->wp_user_login, $result );
      $users[] = $user;
      $this->userCache[ $user->username ] = $user;
    }
    return $users;

  }

  public function getApplicantCount($cycleId){
    if ( !$cycleId ) return 0;
    global $wpdb;
    $sql = "
    SELECT
      COUNT(*)
    FROM
      $this->table u
    INNER JOIN
      $this->metaTable m
    ON
      u.user_id = m.user_id
    WHERE
      m.meta_key = 'isApplicant' AND
      m.meta_value = 'true' AND
      m.cycle_id = $cycleId
    ";
    $count = $wpdb->get_var( $sql );
    $count = intval( $count );
    return $count;
  }

}
