<?php

/**
 * @description Model for a single awards/application cycle
 */
class UcdlibAwardsCycle {

  /**
   * @param $cycle int|string|object - Can be cycle id or cycle db record
   */
  public function __construct( $cycle ){
    $this->record = null;
    $this->cycleId = null;
    if ( is_int($cycle) ){
      $this->cycleId = $cycle;
    } elseif ( is_string($cycle) ) {
      $this->cycleId = $this->getCycleIdFromSlug( $cycle );
    } elseif ( is_object($cycle) ) {
      $this->record = $cycle;
      $this->cycleId = $this->record->cycle_id;
    }
  }

  /**
   * @description Get the basic cycle record from the db table
   */
  protected $record;
  public function record(){
    if ( !empty($this->record) ) return $this->record;
    global $wpdb;
    $cyclesTable = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::CYCLES );
    $sql = "SELECT * FROM $cyclesTable WHERE cycle_id = %d";
    $this->record = $wpdb->get_row( $wpdb->prepare( $sql, $this->cycleId ) );
    return $this->record;
  }

  /**
   * @description Get the cycle record as an associative array
   */
  protected $recordArray;
  public function recordArray(){
    if ( !empty($this->recordArray) ) return $this->recordArray;
    $this->recordArray = (array) $this->record();
    return $this->recordArray;
  }

  /**
   * @description This is the active application cycle
   */
  protected $isActive;
  public function isActive(){
    if ( isset($this->isActive) ) return $this->isActive;
    $record = $this->record();
    $this->isActive = $record->is_active;
    return $this->isActive;
  }
}
