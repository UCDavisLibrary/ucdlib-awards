<?php

class UcdlibAwardsEmail {

  public function __construct($plugin){
    $this->plugin = $plugin;

    $this->metaFields = [
      'emailSenderAddress' =>
        ['group' =>'general', 'type' => 'email', 'default' => ''],
      'emailSenderName' =>
        ['group' =>'general', 'type' => 'text', 'default' => ''],
      'emailDisableEmails' =>
        ['group' =>'general', 'type' => 'boolean', 'default' => false],
      'emailDisableAutomatedEmails' =>
        ['group' =>'general', 'type' => 'boolean', 'default' => false],
    ];
  }

  public function getAllMeta( $cycleId, $byGroup=false ){
    $out = [];

    $cycle = $this->plugin->cycles->getById( $cycleId );
    $cycleMeta = [];
    if ( $cycle ) $cycleMeta = $cycle->cycleMeta();

    foreach( $this->metaFields as $key => $field ){
      if ( $byGroup && !isset( $out[ $field['group'] ] ) ) $out[ $field['group'] ] = [];

      $v = isset( $cycleMeta[ $key ] ) ? $cycleMeta[ $key ] : $field['default'];
      if ( $byGroup ) {
        $out[ $field['group'] ][ $key ] = $v;
      } else {
        $out[ $key ] = $v;
      }
    }

    return $out;
  }
}
