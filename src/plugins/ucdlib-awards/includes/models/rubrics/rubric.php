<?php

class UcdlibAwardsRubric {

  public function __construct( $args=[] ){

    $this->table = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::RUBRIC_ITEMS );
    $this->scoresTable = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::SCORES );

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

  public function getScoresByUser( $judgeId, $applicantId ){
    $cacheKey = "rubric_scores_by_user_{$judgeId}_{$applicantId}";
    $cached = wp_cache_get( $cacheKey, 'ucdlib_awards' );
    $itemIds = $this->itemIds();
    if ( empty($itemIds) ) return [];

    $scores = [];
    if ( $cached ){
      $scores = $cached;
    } else {
      global $wpdb;
      $sql = "SELECT * FROM $this->scoresTable WHERE rubric_id IN (" . implode(',', $itemIds) . ") AND judge_id = $judgeId AND applicant_id = $applicantId";
      $scores = $wpdb->get_results( $sql );
      wp_cache_set( $cacheKey, $scores, 'ucdlib_awards' );
    }
    $itemsById = [];
    foreach( $this->items() as $item ){
      $itemsById[$item->rubric_item_id] = $item;
    }
    foreach( $scores as $score ){
      $score->rubric_item = $itemsById[$score->rubric_item_id];
    }

    // sort by item->item_order
    usort($scores, function($a, $b){
      return $a->rubric_item->item_order - $b->rubric_item->item_order;
    });
    return $scores;
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
    $item['cycle_id'] = $this->cycleId;

    $id = false;
    if ( isset($item['rubric_item_id']) ){
      if ( in_array($item['rubric_item_id'], $this->itemIds()) ){
        $id = $item['rubric_item_id'];
      } else {
        $item['date_created'] = date('Y-m-d H:i:s');
      }
      unset($item['rubric_item_id']);
    } else {
      $item['date_created'] = date('Y-m-d H:i:s');
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

  public function uploadedFile(){
    $cycle = $this->plugin->cycles->getById( $this->cycleId );
    $cycleMeta = $cycle->cycleMeta();
    if ( isset($cycleMeta['rubric_file']) ){
      return $cycleMeta['rubric_file'];
    }
    return false;
  }

  public function scoringCalculation(){
    $cycle = $this->plugin->cycles->getById( $this->cycleId );
    $cycleMeta = $cycle->cycleMeta();
    if ( isset($cycleMeta['rubric_scoring_calculation']) ){
      return $cycleMeta['rubric_scoring_calculation'];
    }
    return 'sum';
  }

  public function clearCache(){
    $this->items = null;
  }
}
