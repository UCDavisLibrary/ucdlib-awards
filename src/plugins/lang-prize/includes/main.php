<?php

class LangPrize extends UcdlibAwardsAwardAbstract {

  protected $_slug = 'lang_prize';
	protected $_title = "Lang Prize";

  protected $_adminMenuTitle = "Lang Prize";
  protected $_adminMenuPageTitle = "UC Davis Lang Prize";
  protected $_adminMenuSlugs = [
    'main' => 'lang-prize-admin',
    'cycles' => 'lang-prize-admin-cycles',
    'logs' => 'lang-prize-admin-logs',
    'applicants' => 'lang-prize-admin-applicants',
    'rubric' => 'lang-prize-admin-rubric',
    'judges' => 'lang-prize-admin-reviewers',
    'evaluation' => 'lang-prize-admin-evaluation',
    'email' => 'lang-prize-admin-email',
    'supporters' => 'lang-prize-admin-supporters'
  ];

  protected $_evaluationMenuTitle = "Lang Prize Evaluation";
  protected $_evaluationMenuPageTitle = "UC Davis Lang Prize";
  protected $_evaluationMenuSlugs = [
    'main' => 'lang-prize-evaluation'
  ];

  protected $_dashboardSettings = [
    'logTypeFilter' => ['application', 'evaluation']
  ];

  protected $_loggerAppName = 'lang-prize';

}
