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

    // Check that form is active
    $formWindowStatus = '';
    if ( $isApplicationForm ) {
      $formWindowStatus = $this->plugin->cycles->activeCycle()->applicationWindowStatus();
    } else if ( $isSupportForm ) {
      $formWindowStatus = $this->plugin->cycles->activeCycle()->supportWindowStatus();
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
    // TODO

    // ensure that user is in our users table and set isApplicant meta for cycle

    return true;
  }
}
