<?php

/**
 * @description Displays the evaluation menu page(s) for this plugin.
 */
class UcdlibAwardsEvaluationMenu {

  public function __construct( $evaluation ){
    $this->evaluation = $evaluation;
    $this->plugin = $evaluation->plugin;
    $this->slugs = $this->plugin->award->getEvaluationMenuSlugs();
    $this->award = $this->plugin->award;
    $this->ajaxUtils = new UcdlibAwardsAjaxUtils();

    add_action( 'admin_menu', [$this, 'add_menu_pages'] );
  }

  public function add_menu_pages(){

    add_menu_page(
      $this->award->getEvaluationMenuPageTitle(),
      $this->award->getEvaluationMenuTitle(),
      "read",
      $this->slugs['main'],
      [$this, 'renderMain'],
      UcdlibAwardsIcons::$gavel,
      26
    );

  }

  public function renderMain(){
    $context = $this->context();
    UcdlibAwardsTimber::renderEvaluationPage( 'evaluation', $context );
  }



  /**
   * @description Returns the base context for the admin pages.
   */
  protected $context;
  public function context(){
    if ( !empty($this->context) ) return $this->context;

    $currentUser = $this->plugin->users->currentUser();

    $this->context = [
      'currentUser' => $currentUser,
      'isAdmin' => $currentUser->isAdmin(),
      'requestedCycle' => null,
      'pageContainerProps' => [
        'pageTitle' => $this->award->getAdminMenuPageTitle(),
        'siteLogo' => dirname( get_template_directory_uri() ) . "/assets/img/site-icon.png",
        'isAdminPage' => true,
        'requestedCycle' => null,
        'wpAjax' => $this->ajaxUtils->getAjaxElementProperty('adminGeneral')
      ],
      'award' => $this->award,
    ];

    return $this->context;
  }
}
