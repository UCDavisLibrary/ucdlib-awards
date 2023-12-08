<?php

class AggieOpen extends UcdlibAwardsAwardAbstract {

  protected $_slug = 'aggie_open';
	protected $_title = "Aggie Open";

  protected $_adminMenuTitle = "Aggie Open";
  protected $_adminMenuPageTitle = "Aggie Open";
  protected $_adminMenuSlugs = [
    'main' => 'aggie-open-admin',
    'cycles' => 'aggie-open-admin-cycles',
    'logs' => 'aggie-open-admin-logs',
    'applicants' => 'aggie-open-admin-applicants',
    'rubric' => 'aggie-open-admin-rubric',
    'judges' => 'aggie-open-admin-reviewers',
    'evaluation' => 'aggie-open-admin-evaluation',
    'email' => 'aggie-open-admin-email',
    'supporters' => 'aggie-open-admin-supporters'
  ];

  protected $_evaluationMenuTitle = "Aggie Open Evaluation";
  protected $_evaluationMenuPageTitle = "Aggie Open";
  protected $_evaluationMenuSlugs = [
    'main' => 'aggie-open-evaluation'
  ];

  protected $_dashboardSettings = [
    'logTypeFilter' => ['application', 'evaluation']
  ];

}
