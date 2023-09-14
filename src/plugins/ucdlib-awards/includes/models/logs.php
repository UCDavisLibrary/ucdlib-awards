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
        'label' => 'Cycle Modifications',
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
   * @description Get list of allowable filters
   */
  public function getFilters($cycleId = null){
    $filters = [];

    $types = [];
    foreach ( $this->logTypes as $typeKey => $type ){
      $types[] = [
        'value' => $type['slug'],
        'label' => $type['label']
      ];
    }
    $filters[] = [
      'queryVar' => 'types',
      'label' => 'Log Type',
      'type' => 'multiSelect',
      'options' => $types
    ];

    $filters[] = [
      'queryVar' => 'applicant',
      'label' => 'Applicant',
      'type' => 'multiSelect',
      'options' => []
    ];

    $filters[] = [
      'queryVar' => 'judge',
      'label' => 'Judge',
      'type' => 'multiSelect',
      'options' => []
    ];

    $showSupporters = false;
    if ( $cycleId ){
      $cycle = $this->plugin->cycles->getById($cycleId);
      if ( $cycle && $cycle->supportIsEnabled() ){
        $showSupporters = true;
      }
    }
    if ( $showSupporters ){
      $filters[] = [
        'queryVar' => 'user',
        'label' => 'Supporter',
        'type' => 'multiSelect',
        'options' => []
      ];
    }

    return $filters;
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
    $cycle = isset($args['cycle']) ? $args['cycle'] : null;
    $types = isset($args['types']) ? $args['types'] : [];
    $applicant = isset($args['applicant']) ?  $args['applicant'] : [];
    $judge = isset($args['judge']) ?  $args['judge'] : [];
    $supporter = isset($args['supporter']) ?  $args['supporter'] : [];
    $users = isset($args['user']) ?  $args['user'] : [];
    $from = isset($args['from']) ? $args['from'] : '';
    $to = isset($args['to']) ? $args['to'] : '';
    $errors = isset($args['errors']) ? $args['errors'] : 'exclude';

    $users = array_merge($applicant, $judge, $supporter, $users);

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

    if ( $cycle !== null ) {
      $sql .= " AND l.cycle_id = $cycle";
      $countSql .= " AND l.cycle_id = $cycle";
    }

    if ( count($types) > 0 ) {
      $s = " AND l.log_type IN ('" . implode("','", $types) . "')";
      $sql .= $s;
      $countSql .= $s;
    }

    if ( count($users) > 0 ) {
      $s = " AND (l.user_id_subject IN (" . implode(',', $users) . ")";
      $s .= " OR l.user_id_object IN (" . implode(',', $users) . "))";
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

    if ( $errors == 'exclude' ) {
      $sql .= " AND l.is_error = 0";
      $countSql .= " AND l.is_error = 0";
    } elseif ( $errors == 'only' ) {
      $sql .= " AND l.is_error = 1";
      $countSql .= " AND l.is_error = 1";
    }

    $sql .= "
    ORDER BY l.date_created DESC
    LIMIT {$this->perPage} OFFSET {$offset}
    ";

    global $wpdb;
    $totalResults = $wpdb->get_var( $countSql );
    $results = $wpdb->get_results( $sql );
    return [
      'totalResults' => intval($totalResults),
      'totalPages' => ceil($totalResults / $this->perPage),
      'results' => $results
    ];
  }
}
