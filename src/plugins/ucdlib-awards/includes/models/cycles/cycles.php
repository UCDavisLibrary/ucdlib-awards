<?php

require_once( __DIR__ . '/cycle.php' );

class UcdlibAwardsCycles {

  public $plugin;
  public $cycleCache;

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

  /**
   * @description Only return cycles with an associated rubric
   */
  public function filterByRubric(){
    $out = [];
    $cycles = $this->getAll();
    foreach( $cycles as $cycle ){
      if ( $cycle->hasRubric() ){
        $out[] = $cycle;
      }
    }
    return $out;
  }

  public function create( $data ){
    global $wpdb;
    $cyclesTable = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::CYCLES );
    $validColumns = array_keys(UcdlibAwardsDbTables::get_table_column_labels( UcdlibAwardsDbTables::CYCLES ));
    foreach( $data as $key => $value ){
      if ( !in_array($key, $validColumns) ){
        unset($data[$key]);
      }
    }
    if ( isset($data['cycle_meta']) ){
      if ( !is_string($data['cycle_meta']) ){
        $data['cycle_meta'] = json_encode( $data['cycle_meta'] );
      }
    }
    $data['date_created'] = date('Y-m-d H:i:s');
    $data['date_updated'] = $data['date_created'];
    $wpdb->insert( $cyclesTable, $data );
    $cycleId = $wpdb->insert_id;
    $this->clearCache();
    return $cycleId;
  }

  public function deactivateAll(){
    global $wpdb;
    $cyclesTable = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::CYCLES );
    $wpdb->update( $cyclesTable, ['is_active' => 0], ['is_active' => 1] );
    $this->clearCache();
  }

  public function clearCache(){
    $this->cycleCache = [];
  }

  /**
   * @description Validate form submission data for a cycle
   */
  public function validateCycle($cycle){
    $out = [
      false, // isValid
      [
        'errorMessages' => [],
        'errorFields' => []
      ]
    ];

    $fieldLabels = UcdlibAwardsDbTables::get_table_column_labels( UcdlibAwardsDbTables::CYCLES );

    $cycleMeta = isset($cycle['cycle_meta']) && is_array($cycle['cycle_meta']) ? $cycle['cycle_meta'] : [];

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
    $formColumns = [
      'application_form_id',
      'support_form_id'
    ];

    // make sure forms exist
    foreach( $formColumns as $formColumn ){
      if ( empty($cycle[$formColumn]) ) continue;
      $form = $this->plugin->forms->getForms( [$cycle[$formColumn]] );
      if ( empty($form) ){
        $label = $fieldLabels[$formColumn];
        $out[1]['errorMessages'][] = "The '$label' field is not a valid form.";
        $out[1]['errorFields'][$formColumn] = true;
      }

      // make sure forms don't have the same id
      foreach ( $formColumns as $comparisonFormColumn ) {
        if ( $formColumn == $comparisonFormColumn ) continue;
        if ( empty($cycle[$comparisonFormColumn]) ) continue;
        if ( $cycle[$formColumn] == $cycle[$comparisonFormColumn] ){
          $label = $fieldLabels[$formColumn];
          $labelComparison = $fieldLabels[$comparisonFormColumn];
          $out[1]['errorMessages'][] = "The '$label' field cannot be the same as the '$labelComparison' field.";
          $out[1]['errorFields'][$formColumn] = true;
          $out[1]['errorFields'][$comparisonFormColumn] = true;
        }
      }
    }

    // make sure another cycle doesnt use the same forms
    $cycles = $this->getAll();
    foreach( $cycles as $comparisonCycle ){
      if ( isset($cycle['cycle_id']) && $cycle['cycle_id'] == $comparisonCycle->cycleId ) continue;
      foreach( $formColumns as $formColumn ){
        if ( empty($cycle[$formColumn]) ) continue;
        if ( $cycle[$formColumn] == $comparisonCycle->record()->$formColumn ){
          $label = $fieldLabels[$formColumn];
          $out[1]['errorMessages'][] = "The '$label' field is already in use by another cycle.";
          $out[1]['errorFields'][$formColumn] = true;
        }
      }
    }

    // application categories
    if ( !empty($cycle['has_categories']) ){
      if ( empty($cycle['application_form_id']) ){
        $out[1]['errorMessages'][] = "The '$fieldLabels[application_form_id]' field is required if application categories are enabled.";
        $out[1]['errorFields']['application_form_id'] = true;
      }
      if ( empty($cycle['category_form_slug']) ){
        $out[1]['errorMessages'][] = "The '$fieldLabels[category_form_slug]' field is required if application categories are enabled.";
        $out[1]['errorFields']['category_form_slug'] = true;
      }
      $formFields = $this->plugin->forms->getFormFields( $cycle['application_form_id'] );
      $fieldOptions = [];
      foreach( $formFields as $fieldWrapper ){
        if ( !is_array($fieldWrapper['fields']) ) continue;
        foreach( $fieldWrapper['fields'] as $field ){
          if ( !is_array($field['options']) || !count($field['options']) ) continue;
          $fieldOptions[] = $field['element_id'];
        }
      }
      if ( !in_array($cycle['category_form_slug'], $fieldOptions) ){
        $out[1]['errorMessages'][] = "The '$fieldLabels[category_form_slug]' field is not a valid form field.";
        $out[1]['errorFields']['category_form_slug'] = true;
      }
    }

    // letters of support application fields
    if ( $hasSupport && !empty($cycle['application_form_id']) ){
      $errorFieldSlug = 'supporterFields';
      $requiredFields = ['firstName', 'lastName', 'email'];
      $supporterFields = isset($cycleMeta['supporterFields']) && is_array($cycleMeta['supporterFields']) ? $cycleMeta['supporterFields'] : [];
      if ( empty($supporterFields) ){
        $out[1]['errorMessages'][] = "The 'Supporter Identifier Fields' section is incomplete.";
        $out[1]['errorFields'][$errorFieldSlug] = true;
      }
      foreach ($supporterFields as $fields) {
        if ( !is_array($fields) ) $fields = [];
        foreach( $requiredFields as $requiredField ){
          if ( empty($fields[$requiredField]) ){
            $out[1]['errorMessages'][] = "The 'Supporter Identifier Fields' section is incomplete.";
            $out[1]['errorFields'][$errorFieldSlug] = true;
            break;
          }
        }
      }
    }

    // ensure at least one cycle is active
    if ( empty($cycle['is_active']) ){
      $hasActiveCycle = false;
      foreach( $cycles as $comparisonCycle ){
        if ( isset($cycle['cycle_id']) && $cycle['cycle_id'] == $comparisonCycle->cycleId ) continue;
        if ( $comparisonCycle->isActive() ){
          $hasActiveCycle = true;
          break;
        }
      }
      if ( !$hasActiveCycle ){
        $out[1]['errorMessages'][] = "At least one cycle must be active.";
        $out[1]['errorFields']['is_active'] = true;
      }
    }


    $out[0] = count($out[1]['errorMessages']) == 0;

    return $out;
  }
}
