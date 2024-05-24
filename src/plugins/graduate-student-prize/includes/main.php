<?php

class GraduateStudentPrize extends UcdlibAwardsAwardAbstract {

  protected $_slug = 'graduate_student_prize';
	protected $_title = "Graduate Student Prize";

  protected $_adminMenuTitle = "Graduate Student Prize";
  protected $_adminMenuPageTitle = "UC Davis Graduate Student Prize";
  protected $_adminMenuSlugs = [
    'main' => 'graduate-student-admin',
    'cycles' => 'graduate-student-prize-admin-cycles',
    'logs' => 'graduate-student-prize-admin-logs',
    'applicants' => 'graduate-student-prize-admin-applicants',
    'rubric' => 'graduate-student-prize-admin-rubric',
    'judges' => 'graduate-student-prize-admin-reviewers',
    'evaluation' => 'graduate-student-prize-admin-evaluation',
    'email' => 'graduate-student-prize-admin-email',
    'supporters' => 'graduate-student-prize-admin-supporters'
  ];

  protected $_evaluationMenuTitle = "Graduate Student Prize Evaluation";
  protected $_evaluationMenuPageTitle = "UC Davis Graduate Student Prize";
  protected $_evaluationMenuSlugs = [
    'main' => 'graduate-student-prize-evaluation'
  ];

  protected $_dashboardSettings = [
    'logTypeFilter' => ['application', 'evaluation']
  ];

}
