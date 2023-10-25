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
      "Judges",
      "edit_posts",
      $this->slugs['judges'],
      [$this, 'renderJudges']
    );

    add_submenu_page(
      $this->slugs['main'],
      $this->award->getAdminMenuPageTitle(),
      "Evaluation",
      "edit_posts",
      $this->slugs['evaluation'],
      [$this, 'renderEvaluation']
    );

    add_submenu_page(
      $this->slugs['main'],
      $this->award->getAdminMenuPageTitle(),
      "Email Settings",
      "edit_posts",
      $this->slugs['email'],
      [$this, 'renderEmailSettings']
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

  public function renderEmailSettings(){
    $context = $this->context();
    $requestedCycle = $this->context['requestedCycle'];
    $pageProps = [
      'wpAjax' => $this->ajaxUtils->getAjaxElementProperty('adminEmail')
    ];

    if ( $requestedCycle ){
      $meta = $requestedCycle->getEmailMeta(true);
      foreach ($meta as &$m) {
        if ( is_array($m) && !count($m) ) $m = new stdClass();
      }
      $pageProps['emailMeta'] = $meta;
      $pageProps['cycleId'] = $requestedCycle->cycleId;
      $pageProps['templateDefaults'] = $this->plugin->email->getAllTemplateDefaults();
      $pageProps['templateVariables'] = $this->plugin->email->getTemplateVariables();
      $pageProps['emailingEnabled'] = $this->plugin->email->emailingEnabled;
    }

    $context['pageProps'] = $pageProps;
    UcdlibAwardsTimber::renderAdminPage( 'email', $context );
  }

  public function renderEvaluation(){
    $context = $this->context();
    $requestedCycle = $this->context['requestedCycle'];
    $pageProps = [
      'wpAjax' => $this->ajaxUtils->getAjaxElementProperty('adminEvaluation')
    ];

    if ( $requestedCycle ){
      $pageProps['scores'] = $requestedCycle->scoresArray();
      if ( $requestedCycle->categories() ){
        $pageProps['categories'] = $requestedCycle->categories();
        $pageProps['scoringCalculation'] = $requestedCycle->rubric()->scoringCalculation();
      }
    }

    $context['pageProps'] = $pageProps;
    UcdlibAwardsTimber::renderAdminPage( 'evaluation', $context );

  }

  /**
   * @description Render the main admin Dashboard.
   */
  public function renderMain(){
    $context = $this->context();
    $requestedCycle = $this->context['requestedCycle'];
    if ( $requestedCycle ){
      $cycleId = $requestedCycle->cycleId;
    }
    $dashboardSettings = $this->award->getDashboardSettings();
    $context['pageProps'] = [
      'wpAjax' => $this->ajaxUtils->getAjaxElementProperty('adminDashboard'),
      'logsProps' => [
        'wpAjax' => $this->ajaxUtils->getAjaxElementProperty('adminLogs'),
        'cycleId' => isset($cycleId) ? $cycleId : 0,
        'doQueryOnLoad' => true,
        'filters' => ['types' => $dashboardSettings['logTypeFilter']]
      ],
      'requestedCycle' => $context['pageContainerProps']['requestedCycle'],
      'cyclesLink' => $context['pageContainerProps']['cyclesLink'],
      'logsLink' => $context['links']['logs'],
      'rubricLink' => $context['links']['rubric'],
      'hasRubric' => false
    ];

    if ( $requestedCycle ){
      $context['pageProps']['hasRubric'] = $requestedCycle->hasRubric();
      $usesSum = $requestedCycle->rubric()->scoringCalculation() == 'sum';
      if ( $requestedCycle->hasRubric() ){
        $context['pageProps']['rubricItemTitles'] = array_map(function($item) use ($usesSum){
          $title = $item->title;
          if ( $item->range_max && $usesSum){
            $title .= ' (' . $item->range_max . ')';
          }
          return $title;
        }, $requestedCycle->rubric()->items()
        );
      }

      $context['pageProps']['applicationSummary'] = $requestedCycle->applicationSummary();
    }
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
   * @description Render the admin Judges page.
   */
  public function renderJudges(){
    $context = $this->context();
    $requestedCycle = $context['requestedCycle'];
    $pageProps = [
      'wpAjax' => $this->ajaxUtils->getAjaxElementProperty('adminJudges'),
    ];
    if ( $requestedCycle ){
      $pageProps['cycleId'] = $requestedCycle->cycleId;
      $pageProps['categories'] = $requestedCycle->categories();
      $pageProps['judges'] = $requestedCycle->judges(true, ['assignments' => true, 'conflictsOfInterest' => true, 'completedEvaluations' => true]);

      $pageProps['applicants'] = [];
      $applicants = $requestedCycle->allApplicants();
      foreach ($applicants as $applicant) {
        $a = [
          'name' => $applicant->name(),
          'id' => $applicant->record()->user_id,
        ];
        if ( !empty($requestedCycle->categories())) {
          $a['category'] = $applicant->applicationCategory($requestedCycle->cycleId);
        }
        $pageProps['applicants'][] = $a;
      }


    }

    $context['pageProps'] = $pageProps;
    UcdlibAwardsTimber::renderAdminPage( 'judges', $context );
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
      $pageProps['cycleId'] = $requestedCycle->cycleId;
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
      $pageProps['judges'] = $requestedCycle->judges(true);
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
      'cyclesWithRubric' => [],
      'scoringCalculation' => 'sum'
    ];
    if ( $requestedCycle ){
      $pageProps['cycleId'] = $requestedCycle->cycleId;
      if ( $requestedCycle->hasRubric() ){
        $pageProps['rubricItems'] = $requestedCycle->rubric()->items();
      }
      $pageProps['scoringCalculation'] = $requestedCycle->rubric()->scoringCalculation();
      $pageProps['uploadedFile'] = $requestedCycle->rubric()->uploadedFile();
      $cyclesWithRubric = $this->plugin->cycles->filterByRubric();
      foreach ($cyclesWithRubric as $c) {
        if ( $c->cycleId == $requestedCycle->cycleId ) continue;
        $pageProps['cyclesWithRubric'][] = [
          'cycle_id' => $c->cycleId,
          'title' => $c->title()
        ];
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
      'logs' => admin_url( 'admin.php?page=' . $this->slugs['logs'] ),
      'rubric' => admin_url( 'admin.php?page=' . $this->slugs['rubric'] )
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
        foreach ($this->context['links'] as &$link) {
          $link = add_query_arg( $cycleQueryParam, $requestedCycle->cycleId, $link );
        }
        $requestedCycle = $requestedCycle->recordArray(['applicantCount' => true]);
      }
      $this->context['pageContainerProps']['requestedCycle'] = $requestedCycle;
    }
    return $this->context;
  }
}
