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

  public function itemIds(){
    $ids = [];
    foreach( $this->items() as $item ){
      $ids[] = $item->rubric_item_id;
    }
    return $ids;
  }

  public function deleteItemsById( $itemIds ) {
    global $wpdb;
    $table = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::RUBRIC_ITEMS );
    $sql = "DELETE FROM $table WHERE rubric_item_id IN (" . implode(',', $itemIds) . ")";
    $wpdb->query( $sql );
    $this->clearCache();
  }

  public function createOrUpdateItem( $item ){
    global $wpdb;
    $table = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::RUBRIC_ITEMS );

    $item['date_updated'] = date('Y-m-d H:i:s');
    $item['date_created'] = date('Y-m-d H:i:s');
    $item['cycle_id'] = $this->cycleId;

    $id = false;
    if ( isset($item['rubric_item_id']) ){
      if ( in_array($item['rubric_item_id'], $this->itemIds()) ){
        $id = $item['rubric_item_id'];
      }
      unset($item['rubric_item_id']);
    }

    if ( $id ){
      $wpdb->update( $table, $item, ['rubric_item_id' => $id] );
    } else {
      $wpdb->insert( $table, $item );
      $id = $wpdb->insert_id;
    }

    $this->clearCache();

    return $id;
  }

  public function clearCache(){
    $this->items = null;
  }
}
