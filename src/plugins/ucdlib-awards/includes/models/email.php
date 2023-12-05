<?php

class UcdlibAwardsEmail {

  public function __construct($plugin){
    $this->plugin = $plugin;

    $this->templateVariables = [
      'applicantName' => 'Applicant Name',
      'judgeName' => 'Judge Name',
      'supporterName' => 'Supporter Name',
      'prizeName' => 'Prize Name',
      'evaluationUrl' => 'Evaluation Link',
      'supportUrl' => 'Support Form Link',
      'judgeIncompleteCount' => 'Number of Incomplete Evaluations',
      'evaluationEndDate' => 'Evaluation End Date',
      'supportEndDate' => 'Support Letter End Date'
    ];

    $this->metaFields = [
      'emailSenderAddress' =>
        ['group' =>'general', 'type' => 'email', 'default' => '', 'label' => 'Sender Email Address', 'isArray' => false],
      'emailSenderName' =>
        ['group' =>'general', 'type' => 'text', 'default' => '', 'label' => 'Sender Name', 'isArray' => false],
      'emailDisableEmails' =>
        ['group' =>'general', 'type' => 'boolean', 'default' => true, 'label' => 'Disable All Emails', 'isArray' => false],
      'emailDisableAutomatedEmails' =>
        ['group' =>'general', 'type' => 'boolean', 'default' => true, 'label' => 'Disable Automated Emails', 'isArray' => false],
      'emailAdminAddresses' =>
        ['group' =>'admin', 'type' => 'email', 'default' => [], 'label' => 'Admin Email Addresses', 'isArray' => true],
      'emailAdminApplicationSubmittedDisable' =>
        ['group' =>'admin', 'type' => 'boolean', 'default' => false, 'label' => 'Disable Application Submitted Email', 'isArray' => false],
      'emailAdminConflictOfInterestDisable' =>
        ['group' =>'admin', 'type' => 'boolean', 'default' => false, 'label' => 'Disable Conflict of Interest Email', 'isArray' => false],
      'emailAdminEvaluationSubmittedDisable' =>
        ['group' =>'admin', 'type' => 'boolean', 'default' => false, 'label' => 'Disable Evaluation Submitted Email', 'isArray' => false],
      'emailAdminSupportSubmittedDisable' =>
        ['group' =>'admin', 'type' => 'boolean', 'default' => false, 'label' => 'Disable Support Letter Submitted Email', 'isArray' => false],
      'emailApplicantConfirmationDisable' =>
        ['group' =>'applicant', 'type' => 'boolean', 'default' => false, 'label' => 'Disable Application Confirmation Email', 'isArray' => false],
      'emailApplicantConfirmationSubject' =>
        [
          'group' =>'applicant',
          'type' => 'text',
          'default' => '',
          'label' => 'Application Confirmation Subject',
          'isArray' => false,
          'isTemplate' => true,
          'variables' => ['applicantName', 'prizeName'],
        ],
      'emailApplicantConfirmationBody' =>
        [
          'group' =>'applicant',
          'type' => 'textArea',
          'default' => '',
          'label' => 'Application Confirmation Body',
          'isArray' => false,
          'isTemplate' => true,
          'variables' => ['applicantName', 'prizeName'],
        ],
      'emailJudgeApplicantAssignedDisable' =>
        ['group' =>'judge', 'type' => 'boolean', 'default' => false, 'label' => 'Disable Applicant Assigned Email', 'isArray' => false],
      'emailJudgeApplicantAssignedSubject' =>
        [
          'group' =>'judge',
          'type' => 'text',
          'default' => '',
          'label' => 'Applicant Assigned Subject',
          'isArray' => false,
          'isTemplate' => true,
          'variables' => ['judgeName', 'prizeName'],
        ],
      'emailJudgeApplicantAssignedBody' =>
        [
          'group' =>'judge',
          'type' => 'textArea',
          'default' => '',
          'label' => 'Applicant Assigned Body',
          'isArray' => false,
          'isTemplate' => true,
          'variables' => ['judgeName', 'prizeName', 'evaluationUrl'],
        ],
      'emailJudgeEvaluationNudgeDisable' =>
        ['group' =>'judge', 'type' => 'boolean', 'default' => false, 'label' => 'Disable Evaluation Nudge Email', 'isArray' => false],
      'emailJudgeEvaluationNudgeSubject' =>
        [
          'group' =>'judge',
          'type' => 'text',
          'default' => '',
          'label' => 'Evaluation Nudge Subject',
          'isArray' => false,
          'isTemplate' => true,
          'variables' => ['judgeName', 'prizeName', 'judgeIncompleteCount']
        ],
      'emailJudgeEvaluationNudgeBody' =>
        [
          'group' =>'judge',
          'type' => 'textArea',
          'default' => '',
          'label' => 'Evaluation Nudge Body',
          'isArray' => false,
          'isTemplate' => true,
          'variables' => ['judgeName', 'prizeName', 'judgeIncompleteCount', 'evaluationUrl', 'evaluationEndDate']
        ],
      'emailSupporterRegisteredDisable' =>
        ['group' =>'supporter', 'type' => 'boolean', 'default' => false, 'label' => 'Disable Supporter Registered Email', 'isArray' => false],
      'emailSupporterRegisteredSubject' =>
        [
          'group' =>'supporter',
          'type' => 'text',
          'default' => '',
          'label' => 'Supporter Registered Subject',
          'isArray' => false,
          'isTemplate' => true,
          'variables' => ['supporterName', 'prizeName'],
        ],
      'emailSupporterRegisteredBody' =>
        [
          'group' =>'supporter',
          'type' => 'textArea',
          'default' => '',
          'label' => 'Supporter Registered Body',
          'isArray' => false,
          'isTemplate' => true,
          'variables' => ['supporterName', 'prizeName', 'supportEndDate', 'supportUrl', 'applicantName'],
        ],
      'emailSupporterNudgeDisable' =>
        ['group' =>'supporter', 'type' => 'boolean', 'default' => false, 'label' => 'Disable Supporter Nudge Email', 'isArray' => false],
      'emailSupporterNudgeSubject' =>
        [
          'group' =>'supporter',
          'type' => 'text',
          'default' => '',
          'label' => 'Supporter Nudge Subject',
          'isArray' => false,
          'isTemplate' => true,
          'variables' => ['supporterName', 'prizeName', 'supportEndDate']
        ],
      'emailSupporterNudgeBody' =>
        [
          'group' =>'supporter',
          'type' => 'textArea',
          'default' => '',
          'label' => 'Supporter Nudge Body',
          'isArray' => false,
          'isTemplate' => true,
          'variables' => ['supporterName', 'prizeName', 'supportEndDate', 'supportUrl', 'applicantName']
        ]
    ];

    $this->cache = [];
    $this->optionPrefix = $this->plugin->config::$optionsSlug . '_email_';

    $this->emailingEnabled = getenv('UCDLIB_AWARDS_EMAILING_ENABLED') === 'true';
  }

