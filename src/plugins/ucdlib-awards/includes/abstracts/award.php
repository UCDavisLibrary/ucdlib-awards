<?php

/**
 * @description Abstract class for a single award.
 * Sometimes an award will need some custom functionality beyond what is provided by the platform GUI.
 * The award plugin should extend this class.
 */
class UcdlibAwardsAwardAbstract {

  /**
   * @description Unique identifier for the award.
   */
  protected $_slug = 'ucdlib_award';

  /**
   * @description The title of the award.
   */
	protected $_title = "UC Davis Library Award";

  /**
   * @description Admin menu options
   */
  protected $_adminMenuTitle = "Awards";
  protected $_adminMenuPageTitle = "UC Davis Library Award";
  protected $_adminMenuSlugs = [
    'main' => 'awards-admin',
    'cycles' => 'awards-admin-cycles',
    'logs' => 'awards-admin-logs',
    'applicants' => 'awards-admin-applicants',
    'rubric' => 'awards-admin-rubric',
    'judges' => 'awards-admin-reviewers',
    'evaluation' => 'awards-admin-evaluation',
    'email' => 'awards-admin-email',
    'supporters' => 'awards-admin-supporters'
  ];

  protected $_dashboardSettings = [
    'logTypeFilter' => []
  ];

  /**
   * @description Evaluation menu options
   */
  protected $_evaluationMenuTitle = "Awards Evaluation";
  protected $_evaluationMenuPageTitle = "UC Davis Library Award";
  protected $_evaluationMenuSlugs = [
    'main' => 'awards-evaluation'
  ];
  protected $_adminCanImpersonateJudge = false;

  /**
   * @description How app will be displayed in logger error reporting
   */
  protected $_loggerAppName = 'ucdlib-awards';

  /**
   * CUSTOMIZE END
   */

  final public function getSlug() {
		return $this->_slug;
	}

  final public function getTitle() {
		return $this->_title;
	}

  final public function getAdminMenuTitle() {
    return $this->_adminMenuTitle;
  }

  final public function getAdminMenuPageTitle() {
    return $this->_adminMenuPageTitle;
  }

  final public function getAdminMenuSlugs() {
    return $this->_adminMenuSlugs;
  }

  final public function getDashboardSettings() {
    return $this->_dashboardSettings;
  }

  final public function getEvaluationMenuSlugs() {
    return $this->_evaluationMenuSlugs;
  }

  final public function getEvaluationMenuTitle() {
    return $this->_evaluationMenuTitle;
  }

  final public function getEvaluationMenuPageTitle() {
    return $this->_evaluationMenuPageTitle;
  }

  final public function getEvaluationPageLink() {
    return admin_url( 'admin.php?page=' . $this->getEvaluationMenuSlugs()['main'] );
  }

  final public function getAdminCanImpersonateJudge() {
    return $this->_adminCanImpersonateJudge;
  }

  final public function getLoggerAppName() {
    return $this->_loggerAppName;
  }

  public function __construct() {
    add_filter('ucdlib_awards_log_app_name', [$this, 'getLoggerAppName']);
  }

}
