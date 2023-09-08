<?php

require_once( __DIR__ . '/cycle.php' );

class UcdlibAwardsCycles {

  /**
   * @description Model for querying awards/application cycles
   */
  public function __construct( $plugin ){
    $this->plugin = $plugin;

    // sequential array of UcdlibAwardsCycle objects
    $this->cycleCache = [];
  }

  /**
   * @description Get all cycles
   */
  public function getAll(){
    if ( count($this->cycleCache) > 0 ){
      return $this->cycleCache;
    }
    global $wpdb;
    $cyclesTable = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::CYCLES );
    $sql = "SELECT * FROM $cyclesTable ORDER BY date_created DESC";
    $records = $wpdb->get_results( $sql );
    foreach( $records as $record ){
      $this->cycleCache[] = new UcdlibAwardsCycle( $record );
    }
    return $this->cycleCache;
  }

  /**
   * @description Get a cycle by its id
   */
  public function getById($cycleId){
    $cycles = $this->getAll();
    foreach( $cycles as $cycle ){
      if ( $cycle->cycleId == $cycleId ){
        return $cycle;
      }
    }
    return null;
  }

  /**
   * @description Get the current active cycle
   */
  protected $activeCycle;
  public function activeCycle(){
    if ( !empty($this->activeCycle) ) return $this->activeCycle;
    $cycles = $this->getAll();
    foreach( $cycles as &$cycle ){
      if ( $cycle->isActive() ){
        $this->activeCycle = $cycle;
        return $this->activeCycle;
      }
    }
    return null;
  }

  /**
   * @description Get all cycle records as associative arrays
   */
  public function getRecordArrays(){
    $out = [];
    $cycles = $this->getAll();
    foreach( $cycles as $cycle ){
      $out[] = $cycle->recordArray();
    }
    return $out;
  }

  public function validateCycle($cycle){
    $out = [
      false,
      [
        'errorMessages' => [],
        'errorFields' => []
      ]
    ];

    $fieldLabels = UcdlibAwardsDbTables::get_table_column_labels( UcdlibAwardsDbTables::CYCLES );

    // Required fields
    $requiredFields = [
      'title',
      'application_start',
      'application_end',
      'evaluation_start',
      'evaluation_end',
      'application_form_id'
    ];
    foreach( $requiredFields as $requiredField ){
      if ( empty($cycle[$requiredField]) ){
        $out[1]['errorMessages'][] = "The '$fieldLabels[$requiredField]' field is required.";
        $out[1]['errorFields'][$requiredField] = true;
      }
    }

    // Letters of support functionality
    $hasSupport = !empty($cycle['has_support']);
    if ( $hasSupport ){
      $requiredFields = [
        'support_start',
        'support_end',
        'support_form_id'
      ];
      foreach( $requiredFields as $requiredField ){
        if ( empty($cycle[$requiredField]) ){
          $out[1]['errorMessages'][] = "The '$fieldLabels[$requiredField]' field is required.";
          $out[1]['errorFields'][$requiredField] = true;
        }
      }
    }

    // Date validation
    $dateRanges = [
      ['start' => 'application_start', 'end' => 'application_end', 'required' => true],
      ['start' => 'evaluation_start', 'end' => 'evaluation_end', 'required' => true],
      ['start' => 'support_start', 'end' => 'support_end', 'required' => $hasSupport]
    ];
    foreach( $dateRanges as &$dateRange ){
      if ( !$dateRange['required'] ) continue;
      if ( empty($cycle[$dateRange['start']]) || empty($cycle[$dateRange['end']]) ) continue;

      foreach ( ['start', 'end'] as $dateRangeKey ) {
        try {
          $dateRange[$dateRangeKey . 'Date'] = new DateTime( $cycle[$dateRange[$dateRangeKey]] );
        } catch (Exception $e) {
          $label = $fieldLabels[$dateRange[$dateRangeKey]];
          $out[1]['errorMessages'][] = "The '$label' field is not a valid date.";
          $out[1]['errorFields'][$dateRange[$dateRangeKey]] = true;
        }
      }
    }
    foreach( $dateRanges as &$dateRange ){
      if ( empty($dateRange['startDate']) || empty($dateRange['endDate']) ) continue;
      if ( $dateRange['startDate'] >= $dateRange['endDate'] ){
        $labelStart = $fieldLabels[$dateRange['start']];
        $labelEnd = $fieldLabels[$dateRange['end']];
        $out[1]['errorMessages'][] = "The '$labelStart' field must be before the '$labelEnd' field.";
        $out[1]['errorFields'][$dateRange['start']] = true;
        $out[1]['errorFields'][$dateRange['end']] = true;
      }
    }

    // Form validation
    $formIds = [
      'application_form_id',
      'support_form_id'
    ];
    foreach( $formIds as $formId ){
      if ( empty($cycle[$formId]) ) continue;
      $form = $this->plugin->forms->getForms( [$cycle[$formId]] );
      if ( empty($form) ){
        $label = $fieldLabels[$formId];
        $out[1]['errorMessages'][] = "The '$label' field is not a valid form.";
        $out[1]['errorFields'][$formId] = true;
      }
    }

    // make sure forms don't have the same id

    // make sure another cycle doesnt use the same forms


    $out[0] = count($out[1]['errorMessages']) == 0;

    return $out;
  }
}
