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
    $this->ajaxUtils = new UcdlibAwardsAjaxUtils();

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
    add_submenu_page(
      $this->slugs['main'],
      $this->award->getAdminMenuTitle(),
      'Dashboard',
      'edit_posts',
      $this->slugs['main'],
      [$this, 'renderMain']
    );

    add_submenu_page(
      $this->slugs['main'],
      $this->award->getAdminMenuPageTitle(),
      "Application Cycles",
      "edit_posts",
      $this->slugs['cycles'],
      [$this, 'renderCycles']
    );

  }

  /**
   * @description Render the main admin Dashboard.
   */
  public function renderMain(){
    $context = $this->context();
    $context['pageProps'] = [
      'wpAjax' => $this->ajaxUtils->getAjaxElementProperty('adminDashboard'),
      'requestedCycle' => $context['pageContainerProps']['requestedCycle'],
      'cyclesLink' => $context['pageContainerProps']['cyclesLink']
    ];
    UcdlibAwardsTimber::renderAdminPage( 'main', $context );
  }

  /**
   * @description Render the admin Application Cycles page.
   */
  public function renderCycles(){
    $context = $this->context();
    $activeCycle = null;
    $forms = [];
    if ( $this->plugin->users->currentUser()->isAdmin() ){
      $activeCycle = $this->plugin->cycles->activeCycle();
      $forms = $this->plugin->forms->getForms(null, 1, 100);
      $forms = $this->plugin->forms->toBasicArray($forms);
    }
    if ( $activeCycle ){
      $activeCycle = $activeCycle->recordArray();
    }
    $context['pageProps'] = [
      'wpAjax' => $this->ajaxUtils->getAjaxElementProperty('adminCycles'),
      'requestedCycle' => $context['pageContainerProps']['requestedCycle'],
      'activeCycle' => $activeCycle,
      'siteForms' => $forms,
      'dashboardLink' => $context['links']['dashboard'],
      'formsLink' => admin_url( 'admin.php?page=' . $this->plugin->config::$forminatorSlugs['forms'] )
    ];
    UcdlibAwardsTimber::renderAdminPage( 'cycles', $context );
  }

  /**
   * @description Returns the base context for the admin pages.
   */
  protected $context;
  public function context(){
    if ( !empty($this->context) ) return $this->context;

    $currentUser = $this->plugin->users->currentUser();
    $cycleQueryParam = $this->plugin->config::$urlQueryParams['cycle'];
    $links = [
      'cycles' => admin_url( 'admin.php?page=' . $this->slugs['cycles'] ),
      'dashboard' => admin_url( 'admin.php?page=' . $this->slugs['main'] )
    ];

    $this->context = [
      'currentUser' => $currentUser,
      'pageContainerProps' => [
        'pageTitle' => $this->award->getAdminMenuPageTitle(),
        'siteLogo' => dirname( get_template_directory_uri() ) . "/assets/img/site-icon.png",
        'isAdminPage' => true,
        'cycles' => [],
        'cyclesLink' => $links['cycles'],
        'cycleQueryParam' => $cycleQueryParam,
        'requestedCycle' => null,
        'wpAjax' => $this->ajaxUtils->getAjaxElementProperty('adminGeneral')
      ],
      'award' => $this->award,
      'links' => $links
    ];

    if ( $currentUser->isAdmin() ){
      $this->context['pageContainerProps']['cycles'] = $this->plugin->cycles->getRecordArrays();

      $requestedCycleId = !empty($_GET[$cycleQueryParam]) ? intval($_GET[$cycleQueryParam]) : 0;
      $requestedCycle = null;
      if ( $requestedCycleId ) {
        $requestedCycle = $this->plugin->cycles->getById( $requestedCycleId );
      } else {
        $requestedCycle = $this->plugin->cycles->activeCycle();
      }
      if ( $requestedCycle ){
        $requestedCycle = $requestedCycle->recordArray();
      }
      $this->context['pageContainerProps']['requestedCycle'] = $requestedCycle;
    }
    return $this->context;
  }
}