  public function sendSupportRequestEmail( $cycleId, $supporterId, $applicantId ){
    try {
      if ( $this->getMeta($cycleId, 'emailDisableAutomatedEmails') ) return false;

      $supporter = $this->plugin->users->getByUserIds( $supporterId );
      if ( !count( $supporter ) ) return false;
      $supporter = $supporter[0];

      $applicant = $this->plugin->users->getByUserIds( $applicantId );
      if ( !count( $applicant ) ) return false;
      $applicant = $applicant[0];

      $cycle = $this->plugin->cycles->getById( $cycleId );
      if ( !$cycle ) return false;
      if ( !$cycle->supportIsEnabled() ) return false;

      $sent = $this->sendEmailFromTemplate( $cycleId, 'emailSupporterRegistered', $supporter, [
        'supporter' => $supporter,
        'applicant' => $applicant,
        'cycle' => $cycle
      ]);

      if ( $sent ){
        $this->plugin->logs->logSupportRequestEmail( $cycleId, $supporterId, $applicantId);
      }

      return $sent;

    } catch (\Throwable $th) {
      error_log('Error in sendSupportRequestEmail: ' . $th->getMessage());
      return false;
    }
  }

  public function sendSupporterNudgeEmail( $cycleId, $supporterId, $applicantId ){
    try {

      $supporter = $this->plugin->users->getByUserIds( $supporterId );
      if ( !count( $supporter ) ) return false;
      $supporter = $supporter[0];

      $applicant = $this->plugin->users->getByUserIds( $applicantId );
      if ( !count( $applicant ) ) return false;
      $applicant = $applicant[0];

      $cycle = $this->plugin->cycles->getById( $cycleId );
      if ( !$cycle ) return false;
      if ( !$cycle->supportIsEnabled() ) return false;

      $sent = $this->sendEmailFromTemplate( $cycleId, 'emailSupporterNudge', $supporter, [
        'supporter' => $supporter,
        'applicant' => $applicant,
        'cycle' => $cycle
      ]);

      if ( $sent ){
        $this->plugin->logs->logSupportNudgeEmail( $cycleId, $supporterId, $applicantId);
      }

      return $sent;

    } catch (\Throwable $th) {
      error_log('Error in sendSupporterNudgeEmail: ' . $th->getMessage());
      return false;
    }

  }

