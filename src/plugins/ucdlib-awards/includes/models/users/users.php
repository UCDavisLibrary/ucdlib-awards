<?php

require_once( __DIR__ . '/user.php' );

/**
 * @description Model for querying awards users
 */
class UcdlibAwardsUsers {

  public $plugin;
  public $userCache;
  public $table;
  public $metaTable;

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
      if ( !empty($user) && $user->record() ) return $user;
    }

    if ( !empty($email) ){
      $user = $this->getByEmail( $email );
      if ( !empty($user) && $user->record() ) return $user;
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

  public function getByUserId($userId){
    $users = $this->getByUserIds( $userId );
    if ( empty($users) ) return false;
    return $users[0];
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

  /**
   * @description Get all users who have been a judge in any cycle, with their cycle and category metadata.
   * @param array $opts
   * @param int|null $opts['exclude_cycle_id'] - exclude judges assigned to this cycle
   * @returns array - each item has basic user fields plus 'cycles' (array of cycle_ids) and 'categories' (array of {cycle_id, category})
   */
  public function getAllJudges($opts=[]){
    global $wpdb;

    $excludeCycleId = isset($opts['exclude_cycle_id']) ? intval($opts['exclude_cycle_id']) : null;

    $excludeClause = '';
    if ( $excludeCycleId ){
      $excludeClause = $wpdb->prepare(
        "AND u.user_id NOT IN (
          SELECT user_id FROM $this->metaTable
          WHERE meta_key = 'isJudge' AND meta_value = 'true' AND cycle_id = %d
        )",
        $excludeCycleId
      );
    }

    $sql = "
    SELECT DISTINCT u.*
    FROM $this->table u
    INNER JOIN $this->metaTable m ON u.user_id = m.user_id
    WHERE m.meta_key = 'isJudge' AND m.meta_value = 'true'
    $excludeClause
    ";
    $userRecords = $wpdb->get_results( $sql );
    if ( empty($userRecords) ) return [];

    $userIds = array_map(function($r){ return $r->user_id; }, $userRecords);
    $placeholders = implode(',', array_fill(0, count($userIds), '%d'));

    $cycleSql = $wpdb->prepare(
      "SELECT user_id, cycle_id FROM $this->metaTable
       WHERE meta_key = 'isJudge' AND meta_value = 'true' AND user_id IN ($placeholders)",
      ...$userIds
    );
    $cycleRows = $wpdb->get_results( $cycleSql );

    $categorySql = $wpdb->prepare(
      "SELECT user_id, cycle_id, meta_value as category FROM $this->metaTable
       WHERE meta_key = 'judgeCategory' AND user_id IN ($placeholders)",
      ...$userIds
    );
    $categoryRows = $wpdb->get_results( $categorySql );

    $cyclesByUserId = [];
    foreach ( $cycleRows as $row ){
      $cyclesByUserId[$row->user_id][] = intval($row->cycle_id);
    }

    $categoriesByUserId = [];
    foreach ( $categoryRows as $row ){
      $categoriesByUserId[$row->user_id][] = [
        'cycle_id' => intval($row->cycle_id),
        'category' => $row->category
      ];
    }

    $out = [];
    foreach ( $userRecords as $record ){
      $uid = $record->user_id;
      $user = (array) $record;
      $user['cycles'] = isset($cyclesByUserId[$uid]) ? $cyclesByUserId[$uid] : [];
      $user['categories'] = isset($categoriesByUserId[$uid]) ? $categoriesByUserId[$uid] : [];
      $out[] = $user;
    }
    return $out;
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
