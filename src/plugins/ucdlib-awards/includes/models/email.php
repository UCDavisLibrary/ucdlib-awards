<?php

class UcdlibAwardsEmail {

  public function __construct($plugin){
    $this->plugin = $plugin;

    $this->templateVariables = [
      'applicantName' => 'Applicant Name',
      'judgeName' => 'Judge Name',
      'prizeName' => 'Prize Name',
      'evaluationUrl' => 'Evaluation Link',
      'judgeIncompleteCount' => 'Number of Incomplete Evaluations',
      'evaluationEndDate' => 'Evaluation End Date'
    ];

    $this->metaFields = [
      'emailSenderAddress' =>
        ['group' =>'general', 'type' => 'email', 'default' => '', 'label' => 'Sender Email Address', 'isArray' => false],
      'emailSenderName' =>
        ['group' =>'general', 'type' => 'text', 'default' => '', 'label' => 'Sender Name', 'isArray' => false],
      'emailDisableEmails' =>
        ['group' =>'general', 'type' => 'boolean', 'default' => false, 'label' => 'Disable All Emails', 'isArray' => false],
      'emailDisableAutomatedEmails' =>
        ['group' =>'general', 'type' => 'boolean', 'default' => false, 'label' => 'Disable Automated Emails', 'isArray' => false],
      'emailAdminAddresses' =>
        ['group' =>'admin', 'type' => 'email', 'default' => [], 'label' => 'Admin Email Addresses', 'isArray' => true],
      'emailAdminApplicationSubmittedDisable' =>
        ['group' =>'admin', 'type' => 'boolean', 'default' => false, 'label' => 'Disable Application Submitted Email', 'isArray' => false],
      'emailAdminConflictOfInterestDisable' =>
        ['group' =>'admin', 'type' => 'boolean', 'default' => false, 'label' => 'Disable Conflict of Interest Email', 'isArray' => false],
      'emailAdminEvaluationSubmittedDisable' =>
        ['group' =>'admin', 'type' => 'boolean', 'default' => false, 'label' => 'Disable Evaluation Submitted Email', 'isArray' => false],
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
    ];

    $this->cache = [];
    $this->optionPrefix = $this->plugin->config::$optionsSlug . '_email_';

    $this->emailingEnabled = getenv('UCDLIB_AWARDS_EMAILING_ENABLED') === 'true';
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
      A new application has been submitted by {$applicant->name()} - ({$applicant->record()->email}).

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
    $headers[] = 'Content-Type: text/html; charset=UTF-8';

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

    if ( !isset( $defaults[ $field ] ) ){
      return '';
    }
    return $defaults[ $field ];
  }
}