  public function sendJudgeEvaluationNudgeEmail( $cycleId, $judgeId ){
    try {

      $judge = $this->plugin->users->getByUserIds( $judgeId );
      if ( !count( $judge ) ) return false;
      $judge = $judge[0];

      $cycle = $this->plugin->cycles->getById( $cycleId );
      if ( !$cycle ) return false;

      $sent = $this->sendEmailFromTemplate( $cycleId, 'emailJudgeEvaluationNudge', $judge, [
        'judge' => $judge,
        'cycle' => $cycle
      ]);

      if ( $sent ) {
        $this->plugin->logs->logEvaluationNudgeEmail( $cycleId, $judgeId);
      }

      return $sent;

    } catch (\Throwable $th) {
      error_log('Error in sendJudgeEvaluationNudgeEmail: ' . $th->getMessage());
      return false;
    }
  }

  public function sendJudgeApplicantAssignmentEmail($cycleId, $judgeId){
    try {
      if ( $this->getMeta($cycleId, 'emailDisableAutomatedEmails') ) return false;

      $judge = $this->plugin->users->getByUserIds( $judgeId );
      if ( !count( $judge ) ) return false;
      $judge = $judge[0];

      $cycle = $this->plugin->cycles->getById( $cycleId );
      if ( !$cycle ) return false;

      $sent = $this->sendEmailFromTemplate( $cycleId, 'emailJudgeApplicantAssigned', $judge, [
        'judge' => $judge,
        'cycle' => $cycle
      ]);

      if ( $sent ){
        $this->plugin->logs->logApplicantAssignedEmail( $cycleId, $judgeId);
      }

      return $sent;

    } catch (\Throwable $th) {
      error_log('Error in sendJudgeApplicantAssignmentEmail: ' . $th->getMessage());
      return false;
    }
  }

  public function sendApplicantConfirmationEmail($cycleId, $applicantId){
    try {
      if ( $this->getMeta($cycleId, 'emailDisableAutomatedEmails') ) return false;

      $applicant = $this->plugin->users->getByUserIds( $applicantId );
      if ( !count( $applicant ) ) return false;
      $applicant = $applicant[0];

      $cycle = $this->plugin->cycles->getById( $cycleId );
      if ( !$cycle ) return false;

      $sent = $this->sendEmailFromTemplate( $cycleId, 'emailApplicantConfirmation', $applicant, [
        'applicant' => $applicant,
        'cycle' => $cycle
      ]);

      if ( $sent ){
        $this->plugin->logs->logApplicationSubmitEmail( $cycleId, $applicantId);
      }

      return $sent;

    } catch (\Throwable $th) {
      error_log('Error in sendApplicantConfirmationEmail: ' . $th->getMessage());
      return false;
    }
  }

