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

    $out[0] = count($out[1]['errorMessages']) == 0;
    return $out;
  }
}
