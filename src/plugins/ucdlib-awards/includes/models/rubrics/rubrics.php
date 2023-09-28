<?php

require_once( __DIR__ . '/rubric.php' );

class UcdlibAwardsRubrics {

  public function __construct( $plugin ){
    $this->plugin = $plugin;

    $this->cache = [];
  }

  public function getByCycleId( $cycleId ){
    if ( isset($this->cache[$cycleId]) ){
      return $this->cache[$cycleId];
    }
    $this->cache[$cycleId] = new UcdlibAwardsRubric([
      'cycleId' => $cycleId,
      'plugin' => $this->plugin,
      'getItems' => true
    ]);
    return $this->cache[$cycleId];
  }

  public function validateRubric($rubric){
    $out = [
      false, // isValid
      [
        'errorMessages' => [],
        'errorFields' => []
      ]
    ];

    $fieldLabels = UcdlibAwardsDbTables::get_table_column_labels( UcdlibAwardsDbTables::RUBRIC_ITEMS );

    // Required fields
    $requiredFields = [
      'title',
      'cycle_id'
    ];
    foreach( $requiredFields as $requiredField ){
      if ( empty($rubric[$requiredField]) ){
        $out[1]['errorMessages'][] = "The '$fieldLabels[$requiredField]' field is required.";
        $out[1]['errorFields'][$requiredField] = true;
      }
    }

    // string length validation
    $stringFields = [
      'title' => 200,
      'description' => 500
    ];
    foreach( $stringFields as $field => $maxLength ){
      if ( !empty($rubric[$field]) && strlen($rubric[$field]) > $maxLength ){
        $out[1]['errorMessages'][] = "The '$fieldLabels[$field]' field must be $maxLength characters or less.";
        $out[1]['errorFields'][$field] = true;
      }
    }

    // integers are positive
    $integerFields = [
      'range_min',
      'range_max',
      'range_step',
      'weight'
    ];
    foreach( $integerFields as $field ){
      if ( !empty($rubric[$field]) && !is_numeric($rubric[$field]) ){
        $out[1]['errorMessages'][] = "The '$fieldLabels[$field]' field must be a number.";
        $out[1]['errorFields'][$field] = true;
      }
      if ( !empty($rubric[$field]) && $rubric[$field] < 0 ){
        $out[1]['errorMessages'][] = "The '$fieldLabels[$field]' field must be a positive number.";
        $out[1]['errorFields'][$field] = true;
      }
    }

    // range max is greater than range min
    $range_min = !empty($rubric['range_min']) && is_numeric($rubric['range_min']) ? intval($rubric['range_min']) : 1;
    $range_max = !empty($rubric['range_max']) && is_numeric($rubric['range_max']) ? intval($rubric['range_max']) : 5;
    if ( $range_max <= $range_min ){
      $out[1]['errorMessages'][] = "The '$fieldLabels[range_max]' field must be greater than the '$fieldLabels[range_min]' field.";
      $out[1]['errorFields']['range_max'] = true;
    }

    $out[0] = count($out[1]['errorMessages']) == 0;
    return $out;
  }
}
