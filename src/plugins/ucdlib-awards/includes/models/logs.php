<?php

/**
 * @description Model for writing and reading logs.
 * Used for the Activity Feed functionality
 */
class UcdlibAwardsLogs {
  public function __construct( $plugin ){
    $this->plugin = $plugin;
    $this->table = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::LOGS );
    $this->userTable = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::USERS );
    $this->perPage = 20;

    $this->logTypes = [
      'cycle' => [
        'slug' => 'cycle',
        'label' => 'Cycle',
        'subTypes' => [
          'create' => [
            'slug' => 'create',
            'label' => 'Create',
            'description' => 'Cycle created'
          ],
          'update' => [
            'slug' => 'update',
            'label' => 'Update',
            'description' => 'Cycle updated'
          ],
          'delete' => [
            'slug' => 'delete',
            'label' => 'Delete',
            'description' => 'Cycle deleted'
          ]
        ]
      ]
    ];

  }

  /**
   * @description Write a cycle update event to the logs table
   */
  public function logCycleEvent($cycleId, $subType) {
    if ( !isset($this->logTypes['cycle']['subTypes'][$subType]) ) {
      error_log('UcdlibAwardsLogs::logCycleEvent() - Invalid subType: ' . $subType);
      return false;
    }
    $logDetails = [];
    $log = [
      'log_type' => $this->logTypes['cycle']['slug'],
      'log_subtype' => $this->logTypes['cycle']['subTypes'][$subType]['slug'],
      'cycle_id' => $cycleId,
      'date_created' =>  date('Y-m-d H:i:s')
    ];

    $currentUser = $this->plugin->users->currentUser();
    if ( $currentUser->wpUser() ) {
      $logDetails['wp_user'] = [
        'id' => $currentUser->wpUser()->ID,
        'username' => $currentUser->wpUser()->user_login,
        'email' => $currentUser->wpUser()->user_email,
        'name' => $currentUser->wpUser()->display_name
      ];
    }
    if ( $currentUser->record() ){
      $log['user_id_subject'] = $currentUser->record()->user_id;
    }

    if ( count($logDetails) > 0 ) {
      $log['log_value'] = json_encode($logDetails);
    }

    global $wpdb;
    $wpdb->insert( $this->table, $log );
    return true;
  }

  public function query($args){
    $page = isset($args['page']) ? $args['page'] : 1;
    $offset = ($page - 1) * $this->perPage;
    $types = isset($args['types']) ? $args['types'] : [];
    $user = isset($args['user']) ?  intval($args['user']) : 0;
    $from = isset($args['from']) ? $args['from'] : '';
    $to = isset($args['to']) ? $args['to'] : '';

    $sql = "
    SELECT
      l.*
    FROM
      $this->table l
    WHERE
      1 = 1
    ";

    $countSql = "
    SELECT
      COUNT(*)
    FROM
      $this->table l
    WHERE
      1 = 1
    ";

    if ( count($types) > 0 ) {
      $s = " AND l.log_type IN ('" . implode("','", $types) . "')";
      $sql .= $s;
      $countSql .= $s;
    }

    if ( $user > 0 ) {
      $s = " AND l.user_id_subject = $user OR l.user_id_object = $user";
      $sql .= $s;
      $countSql .= $s;
    }

    if ( $from !== '' ) {
      $s = " AND l.date_created >= '$from'";
      $sql .= $s;
      $countSql .= $s;

    }

    if ( $to !== '' ) {
      $s = " AND l.date_created <= '$to'";
      $sql .= $s;
      $countSql .= $s;
    }

    $sql .= "
    LIMIT {$this->perPage} OFFSET {$offset}
    ";

    global $wpdb;
    $totalResults = $wpdb->get_var( $countSql );
    $results = $wpdb->get_results( $sql );
    return [
      'totalResults' => $totalResults,
      'results' => $results
    ];
  }
}
