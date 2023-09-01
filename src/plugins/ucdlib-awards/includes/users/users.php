<?php

require_once( __DIR__ . '/user.php' );

/**
 * @description Model for querying awards users
 */
class UcdlibAwardsUsers {

  public function __construct( $plugin ){
    $this->plugin = $plugin;

    $this->userCache = [];
  }

  /**
   * @description Get the logged in user
   */
  protected $currentUser;
  public function currentUser(){
    if ( !empty( $this->currentUser ) ){
      return $this->currentUser;
    }
    $user = new UcdlibAwardsUser();
    $this->userCache[ $user->username ] = $user;
    $this->currentUser = &$this->userCache[ $user->username ];
    return $this->currentUser;
  }

  public function getByUsername($username){
    if ( isset( $this->userCache[ $username ] ) ){
      return $this->userCache[ $username ];
    }
    $user = new UcdlibAwardsUser( $username );
    $this->userCache[ $username ] = $user;
    return $this->userCache[ $username ];
  }

}