  public function sendEmailFromTemplate($cycleId, $metaPrefix, $toUser, $data){
    try {
      $canEmail = $this->canSendEmail( $cycleId ) &&
      !$this->getMeta( $cycleId, $metaPrefix . 'Disable' );
      if ( !$canEmail ) return false;

      $toEmail = $toUser->record()->email;

      $subject = $this->getMeta( $cycleId, $metaPrefix . 'Subject' );
      if ( empty( $subject ) ) $subject = $this->getTemplateDefault( $metaPrefix . 'Subject' );

      $body = $this->getMeta( $cycleId, $metaPrefix . 'Body' );
      if ( empty( $body ) ) $body = $this->getTemplateDefault( $metaPrefix . 'Body' );

      $variableSlugs = array_merge( $this->getVariablesFromTemplateString( $subject ), $this->getVariablesFromTemplateString( $body ) );
      foreach( $variableSlugs as $variableSlug ){
        $variableValue = $this->hydrateTemplateVariable( $variableSlug, $data );
        $subject = str_replace( '{{' . $variableSlug . '}}', $variableValue, $subject );
        $body = str_replace( '{{' . $variableSlug . '}}', $variableValue, $body );
      }

      $sent = $this->sendEmail( $cycleId, $toEmail, $subject, $body );
      return $sent;

    } catch (\Throwable $th) {
      error_log('Error in sendEmailFromTemplate: ' . $th->getMessage());
      return false;
    }
  }

  public function getVariablesFromTemplateString($templateString){
    $variables = [];
    // extract string from {{}}
    preg_match_all('/{{(.*?)}}/', $templateString, $matches);
    if ( isset( $matches[1] ) ){
      foreach( $matches[1] as $match ){
        $variables[] = trim( $match );
      }
    }
    return $variables;
  }

  public function hydrateTemplateVariable($variable, $data=[]){
    $out = '';
    try {
      switch( $variable ){
        case 'applicantName':
          if ( !isset($data['applicant']) ) break;
          $out = $data['applicant']->name();
          break;
        case 'judgeName':
          if ( !isset($data['judge']) ) break;
          $out = $data['judge']->name();
          break;
        case 'supporterName':
          if ( !isset($data['supporter']) ) break;
          $out = $data['supporter']->name();
          break;
        case 'prizeName':
          $out = $this->plugin->award->getTitle();
          break;
        case 'evaluationUrl':
          $out = $this->plugin->award->getEvaluationPageLink();
          break;
        case 'supportUrl':
          if ( !isset($data['cycle']) ) break;
          $out = $data['cycle']->supportFormLink();
        case 'judgeIncompleteCount':
          if ( !isset($data['judge']) ) break;
          if ( !isset($data['cycle']) ) break;
          $assignments = $data['cycle']->judgeAssignmentMap();
          $evaluations = $data['cycle']->completedEvaluationsMap();
          $judgeId = $data['judge']->record()->user_id;
          $assignments = isset( $assignments[ $judgeId ] ) ? $assignments[ $judgeId ] : [];
          $evaluations = isset( $evaluations[ $judgeId ] ) ? $evaluations[ $judgeId ] : [];
          $assignedAndEvaluated = array_intersect( $assignments, $evaluations );
          $notEvaluated = array_diff( $assignments, $assignedAndEvaluated );
          $out = count( $notEvaluated );
          break;
        case 'evaluationEndDate':
          if ( !isset($data['cycle']) ) break;
          $date = $data['cycle']->record()->application_end;
          $out = date( 'F j, Y', strtotime( $date ) );
          break;
        case 'supportEndDate':
          if ( !isset($data['cycle']) ) break;
          $date = $data['cycle']->record()->support_end;
          $out = date( 'F j, Y', strtotime( $date ) );
          break;
      }
    } catch (\Throwable $th) {
      error_log('Error in hydrateTemplateVariable: ' . $th->getMessage());
    }
    return $out;
  }

  public function canSendEmail($cycleId){
    $canEmail = $this->emailingEnabled &&
    !$this->getMeta( $cycleId, 'emailDisableEmails' ) &&
    $this->getMeta( $cycleId, 'emailSenderAddress' ) &&
    $this->getMeta( $cycleId, 'emailSenderName' );
    return $canEmail;
  }

