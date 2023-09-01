<?php

/**
 * @description Displays the admin menu pages for this plugin.
 */
class UcdlibAwardsAdminMenu {

  public function __construct( $admin ){
    $this->admin = $admin;
    $this->plugin = $admin->plugin;
    $this->slugs = $this->plugin->award->getAdminMenuSlugs();
    $this->award = $this->plugin->award;

    add_action( 'admin_menu', [$this, 'add_menu_pages'] );
  }

  public function add_menu_pages(){

    add_menu_page(
      $this->award->getAdminMenuPageTitle(),
      $this->award->getAdminMenuTitle(),
      "edit_posts",
      $this->slugs['main'],
      [$this, 'renderMain'],
      UcdlibAwardsIcons::$gift,
      25
    );

  }

  public function renderMain(){
    $context = [];
    $currentUser = $this->plugin->users->currentUser();
    $context['currentUser'] = $currentUser;
    UcdlibAwardsTimber::renderAdminPage( 'main', $context );
  }
}
