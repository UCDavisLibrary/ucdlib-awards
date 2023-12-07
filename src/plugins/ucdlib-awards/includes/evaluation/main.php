<?php

require_once( __DIR__ . '/ajax.php' );
require_once( __DIR__ . '/menu.php' );

/**
 * @description Controller for evaluation functionality
 */
class UcdlibAwardsEvaluation {

  public $plugin;
  public $menu;
  public $ajax;

  public function __construct( $plugin ){
    $this->plugin = $plugin;
    $this->menu = new UcdlibAwardsEvaluationMenu( $this );
    $this->ajax = new UcdlibAwardsEvaluationAjax( $this );
  }
}