  public function canSendAutomatedEmail($cycleId){
    $canEmail = $this->canSendEmail( $cycleId ) &&
    !$this->getMeta( $cycleId, 'emailDisableAutomatedEmails' );
    return $canEmail;
  }

  public function canSendAdminNotificationEmail($cycleId){
    $canEmail = $this->canSendAutomatedEmail( $cycleId ) &&
    count($this->getMeta( $cycleId, 'emailAdminAddresses' )) > 0;
    return $canEmail;
  }

  public function sendAdminEvaluationSubmittedEmail($cycleId, $judgeId, $applicantId){
    try {
      $canEmail = $this->canSendAdminNotificationEmail( $cycleId ) &&
      !$this->getMeta( $cycleId, 'emailAdminEvaluationSubmittedDisable' );
      if ( !$canEmail ) return false;

      $applicant = $this->plugin->users->getByUserIds( $applicantId );
      if ( !count( $applicant ) ) return false;
      $applicant = $applicant[0];

      $judge = $this->plugin->users->getByUserIds( $judgeId );
      if ( !count( $judge ) ) return false;
      $judge = $judge[0];

      $cycle = $this->plugin->cycles->getById( $cycleId );
      if ( !$cycle ) return false;

      $assignments = $cycle->judgeAssignmentMap();
      if ( !isset( $assignments[ $judgeId ] ) ) return false;
      $assignments = $assignments[ $judgeId ];

      $evaluations = $cycle->completedEvaluationsMap();
      if ( !isset( $evaluations[ $judgeId ] ) ) return false;
      $evaluations = $evaluations[ $judgeId ];

      $assignedAndEvaluated = array_intersect( $assignments, $evaluations );

      $assignmentCt = count( $assignments );
      $evaluatedCt = count( $assignedAndEvaluated );

      $subject = 'Evaluation Submitted';
      $body = <<<EOT
      {$judge->name()} has just submitted an evaluation for {$applicant->name()} - {$applicant->record()->email}.

      {$judge->name()} has evaluated {$evaluatedCt}/{$assignmentCt} of their assigned applications.
      EOT;

      $sent = $this->sendEmail( $cycleId, $this->getMeta( $cycleId, 'emailAdminAddresses' ), $subject, $body );
      return $sent;

    } catch (\Throwable $th) {
      error_log('Error in sendAdminEvaluationSubmittedEmail: ' . $th->getMessage());
      return false;
    }
  }

  public function sendAdminConflictOfInterestEmail($cycleId, $applicantId, $judgeId){
    try {
      $canEmail = $this->canSendAdminNotificationEmail( $cycleId ) &&
      !$this->getMeta( $cycleId, 'emailAdminConflictOfInterestDisable' );
      if ( !$canEmail ) return false;

      $applicant = $this->plugin->users->getByUserIds( $applicantId );
      if ( !count( $applicant ) ) return false;
      $applicant = $applicant[0];

      $judge = $this->plugin->users->getByUserIds( $judgeId );
      if ( !count( $judge ) ) return false;
      $judge = $judge[0];

      $link = admin_url( 'admin.php?page=' . $this->plugin->award->getAdminMenuSlugs()['judges'] );

      $comment = 'No comment provided';
      $commentMetaKey = 'conflictOfInterestApplicant' . $applicantId . 'Details';
      $commentMeta = $judge->cycleMetaItem( $commentMetaKey, $cycleId );
      if ( $commentMeta ) $comment = $commentMeta;

      $subject = 'Conflict of Interest Declared';
      $body = <<<EOT
      {$judge->name()} has declared a conflict of interest with {$applicant->name()} - {$applicant->record()->email}.

      Judge Comment:
      {$comment}

      Please visit the following link to reassign the application:

      {$link}
      EOT;

      $sent = $this->sendEmail( $cycleId, $this->getMeta( $cycleId, 'emailAdminAddresses' ), $subject, $body );
      return $sent;

    } catch (\Throwable $th) {
      error_log('Error in sendAdminConflictOfInterestEmail: ' . $th->getMessage());
      return false;
    }
  }

