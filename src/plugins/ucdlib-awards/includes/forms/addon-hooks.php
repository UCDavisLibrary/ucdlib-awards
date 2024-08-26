<?php

class Forminator_Ucdlibawards_Form_Hooks extends Forminator_Integration_Form_Hooks {

  public $plugin;

  public function __construct(Forminator_Integration $addon, int $module_id) {
    parent::__construct( $addon, $module_id );
    $this->plugin = $GLOBALS['ucdlibAwards'];

    $this->submit_error_message = __( 'Submission failed! Please try again later.', 'forminator' );
  }


  public function on_module_submit( $submitted_data ) {
    $formId = $this->module_id;

    // check form is for application or support letter
    $isApplicationForm = $formId == $this->plugin->forms->applicationFormId();
    $isSupportForm = $formId == $this->plugin->forms->supportFormId();
    if ( !$isApplicationForm && !$isSupportForm ) return true;

    $activeCycle = $this->plugin->cycles->activeCycle();
    if ( !$activeCycle ){
      return "Submission failed! Could not determine active application cycle.";
    }

    // Check that form is active
    $formWindowStatus = '';
    if ( $isApplicationForm ) {
      $formWindowStatus = $activeCycle->applicationWindowStatus();
    } else if ( $isSupportForm ) {
      $formWindowStatus = $activeCycle->supportWindowStatus();
    }
    if ( !$formWindowStatus ){
      return "Submission failed! Could not determine application window status.";
    } else if ( $formWindowStatus == 'past' ) {
      return "Submission failed! The application window is closed.";
    } else if ( $formWindowStatus == 'upcoming' ) {
      return "Submission failed! The application window has not yet opened.";
    }

    // Ensure that the user is logged in - this should be handled prior to displaying the form
    $user = $this->plugin->users->currentUser();
    if ( !$user->wpUser() ) {
      return "Submission failed! You must be logged in to submit.";
    }

    // application form specific checks
    if ( $isApplicationForm ){
      // ensure user has not already submitted if an application form
      if ( $user->applicationEntry( $activeCycle->cycleId ) ) {
        return "Submission failed! You have already submitted an application.";
      }

      // ensure that user is in our users table and set isApplicant meta for cycle
      $metaUpdateSuccess = $user->updateMeta( 'isApplicant', true, $activeCycle->cycleId );
      if ( !$metaUpdateSuccess ) {
        return "Submission failed! Could not update user meta.";
      }

      // support form checks
    } else if ( $isSupportForm ){
      if ( empty($submitted_data['ucdlib-awards--supporter-applicant']) ) {
        return "Submission failed! Could not determine the applicant.";
      }
      $applicantIds = $user->cycleMetaItem( 'supporterApplicant', $activeCycle->cycleId );
      if ( empty($applicantIds) ) {
        return 'You are not a registered supporter for this application cycle.';
      }
      if ( !in_array( $submitted_data['ucdlib-awards--supporter-applicant'], $applicantIds ) ) {
        return 'You are not a registered supporter for this applicant.';
      }
      $inApplicantList = false;
      $applicants = $activeCycle->allApplicants();
      foreach ( $applicants as $applicant ){
        if ( $applicant->record()->user_id == $submitted_data['ucdlib-awards--supporter-applicant'] ){
          $inApplicantList = true;
          break;
        }
      }
      if ( !$inApplicantList ) {
        return 'The applicant you selected is not in the list of applicants for this cycle.';
      }
    }

    return true;
  }

  public function add_entry_fields( $submitted_data, $form_entry_fields = array(), $entry = null ) {
    $formId = $this->module_id;
    $out = [];

    // check form is for application or support letter
    $isApplicationForm = $formId == $this->plugin->forms->applicationFormId();
    $isSupportForm = $formId == $this->plugin->forms->supportFormId();
    if ( !$isApplicationForm && !$isSupportForm ) return $out;

    $user = $this->plugin->users->currentUser();
    $cycle = $this->plugin->cycles->activeCycle();
    if ( !$user->id || !$cycle ) return $out;

    if ( $isApplicationForm ){
      $out[] = [
        'name' => 'applicant_id',
        'value' => $user->id
      ];
      $out[] = [
        'name' => 'cycle_id',
        'value' => $cycle->cycleId
      ];
      $out[] = [
        'name' => 'is_application',
        'value' => $cycle->cycleId
      ];

      // save category value if applicable
      // since forminator only saves the label...
      if (
        !empty($cycle->record()->has_categories) &&
        !empty($cycle->record()->category_form_slug) &&
        !empty($submitted_data[$cycle->record()->category_form_slug])
        ){
        $category = $submitted_data[$cycle->record()->category_form_slug];
        if ( is_array($category) ) $category = $category[0];
        $out[] = [
          'name' => 'category',
          'value' => $category
        ];
      }

      // if letters of support is enabled, add supporter(s) to award user list
      if ( $cycle->supportIsEnabled() ){
        $supporterEmailsFromForm = [];
        foreach ($cycle->supporterFields() as $fields) {
          if ( empty($fields['email']) || empty($submitted_data[$fields['email']]) ) continue;
          $email = $submitted_data[$fields['email']];
          if (in_array( $email, $supporterEmailsFromForm )) continue;
          $supporterEmailsFromForm[] = $email;

          $supporter = $this->plugin->users->getByEmail($email);
          if ( empty($supporter) ) {
            $phUsername = 'ph_' . explode('@', $email)[0];
            $firstName = isset($submitted_data[$fields['firstName']]) ? $submitted_data[$fields['firstName']] : '';
            $lastName = isset($submitted_data[$fields['lastName']]) ? $submitted_data[$fields['lastName']] : '';
            $supporter = $this->plugin->users->getByUsername($phUsername);
            $supporter->create([
              'email' => $email,
              'first_name' => $firstName,
              'last_name' => $lastName
            ]);
          }
          $supporter->updateMetaWithValue('supporterApplicant', $user->id, $cycle->cycleId);
          $this->plugin->email->sendSupportRequestEmail( $cycle->cycleId, $supporter->record()->user_id, $user->id );
        }
      }

      $user->updateMeta( 'hasSubmittedApplication', true, $cycle->cycleId );
      $this->plugin->logs->logApplicationSubmit( $cycle->cycleId, $user->id );
      $this->plugin->email->sendAdminApplicationSubmittedEmail( $cycle->cycleId, $user->id );
      $this->plugin->email->sendApplicantConfirmationEmail( $cycle->cycleId, $user->id );
    } else if ( $isSupportForm && !empty($submitted_data['ucdlib-awards--supporter-applicant']) ){
      $applicantId = $submitted_data['ucdlib-awards--supporter-applicant'];
      $out[] = [
        'name' => 'supporter_id',
        'value' => $user->id
      ];
      $out[] = [
        'name' => 'applicant_id',
        'value' => $applicantId
      ];
      $out[] = [
        'name' => 'cycle_id',
        'value' => $cycle->cycleId
      ];


      $user->updateNameFromWpAccount();
      $user->updateMetaWithValue('supporterApplicantSubmitted', $applicantId, $cycle->cycleId);
      $this->plugin->logs->logApplicationSupportSubmit( $cycle->cycleId, $applicantId, $user->id );
      $this->plugin->email->sendAdminSupportSubmittedEmail( $cycle->cycleId, $applicantId, $user->id );
    }


    return $out;
  }
}
