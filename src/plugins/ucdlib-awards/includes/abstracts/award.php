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
    'judges' => 'awards-admin-judges'
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

}
