<?php

/**
 * @description Model for writing and reading logs.
 * Used for the Activity Feed functionality
 */
class UcdlibAwardsLogs {

  public $plugin;
  public $table;
  public $userTable;
  public $perPage;
  public $logTypes;

  public function __construct( $plugin ){
    $this->plugin = $plugin;
    $this->table = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::LOGS );
    $this->userTable = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::USERS );
    $this->perPage = 15;

    $this->logTypes = [
      'cycle' => [
        'slug' => 'cycle',
        'label' => 'Cycle Modification',
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
      ],
      'application' => [
        'slug' => 'application',
        'label' => 'Application',
        'subTypes' => [
          'submit' => [
            'slug' => 'submit',
            'label' => 'Submit',
            'description' => 'Application submitted'
          ],
          'delete' => [
            'slug' => 'delete',
            'label' => 'Delete',
            'description' => 'Application deleted'
          ],
          'support-submitted' => [
            'slug' => 'support-submitted',
            'label' => 'Support Submitted',
            'description' => 'Support letter submitted'
          ]
        ]
      ],
      'rubric' => [
        'slug' => 'rubric',
        'label' => 'Rubric',
        'subTypes' => [
          'create' => [
            'slug' => 'create',
            'label' => 'Create',
            'description' => 'Rubric created'
          ],
          'update' => [
            'slug' => 'update',
            'label' => 'Update',
            'description' => 'Rubric updated'
          ],
          'delete' => [
            'slug' => 'delete',
            'label' => 'Delete',
            'description' => 'Rubric deleted'
          ]
        ]
      ],
      'evaluation-admin' => [
        'slug' => 'evaluation-admin',
        'label' => 'Evaluation Administration',
        'subTypes' => [
          'judge-added' => [
            'slug' => 'judge-added',
            'label' => 'Judge Added',
            'description' => 'Judge added to evaluation'
          ],
          'judge-removed' => [
            'slug' => 'judge-removed',
            'label' => 'Judge Removed',
            'description' => 'Judge removed from evaluation'
          ],
          'application-assignment' => [
            'slug' => 'application-assignment',
            'label' => 'Application Assignment',
            'description' => 'Application assigned to judge'
          ],
          'application-unassigned' => [
            'slug' => 'application-unassigned',
            'label' => 'Application Unassigned',
            'description' => 'Application unassigned from judge'
          ]
        ]
      ],
      'evaluation' => [
        'slug' => 'evaluation',
        'label' => 'Evaluation',
        'subTypes' => [
          'conflict-of-interest' => [
            'slug' => 'conflict-of-interest',
            'label' => 'Conflict of Interest',
            'description' => 'Conflict of interest declared'
          ],
          'completed' => [
            'slug' => 'completed',
            'label' => 'Completed',
            'description' => 'Evaluation completed'
          ]
        ]
      ],
      'email' => [
        'slug' => 'email',
        'label' => 'Email',
        'subTypes' => [
          'application-confirmation' => [
            'slug' => 'application-confirmation',
            'label' => 'Application Confirmation Sent',
            'description' => 'Application confirmation email sent to applicant'
          ],
          'update-settings' => [
            'slug' => 'update-settings',
            'label' => 'Update Settings',
            'description' => 'Email settings updated'
          ],
          'applicant-assigned' => [
            'slug' => 'applicant-assigned',
            'label' => 'Applicant Assigned',
            'description' => 'Email sent to judge when applicant(s) assigned'
          ],
          'evaluation-nudge' => [
            'slug' => 'evaluation-nudge',
            'label' => 'Evaluation Nudge',
            'description' => 'Evaluation reminder email sent to judge'
          ],
          'support-requested' => [
            'slug' => 'support-requested',
            'label' => 'Support Requested',
            'description' => 'Support letter request email sent to supporter'
          ],
          'supporter-nudge' => [
            'slug' => 'supporter-nudge',
            'label' => 'Supporter Nudge',
            'description' => 'Support letter reminder email sent to supporter'
          ]
        ]
      ]
    ];

  }

  /**
   * @description Get list of allowable filters
   */
  public function getFilters($cycleId = null){
    $cycle = $this->plugin->cycles->getById($cycleId);
    if ( empty($cycle) ) return [];
    $filters = [];

    $filters[] = [
      'queryVar' => 'from',
      'label' => 'Log Date - From',
      'type' => 'date'
    ];
    $filters[] = [
      'queryVar' => 'to',
      'label' => 'Log Date - To',
      'type' => 'date'
    ];

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
      'options' => array_map(function($user){
        return [
          'value' => $user->id,
          'label' => $user->name()
        ];
      }, $cycle->allApplicants())
    ];

    $filters[] = [
      'queryVar' => 'judge',
      'label' => 'Judge',
      'type' => 'multiSelect',
      'options' => array_map(function($user){
        return [
          'value' => $user['id'],
          'label' => $user['name']
        ];
      }, $cycle->judges(true))
    ];

    $showSupporters = false;
    if ( $cycleId ){
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
   * @description Get a list of associated user ids for an array of log objects
   */
  public function extractUserIds($logs){
    $users = [];
    foreach( $logs as $log ){
      if ( $log->user_id_subject ){
        $users[] = $log->user_id_subject;
      }
      if ( $log->user_id_object ){
        $users[] = $log->user_id_object;
      }
    }
    return array_unique($users);
  }

  /**
   * @description Populate the log_type_label field for an array of log objects
   */
  public function getLogTypeLabel( $records ){
    $logTypes = $this->logTypes;
    foreach( $records as &$record ){
      if ( !$record->log_type || !isset($logTypes[$record->log_type]) ){
        $record->log_type_label = '';
        continue;
      }
      $record->log_type_label = $logTypes[$record->log_type]['label'];
    }
    return $records;
  }

  public function decodeLogDetails( $records ){
    foreach( $records as &$record ){
      if ( !$record->log_value ) continue;
      $record->log_value = json_decode($record->log_value, true);
    }
    return $records;
  }

  public function logConflictOfInterest( $cycleId, $judgeId, $applicantId ){
    $log = [
      'log_type' => 'evaluation',
      'log_subtype' => 'conflict-of-interest',
      'cycle_id' => $cycleId,
      'user_id_subject' => $judgeId,
      'user_id_object' => $applicantId,
      'date_created' =>  date('Y-m-d H:i:s')
    ];

    global $wpdb;
    $wpdb->insert( $this->table, $log );
    return true;
  }

  public function logCompletedEvaluation( $cycleId, $judgeId, $applicantId ){
    $log = [
      'log_type' => 'evaluation',
      'log_subtype' => 'completed',
      'cycle_id' => $cycleId,
      'user_id_subject' => $judgeId,
      'user_id_object' => $applicantId,
      'date_created' =>  date('Y-m-d H:i:s')
    ];

    global $wpdb;
    $wpdb->insert( $this->table, $log );
    return true;
  }

  public function logApplicationUnassignment($cycleId, $judgeId, $applicantIds){
    if ( !is_array($applicantIds) ) $applicantIds = [$applicantIds];
    if ( empty($applicantIds) ) return false;
    $log = [
      'log_type' => 'evaluation-admin',
      'log_subtype' => 'application-unassigned',
      'cycle_id' => $cycleId,
      'user_id_object' => $judgeId,
      'date_created' =>  date('Y-m-d H:i:s')
    ];

    $details = [
      'judge' => $judgeId
    ];
    $currentUser = $this->plugin->users->currentUser();
    if ( $currentUser->record() ){
      $details['unassignedBy'] = $currentUser->record()->user_id;
    }

    global $wpdb;
    foreach( $applicantIds as $applicantId ){
      $log['user_id_subject'] = $applicantId;
      $details['applicant'] = $applicantId;
      $log['log_value'] = json_encode($details);
      $wpdb->insert( $this->table, $log );
    }
  }

  public function logApplicationAssignment($cycleId, $judgeId, $applicantIds){
    if ( !is_array($applicantIds) ) $applicantIds = [$applicantIds];
    if ( empty($applicantIds) ) return false;
    $log = [
      'log_type' => 'evaluation-admin',
      'log_subtype' => 'application-assignment',
      'cycle_id' => $cycleId,
      'user_id_object' => $judgeId,
      'date_created' =>  date('Y-m-d H:i:s')
    ];

    $details = [
      'judge' => $judgeId
    ];
    $currentUser = $this->plugin->users->currentUser();
    if ( $currentUser->record() ){
      $details['assignedBy'] = $currentUser->record()->user_id;
    }

    global $wpdb;
    foreach( $applicantIds as $applicantId ){
      $log['user_id_subject'] = $applicantId;
      $details['applicant'] = $applicantId;
      $log['log_value'] = json_encode($details);
      $wpdb->insert( $this->table, $log );
    }

  }

  public function logSupportNudgeEmail( $cycleId, $supporterId, $applicantId ){
    $log = [
      'log_type' => 'email',
      'log_subtype' => 'supporter-nudge',
      'cycle_id' => $cycleId,
      'user_id_subject' => $supporterId,
      'user_id_object' => $applicantId,
      'date_created' =>  date('Y-m-d H:i:s')
    ];

    global $wpdb;
    $wpdb->insert( $this->table, $log );
    return true;
  }

  public function logSupportRequestEmail( $cycleId, $supporterId, $applicantId ){
    $log = [
      'log_type' => 'email',
      'log_subtype' => 'support-requested',
      'cycle_id' => $cycleId,
      'user_id_subject' => $supporterId,
      'user_id_object' => $applicantId,
      'date_created' =>  date('Y-m-d H:i:s')
    ];

    global $wpdb;
    $wpdb->insert( $this->table, $log );
    return true;
  }

  public function logEvaluationNudgeEmail($cycleId, $judgeId){
    $log = [
      'log_type' => 'email',
      'log_subtype' => 'evaluation-nudge',
      'cycle_id' => $cycleId,
      'user_id_subject' => $judgeId,
      'date_created' =>  date('Y-m-d H:i:s')
    ];

    global $wpdb;
    $wpdb->insert( $this->table, $log );
    return true;
  }

  public function logApplicantAssignedEmail($cycleId, $judgeId){
    $log = [
      'log_type' => 'email',
      'log_subtype' => 'applicant-assigned',
      'cycle_id' => $cycleId,
      'user_id_subject' => $judgeId,
      'date_created' =>  date('Y-m-d H:i:s')
    ];

    global $wpdb;
    $wpdb->insert( $this->table, $log );
    return true;
  }

  public function logApplicationSubmitEmail($cycleId, $applicantId){
    $log = [
      'log_type' => 'email',
      'log_subtype' => 'application-confirmation',
      'cycle_id' => $cycleId,
      'user_id_subject' => $applicantId,
      'date_created' =>  date('Y-m-d H:i:s')
    ];

    global $wpdb;
    $wpdb->insert( $this->table, $log );
    return true;
  }

  public function logEmailSettingChange($cycleId) {
    $log = [
      'log_type' => 'email',
      'log_subtype' => 'update-settings',
      'cycle_id' => $cycleId,
      'date_created' =>  date('Y-m-d H:i:s')
    ];

    $currentUser = $this->plugin->users->currentUser();
    if ( $currentUser->record() ){
      $log['user_id_subject'] = $currentUser->record()->user_id;
    }

    global $wpdb;
    $wpdb->insert( $this->table, $log );
    return true;
  }

  public function logJudgeRemoval($cycleId, $judgeId) {
    $log = [
      'log_type' => 'evaluation-admin',
      'log_subtype' => 'judge-removed',
      'cycle_id' => $cycleId,
      'user_id_object' => $judgeId,
      'date_created' =>  date('Y-m-d H:i:s')
    ];

    $currentUser = $this->plugin->users->currentUser();
    if ( $currentUser->record() ){
      $log['user_id_subject'] = $currentUser->record()->user_id;
    }

    global $wpdb;
    $wpdb->insert( $this->table, $log );
    return true;
  }

  public function logJudgeAddition($cycleId, $judgeId=null, $judgeDetails=[]){
    $log = [
      'log_type' => 'evaluation-admin',
      'log_subtype' => 'judge-added',
      'cycle_id' => $cycleId,
      'date_created' =>  date('Y-m-d H:i:s')
    ];
    if ( !empty($judgeId) ){
      $log['user_id_object'] = $judgeId;
    }

    $logDetails = [];

    if ( !empty($judgeDetails) ){
      $logDetails['judge'] = $judgeDetails;
    }

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

  public function logApplicationDelete($cycleId, $userId) {
    $log = [
      'log_type' => 'application',
      'log_subtype' => 'delete',
      'cycle_id' => $cycleId,
      'user_id_object' => $userId,
      'date_created' =>  date('Y-m-d H:i:s')
    ];

    $currentUser = $this->plugin->users->currentUser();
    if ( $currentUser->record() ){
      $log['user_id_subject'] = $currentUser->record()->user_id;
    }

    global $wpdb;
    $wpdb->insert( $this->table, $log );
    return true;
  }

  public function logApplicationSubmit($cycleId, $userId) {
    $log = [
      'log_type' => 'application',
      'log_subtype' => 'submit',
      'cycle_id' => $cycleId,
      'user_id_subject' => $userId,
      'date_created' =>  date('Y-m-d H:i:s')
    ];

    global $wpdb;
    $wpdb->insert( $this->table, $log );
    return true;
  }

  public function logApplicationSupportSubmit($cycleId, $applicantId, $supporterId){
    $log = [
      'log_type' => 'application',
      'log_subtype' => 'support-submitted',
      'cycle_id' => $cycleId,
      'user_id_subject' => $supporterId,
      'user_id_object' => $applicantId,
      'date_created' =>  date('Y-m-d H:i:s')
    ];

    global $wpdb;
    $wpdb->insert( $this->table, $log );
    return true;
  }

  public function logRubricEvent($cycleId, $subType){
    if ( !isset($this->logTypes['rubric']['subTypes'][$subType]) ) {
      error_log('UcdlibAwardsLogs::logRubricEvent() - Invalid subType: ' . $subType);
      return false;
    }
    $logDetails = [];
    $log = [
      'log_type' => $this->logTypes['rubric']['slug'],
      'log_subtype' => $this->logTypes['rubric']['subTypes'][$subType]['slug'],
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
    $users = array_filter($users);

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
      'currentPage' => $page,
      'results' => $results
    ];
  }
}
