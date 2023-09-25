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

    add_submenu_page(
      $this->slugs['main'],
      $this->award->getAdminMenuPageTitle(),
      "Applicants",
      "edit_posts",
      $this->slugs['applicants'],
      [$this, 'renderApplicants']
    );

    add_submenu_page(
      $this->slugs['main'],
      $this->award->getAdminMenuPageTitle(),
      "Rubric",
      "edit_posts",
      $this->slugs['rubric'],
      [$this, 'renderRubric']
    );

    add_submenu_page(
      $this->slugs['main'],
      $this->award->getAdminMenuPageTitle(),
      "Activity Log",
      "edit_posts",
      $this->slugs['logs'],
      [$this, 'renderLogs']
    );

  }

  /**
   * @description Render the main admin Dashboard.
   */
  public function renderMain(){
    $context = $this->context();
    $requestedCycle = $this->context['pageContainerProps']['requestedCycle'];
    if ( $requestedCycle ){
      $requestedCycle = $requestedCycle['cycle_id'];
    }
    $dashboardSettings = $this->award->getDashboardSettings();
    $context['pageProps'] = [
      'wpAjax' => $this->ajaxUtils->getAjaxElementProperty('adminDashboard'),
      'logsProps' => [
        'wpAjax' => $this->ajaxUtils->getAjaxElementProperty('adminLogs'),
        'cycleId' => $requestedCycle,
        'doQueryOnLoad' => true,
        'filters' => ['types' => $dashboardSettings['logTypeFilter']]
      ],
      'requestedCycle' => $context['pageContainerProps']['requestedCycle'],
      'cyclesLink' => $context['pageContainerProps']['cyclesLink'],
      'logsLink' => $context['links']['logs']
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
    $requestedCycle = $context['pageContainerProps']['requestedCycle'];
    if ( $this->plugin->users->currentUser()->isAdmin() ){
      $activeCycle = $this->plugin->cycles->activeCycle();
      $forms = $this->plugin->forms->getForms(null, 1, 100);
      $forms = $this->plugin->forms->toBasicArray($forms);
      $applicationFormFields = [];
      if ( $requestedCycle && $requestedCycle['application_form_id'] ){
        $applicationFormFields = $this->plugin->forms->getFormFields( intval($requestedCycle['application_form_id']) );
      }
    }
    if ( $activeCycle ){
      $activeCycle = $activeCycle->recordArray();
    }
    $context['pageProps'] = [
      'wpAjax' => $this->ajaxUtils->getAjaxElementProperty('adminCycles'),
      'requestedCycle' => $requestedCycle,
      'activeCycle' => $activeCycle,
      'siteForms' => $forms,
      'dashboardLink' => $context['links']['dashboard'],
      'applicationFormFields' => $applicationFormFields,
      'formsLink' => admin_url( 'admin.php?page=' . $this->plugin->config::$forminatorSlugs['forms'] )
    ];
    UcdlibAwardsTimber::renderAdminPage( 'cycles', $context );
  }

  /**
   * @description Render the admin Activity Logs page.
   */
  public function renderLogs(){
    $context = $this->context();
    $requestedCycle = $this->context['pageContainerProps']['requestedCycle'];
    if ( $requestedCycle ){
      $requestedCycle = $requestedCycle['cycle_id'];
    }
    $context['filterProps'] = [
      'wpAjax' => $this->ajaxUtils->getAjaxElementProperty('adminLogs')
    ];
    $context['resultsProps'] = [
      'wpAjax' => $this->ajaxUtils->getAjaxElementProperty('adminLogs'),
      'cycleId' => $requestedCycle,
      'doQueryOnLoad' => true
    ];

    if ( $context['isAdmin'] ){
      $context['filterProps']['filters'] = $this->plugin->logs->getFilters($requestedCycle);
    }
    UcdlibAwardsTimber::renderAdminPage( 'logs', $context );
  }

  /**
   * @description Render the admin Applicants page.
   */
  public function renderApplicants(){
    $context = $this->context();
    $requestedCycle = $context['requestedCycle'];
    $pageProps = [
      'wpAjax' => $this->ajaxUtils->getAjaxElementProperty('adminApplicants'),
    ];
    if ( $requestedCycle ){
      $pageProps['categories'] = $requestedCycle->categories();
      $args = [
        'applicationEntry' => true,
        'userMeta' => true
      ];
      $applicants = $requestedCycle->getApplicants($args);
      $args = [
        'applicationEntryBrief' => $requestedCycle->cycleId,
        'applicationCategory' => $requestedCycle->cycleId,
        'applicationStatus' => $requestedCycle->cycleId
      ];
      $pageProps['applicants'] = $this->plugin->users->toArrays($applicants, $args);
    }

    $context['pageProps'] = $pageProps;
    UcdlibAwardsTimber::renderAdminPage( 'applicants', $context );
  }

  public function renderRubric(){
    $context = $this->context();
    $requestedCycle = $context['requestedCycle'];
    $pageProps = [
      'wpAjax' => $this->ajaxUtils->getAjaxElementProperty('adminRubric'),
      'rubricItems' => [],
      'cyclesWithRubric' => []
    ];
    if ( $requestedCycle ){
      if ( $requestedCycle->hasRubric() ){
        $pageProps['rubricItems'] = $requestedCycle->rubric()->items();
      }
      $cyclesWithRubric = $this->plugin->cycles->filterByRubric();
      foreach ($cyclesWithRubric as $c) {
        $pageProps[] = $c->recordArray();
      }
    }
    $context['pageProps'] = $pageProps;

    UcdlibAwardsTimber::renderAdminPage( 'rubric', $context );
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
      'dashboard' => admin_url( 'admin.php?page=' . $this->slugs['main'] ),
      'logs' => admin_url( 'admin.php?page=' . $this->slugs['logs'] )
    ];

    $this->context = [
      'currentUser' => $currentUser,
      'isAdmin' => $currentUser->isAdmin(),
      'requestedCycle' => null,
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
        $this->context['requestedCycle'] = $requestedCycle;
        $requestedCycle = $requestedCycle->recordArray(['applicantCount' => true]);
      }
      $this->context['pageContainerProps']['requestedCycle'] = $requestedCycle;
    }
    return $this->context;
  }
}
