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

  public function clearCache(){
    $this->userCache = [];
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

  public function getByEmail($email){
    foreach ($this->userCache as $username => $user) {
      if ( $user->recordRetrieved() && $user->record()->email == $email ){
        return $user;
      }
    }
    global $wpdb;
    $sql = "SELECT * FROM $this->table WHERE email = '$email'";
    $result = $wpdb->get_row( $sql );
    if ( !$result ) return false;
    if ( isset( $this->userCache[ $result->wp_user_login ] ) ){
      $this->userCache[ $result->wp_user_login ]->setRecord( $result );
      return $this->userCache[ $result->wp_user_login ];
    }
    $user = new UcdlibAwardsUser( $result->wp_user_login, $result );
    $this->userCache[ $user->username ] = $user;
    return $this->userCache[ $user->username ];
  }

  public function getByUsername($username){
    if ( isset( $this->userCache[ $username ] ) ){
      return $this->userCache[ $username ];
    }
    $user = new UcdlibAwardsUser( $username );
    $this->userCache[ $username ] = $user;
    return $this->userCache[ $username ];
  }

  public function userRecordExists( $username=null, $email=null ){
    if ( !empty($username) ){
      $user = $this->getByUsername( $username );
      if ( $user->record() ) return $user;
    }

    if ( !empty($email) ){
      $user = $this->getByEmail( $email );
      if ( $user->record() ) return $user;
    }

    return false;
  }

  public function toArrays($users, $additionalProps = []){
    if ( empty($users) ) return [];
    if ( !is_array($users) ) {
      $users = [$users];
    }
    if ( empty($users) ) return [];

    $out = [];
    foreach ( $users as &$user ){
      $out[] = $user->toArray( $additionalProps );
    }
    return $out;
  }

  public function getByUserIds($userIds){
    if ( !$userIds ) return [];
    if ( !is_array($userIds) ) {
      $userIds = [$userIds];
    }
    if ( empty($userIds) ) return [];

    $users = [];
    $userIdsInCache = [];
    foreach ($this->userCache as $username => $user) {
      if ( $user->recordRetrieved() && in_array( $user->record()->user_id, $userIds ) ){
        $users[] = $user;
        $userIdsInCache[] = $user->record()->user_id;
      }
    }
    $usersNotInCache = array_diff( $userIds, $userIdsInCache );

    if ( empty($usersNotInCache) ) return $users;

    global $wpdb;
    $sql = "SELECT * FROM $this->table WHERE user_id IN (" . implode(',', $usersNotInCache) . ")";
    $results = $wpdb->get_results( $sql );
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
