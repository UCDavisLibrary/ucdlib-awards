<?php

/**
 * @description Wrapper class for select methods from the Forminator API among other things.
 */
class UcdlibAwardsForms {

  public function __construct( $plugin ){
    $this->plugin = $plugin;

    $this->forminatorActivated = class_exists( 'Forminator_API' );
  }

  public function getForms($form_ids=null, $current_page=1, $per_page=10 ){
    if ( !$this->forminatorActivated ) return [];
    $forms = Forminator_API::get_forms($form_ids, $current_page, $per_page);
    return $forms;
  }

  public function getEntry($formId, $entryId){
    if ( !$this->forminatorActivated ) return false;
    $entry = Forminator_API::get_entry($formId, $entryId);
    return $entry;
  }

  public function getFormFields($formId){
    if ( !$this->forminatorActivated ) return [];
    $fields = Forminator_API::get_form_wrappers($formId);
    if ( is_wp_error($fields) ) return [];
    return $fields;
  }

  public function toBasicArray($forms){
    if ( is_array($forms) ) {
      $returnSingle = false;
    } else {
      $forms = [$forms];
      $returnSingle = true;
    }
    foreach( $forms as $form ){
      $basicForms[] = [
        'id' => $form->id,
        'title' => $form->settings['formName']
      ];
    }
    if ( $returnSingle ) return $basicForms[0];
    return $basicForms;
  }

  protected $applicationFormId;
  public function applicationFormId(){
    if ( !empty( $this->applicationFormId ) ) return $this->applicationFormId;
    $activeCycle = $this->plugin->cycles->activeCycle();
    if ( !$activeCycle ) return false;
    $this->applicationFormId = $activeCycle->applicationFormId();
    return $this->applicationFormId;
  }

  protected $applicationForm;
  public function applicationForm(){
    if ( !empty( $this->applicationForm ) ) return $this->applicationForm;
    $formId = $this->applicationFormId();
    if ( !$formId ) return false;
    $forms = $this->getForms( $formId );
    if ( empty($forms) ) return false;
    $this->applicationForm = $forms[0];
    return $this->applicationForm;
  }

  protected $supportFormId;
  public function supportFormId(){
    if ( !empty( $this->supportFormId ) ) return $this->supportFormId;
    $activeCycle = $this->plugin->cycles->activeCycle();
    if ( !$activeCycle ) return false;
    $this->supportFormId = $activeCycle->supportFormId();
    return $this->supportFormId;
  }

  protected $supportForm;
  public function supportForm(){
    if ( !empty( $this->supportForm ) ) return $this->supportForm;
    $formId = $this->supportFormId();
    if ( !$formId ) return false;
    $forms = $this->getForms( $formId );
    if ( empty($forms) ) return false;
    $this->supportForm = $forms[0];
    return $this->supportForm;
  }

}
