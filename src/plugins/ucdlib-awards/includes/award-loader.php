<?php

require_once( __DIR__ . '/abstracts/award.php' );

/**
 * @description Loads an individual award plugin.
 */
class UcdlibAwardsAwardLoader {

  public $plugin;
  public $hookSlug;
  public $award;

  public function __construct( $plugin ){
    $this->plugin = $plugin;
    $this->hookSlug = 'awards_loader';
    $this->award = null;
    $this->loadAward();
  }

  /**
   * @description Load the individual award plugin.
   */
  public function loadAward(){
    $hookSlug = $this->plugin->hookSlug . '/' . $this->hookSlug;
    $awards = apply_filters( $hookSlug, [] );
    if ( count($awards) > 1 ) {
      add_action(
        'admin_notices',
        function() {
          echo '<div class="error"><p>Only one award plugin should be active at a time for the UC Davis Library Awards platform. </p></div>';
        }
      );
    } else if ( count($awards) == 1 ) {
      $award = $awards[0];
      if ( $award instanceof UcdlibAwardsAwardAbstract ){
        $this->award = $awards[0];
      }
    }
  }


}
