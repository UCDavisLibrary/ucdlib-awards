<?php

/**
 * @description Wrapper class for select methods from the Forminator API.
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
        'title' => $form->settings['form_name']
      ];
    }
    if ( $returnSingle ) return $basicForms[0];
    return $basicForms;
  }

}
