<?php

class UcdlibAwardsFormsAddonHooks extends Forminator_Addon_Form_Hooks_Abstract {

  public function __construct( Forminator_Addon_Abstract $addon, $form_id ) {
    parent::__construct( $addon, $form_id );
    $this->plugin = $GLOBALS['ucdlibAwards'];

    $this->_submit_form_error_message = __( 'Submission failed! Please try again later.', 'forminator' );
  }


  public function on_form_submit( $submitted_data ) {
    $formId = $this->form_id;

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

    // ensure user has not already submitted if an application form
    if ( $isApplicationForm && $user->applicationEntry( $activeCycle->cycleId ) ) {
      return "Submission failed! You have already submitted an application.";
    }

    // ensure that user is in our users table and set isApplicant meta for cycle
    $metaUpdateSuccess = $user->updateMeta( 'isApplicant', true, $activeCycle->cycleId );
    if ( !$metaUpdateSuccess ) {
      return "Submission failed! Could not update user meta.";
    }

    return true;
  }

  public function add_entry_fields( $submitted_data, $form_entry_fields = array(), $entry = null ) {
    $formId = $this->form_id;
    $out = [];

    // check form is for application or support letter
    $isApplicationForm = $formId == $this->plugin->forms->applicationFormId();
    $isSupportForm = $formId == $this->plugin->forms->supportFormId();
    if ( !$isApplicationForm && !$isSupportForm ) return $out;

    $user = $this->plugin->users->currentUser();
    $cycle = $this->plugin->cycles->activeCycle();
    if ( !$user->id || !$cycle ) return $out;
    $out[] = [
      'name' => 'applicant_id',
      'value' => $user->id
    ];
    $out[] = [
      'name' => 'cycle_id',
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

    $user->updateMeta( 'hasSubmittedApplication', true, $cycle->cycleId );
    $this->plugin->logs->logApplicationSubmit( $cycle->cycleId, $user->id );

    return $out;
  }
}
