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
}
