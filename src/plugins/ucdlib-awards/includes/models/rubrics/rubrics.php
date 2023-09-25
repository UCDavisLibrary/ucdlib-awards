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
}
