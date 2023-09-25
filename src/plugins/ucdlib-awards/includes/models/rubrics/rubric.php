<?php

class UcdlibAwardsRubric {

  public function __construct( $args=[] ){

    $this->table = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::RUBRIC_ITEMS );

    if ( !empty($args['plugin']) ){
      $this->plugin = $args['plugin'];
    }

    $this->cycleId = 0;
    if ( isset($args['cycleId']) ){
      $this->cycleId = $args['cycleId'];
    }

    if ( !empty($args['getItems']) ){
      $this->items();
    }

  }

  protected $items;
  public function items(){
    if ( isset($this->items) ){
      return $this->items;
    }
    global $wpdb;
    $sql = "SELECT * FROM $this->table WHERE cycle_id = $this->cycleId ORDER BY item_order ASC";
    $this->items = $wpdb->get_results( $sql );
    return $this->items;
  }
}