  public function sendAdminSupportSubmittedEmail($cycleId, $applicantId, $supporterId){
    try {
      $canEmail = $this->canSendAdminNotificationEmail( $cycleId ) &&
      !$this->getMeta( $cycleId, 'emailAdminSupportSubmittedDisable' );
      if ( !$canEmail ) return false;

      $applicant = $this->plugin->users->getByUserIds( $applicantId );
      if ( !count( $applicant ) ) return false;
      $applicant = $applicant[0];

      $supporter = $this->plugin->users->getByUserIds( $supporterId );
      if ( !count( $supporter ) ) return false;
      $supporter = $supporter[0];

      $subject = 'Support Letter Submitted';
      $body = <<<EOT
      {$supporter->name()} has just submitted a support letter for {$applicant->name()} - {$applicant->record()->email}.
      EOT;

      $sent = $this->sendEmail( $cycleId, $this->getMeta( $cycleId, 'emailAdminAddresses' ), $subject, $body );
      return $sent;

    } catch (\Throwable $th) {
      error_log('Error in sendAdminSupportSubmittedEmail: ' . $th->getMessage());
      return false;
    }
  }

  public function sendAdminApplicationSubmittedEmail($cycleId, $applicantId){

    try {
      $canEmail = $this->canSendAdminNotificationEmail( $cycleId ) &&
      !$this->getMeta( $cycleId, 'emailAdminApplicationSubmittedDisable' );
      if ( !$canEmail ) return false;

      $applicant = $this->plugin->users->getByUserIds( $applicantId );
      if ( !count( $applicant ) ) return false;
      $applicant = $applicant[0];
      $link = admin_url( 'admin.php?page=' . $this->plugin->award->getAdminMenuSlugs()['applicants'] );

      $subject = 'New Application Submitted';
      $body = <<<EOT
      A new application has been submitted by {$applicant->name()} - {$applicant->record()->email}.

      Please visit the following link to view the application:

      {$link}
      EOT;

      $sent = $this->sendEmail( $cycleId, $this->getMeta( $cycleId, 'emailAdminAddresses' ), $subject, $body );
      return $sent;
    } catch (\Throwable $th) {
      error_log('Error in sendAdminApplicationSubmittedEmail: ' . $th->getMessage());
      return false;
    }

  }

  public function sendEmail($cycleId, $to, $subject, $body, $attachments=[]){
    $canEmail = $this->canSendEmail( $cycleId );
    if ( !$canEmail ) return false;

    $headers = [];
    $headers[] = 'From: ' . $this->getMeta( $cycleId, 'emailSenderName' ) . ' <' . $this->getMeta( $cycleId, 'emailSenderAddress' ) . '>';
    $headers[] = 'Reply-To: ' . $this->getMeta( $cycleId, 'emailSenderName' ) . ' <' . $this->getMeta( $cycleId, 'emailSenderAddress' ) . '>';

    //$attachments = apply_filters( 'ucdlib_awards_email_attachments', $attachments, $cycleId );

    $sent = wp_mail( $to, $subject, $body, $headers, $attachments );
    return $sent;
  }

  public function getTemplateVariables(){
    $fieldsByVariable = [];
    foreach( $this->metaFields as $key => $field ){
      if ( !empty( $field['isTemplate']) && isset($field['variables']) ){
        foreach( $field['variables'] as $variable ){
          if ( !isset( $fieldsByVariable[ $variable ] ) ) $fieldsByVariable[ $variable ] = [];
          $fieldsByVariable[ $variable ][] = $key;
        }
      }
    }

    $out = [];
    foreach ($this->templateVariables as $key => $value) {
      $out[] = [
        'key' => $key,
        'label' => $value,
        'fields' => isset( $fieldsByVariable[ $key ] ) ? $fieldsByVariable[ $key ] : [],
      ];
    }
    return $out;
  }

  public function getMeta($cycleId, $key, $default=null){
    $cycleMeta = $this->getAllMeta( $cycleId );
    return isset( $cycleMeta[ $key ] ) ? $cycleMeta[ $key ] : $default;
  }

