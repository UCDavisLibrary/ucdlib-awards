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
    $activeCycle = $context['activeCycle'];

    $context['pageProps'] = [
      'wpAjax' => $this->ajaxUtils->getAjaxElementProperty('evaluation'),
      'awardsTitle' => $this->award->getTitle()
    ];

    if ( $context['isAdmin'] ){
      $context['pageProps']['hideWpMenus'] = false;
      $context['pageProps']['judges'] = $context['judges'];

    } else {
      $context['pageProps']['hideWpMenus'] = true;
    }

    if ( $context['isJudge'] ){
      $userId = $context['currentUser']->record()->user_id;
      foreach ($context['judges'] as $judge) {
        if ( $judge['id'] == $userId ){
          $context['pageProps']['judge'] = $judge;
          break;
        }
      }
    }

    if ( $context['isJudge'] || $context['isAdmin'] ){
      if ( $activeCycle->hasRubric() ){
        $context['pageProps']['rubricItems'] = $activeCycle->rubric()->items();
        $context['pageProps']['rubricScoringCalculation'] = $activeCycle->rubric()->scoringCalculation();
        $context['pageProps']['rubricUploadedFile'] = $activeCycle->rubric()->uploadedFile();
      }
    }

    UcdlibAwardsTimber::renderEvaluationPage( 'evaluation', $context );
  }



  /**
   * @description Returns the base context for all evaluation pages.
   */
  protected $context;
  public function context(){
    if ( !empty($this->context) ) return $this->context;

    $currentUser = $this->plugin->users->currentUser();
    $activeCycle = $this->plugin->cycles->activeCycle();
    $isJudge = false;
    $judges = [];
    if ( $activeCycle ) {
      $isJudge = $currentUser->isJudge( $activeCycle->cycleId );
      $judges = $activeCycle->judges(true, ['assignments' => true]);
    }

    $this->context = [
      'currentUser' => $currentUser,
      'activeCycle' => $activeCycle,
      'isAdmin' => $currentUser->isAdmin(),
      'isJudge' => $isJudge,
      'judges' => $judges,
      'pageContainerProps' => [
        'pageTitle' => $this->award->getAdminMenuPageTitle(),
        'siteLogo' => dirname( get_template_directory_uri() ) . "/assets/img/site-icon.png"
      ],
      'award' => $this->award,
    ];

    return $this->context;
  }
}
