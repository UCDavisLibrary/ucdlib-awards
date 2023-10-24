<?php

class UcdlibAwardsEmail {

  public function __construct($plugin){
    $this->plugin = $plugin;

    $this->templateVariables = [
      'applicantName' => 'Applicant Name',
      'prizeName' => 'Prize Name',
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
      'emailAdminDisableApplicationSubmitted' =>
        ['group' =>'admin', 'type' => 'boolean', 'default' => false, 'label' => 'Disable Application Submitted Email', 'isArray' => false],
      'emailAdminDisableConflictOfInterest' =>
        ['group' =>'admin', 'type' => 'boolean', 'default' => false, 'label' => 'Disable Conflict of Interest Email', 'isArray' => false],
      'emailAdminDisableEvaluationSubmitted' =>
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
        ]
    ];

    $this->cache = [];
    $this->optionPrefix = $this->plugin->config::$optionsSlug . '_email_';
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

    $defaults['emailApplicantConfirmationSubject'] = '{{prizeName}} Application Confirmation';
    $defaults['emailApplicantConfirmationBody'] = <<<EOT
    Dear {{applicantName}},
    Thank you for your application to the {{prizeName}}. We have received your application and will be in touch with you soon.

    Best,
    The {{prizeName}} Administators
    EOT;

    if ( !isset( $defaults[ $field ] ) ){
      return '';
    }
    return $defaults[ $field ];
  }
}