  public function getAllMeta( $cycleId, $byGroup=false ){
    $out = [];
    $cycleMeta = [];
    if ( isset($this->cache[$cycleId]) ){
      $cycleMeta = $this->cache[$cycleId];
    } else {
      $cycleMeta = get_option( $this->optionPrefix . $cycleId, [] );
      $this->cache[$cycleId] = $cycleMeta;
    }

    foreach( $this->metaFields as $key => $field ){
      if ( $byGroup && !isset( $out[ $field['group'] ] ) ) $out[ $field['group'] ] = [];

      $v = isset( $cycleMeta[ $key ] ) ? $cycleMeta[ $key ] : $field['default'];
      if ( $byGroup ) {
        $out[ $field['group'] ][ $key ] = $v;
      } else {
        $out[ $key ] = $v;
      }
    }
    return $out;
  }

  public function updateMeta($cycleId, $meta){
    $cycleMeta = get_option( $this->optionPrefix . $cycleId, [] );
    foreach( $meta as $key => $value ){
      $cycleMeta[ $key ] = $value;
    }
    update_option( $this->optionPrefix . $cycleId, $cycleMeta );
    $this->cache[$cycleId] = $cycleMeta;
  }

  public function getAllTemplateDefaults(){
    $out = [];
    foreach( $this->metaFields as $key => $field ){
      if ( !empty( $field['isTemplate'] ) ){
        $out[ $key ] = $this->getTemplateDefault( $key );
      }
    }
    return $out;
  }

  public function getTemplateDefault($field){
    $defaults = [];

    // applicants
    $defaults['emailApplicantConfirmationSubject'] = '{{prizeName}} Application Confirmation';
    $defaults['emailApplicantConfirmationBody'] = <<<EOT
    Dear {{applicantName}},

    Thank you for your application to the {{prizeName}}. Please review the {{prizeName}} website for more information about the evaluation process and timeline.

    Best,
    The {{prizeName}} Administators
    EOT;

    // judges
    $defaults['emailJudgeApplicantAssignedSubject'] = 'New {{prizeName}} Application(s) Assigned';
    $defaults['emailJudgeApplicantAssignedBody'] = <<<EOT
    Dear {{judgeName}},

    You have been assigned to evaluate a new application for the {{prizeName}}.

    Please visit the following link to confirm that you do not have a conflict of interest with the applicant:

    {{evaluationUrl}}

    Best,
    The {{prizeName}} Administators
    EOT;

    $defaults['emailJudgeEvaluationNudgeSubject'] = 'Reminder: {{prizeName}} Application(s) Assigned';
    $defaults['emailJudgeEvaluationNudgeBody'] = <<<EOT
    Dear {{judgeName}},

    You have {{judgeIncompleteCount}} incomplete evaluations for the {{prizeName}}. Please visit the following link to complete your evaluations:

    {{evaluationUrl}}

    The evaluation period ends on {{evaluationEndDate}}.

    Best,
    The {{prizeName}} Administators
    EOT;

    // supporters
    $defaults['emailSupporterRegisteredSubject'] = 'Support Letter Requested for {{prizeName}}';
    $defaults['emailSupporterRegisteredBody'] = <<<EOT
    Dear {{supporterName}},

    {{applicantName}} has requested a support letter for their application to the {{prizeName}}. Please visit the following link to submit your letter:

    {{supportUrl}}

    The support letter period ends on {{supportEndDate}}.

    Best,
    The {{prizeName}} Administators
    EOT;

    $defaults['emailSupporterNudgeSubject'] = 'Reminder: Support Letter Requested for {{prizeName}}';
    $defaults['emailSupporterNudgeBody'] = <<<EOT
    Dear {{supporterName}},

    {{applicantName}} has requested a support letter for their application to the {{prizeName}}. Please visit the following link to submit your letter:

    {{supportUrl}}

    The support letter period ends on {{supportEndDate}}.

    Best,
    The {{prizeName}} Administators
    EOT;

    if ( !isset( $defaults[ $field ] ) ){
      return '';
    }
    return $defaults[ $field ];
  }
}
