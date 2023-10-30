<?php

/**
 * @description Main module for controlling functionality of Awards Forms
 */
class UcdlibAwardsFormsMain {

  public static $formBlockName = 'forminator/forms';

  public function __construct( $plugin ) {
    $this->plugin = $plugin;
    add_action( 'forminator_addons_loaded', [$this, 'registerAddon'] );
    add_filter( 'forminator_form_notifications', [$this, 'removeDefaultEmailNotification'], 10, 4 );
    add_action( 'the_post', [$this, 'forceLoginForActivatedForms'], 9 );

    // properties for tracking if we're on a page with an active awards form
    $this->isApplicationForm = false;
    $this->isSupportForm = false;
    $this->formId = 0;
  }

  /**
   * @description Register the addon with Forminator, which allows us to hook onto form events such as submission.
   */
  public function registerAddon(){
    require_once dirname( __FILE__ ) . '/addon.php';
    require_once dirname( __FILE__ ) . '/addon-hooks.php';
    if ( class_exists( 'Forminator_Addon_Loader' ) ) {
      Forminator_Addon_Loader::get_instance()->register( 'UcdlibAwardsFormsAddon' );
    }
  }

  /**
   * @description Get config data for the active awards form
   * Will be passed to the public JS bundle
   */
  public function getAwardFormConfig(){
    $out = [
      'isApplicationForm' => $this->isApplicationForm,
      'isSupportForm' => $this->isSupportForm,
      'formId' => $this->formId
    ];
    $activeCycle = $this->plugin->cycles->activeCycle();

    $formWindowStatus = '';
    $formWindowStart = '';
    $formWindowEnd = '';
    if ( $this->isApplicationForm ) {
      $formWindowStatus = $activeCycle->applicationWindowStatus();
      $formWindowStart = $activeCycle->record()->application_start;
      $formWindowEnd = $activeCycle->record()->application_end;
    } else if ( $this->isSupportForm ) {
      $formWindowStatus = $activeCycle->supportWindowStatus();
      $formWindowStart = $activeCycle->record()->support_start;
      $formWindowEnd = $activeCycle->record()->support_end;
    }
    $out['formWindowStatus'] = $formWindowStatus;
    $out['formWindowStart'] = $formWindowStart;
    $out['formWindowEnd'] = $formWindowEnd;

    $user = $this->plugin->users->currentUser();
    $previousEntry = false;
    if ( $this->isApplicationForm ) {
      $previousEntry = $user->applicationEntry( $activeCycle->cycleId );
    }
    $out['previousEntry'] = $previousEntry;

    $supporterApplicants = [];
    if ( $this->isSupportForm ){
      $applicantIds = $user->cycleMetaItem( 'supporterApplicant', $activeCycle->cycleId );
      if ( !empty($applicantIds) ){
        foreach ( $this->plugin->users->getByUserIds($applicantIds) as $applicant ){
          $supporterApplicants[] = [
            'id' => $applicant->record()->user_id,
            'name' => $applicant->name()
          ];
        }
      }
    }
    $out['supporterApplicants'] = $supporterApplicants;

    return $out;
  }

  /**
   * @description Force login if a post contains activated forms (application and support letters)
   */
  public function forceLoginForActivatedForms(){
    if ( $this->isApplicationForm || $this->isSupportForm ) return;
    if ( is_admin() ) return;
    if ( !has_block( self::$formBlockName ) ) return;

    global $post;
    $blocks = parse_blocks( $post->post_content );
    foreach ( $blocks as $block ) {
      if ( $block['blockName'] !== self::$formBlockName ) continue;
      if ( !isset($block['attrs']['module_id']) ) continue;
      $formId = $block['attrs']['module_id'];
      $this->isApplicationForm = $formId == $this->plugin->forms->applicationFormId();
      $this->isSupportForm = $formId == $this->plugin->forms->supportFormId();
      if ( $this->isApplicationForm || $this->isSupportForm ) {
        $this->formId = $formId;
        break;
      }
    }
    if ( !$this->isApplicationForm && !$this->isSupportForm ) return;
    if ( is_user_logged_in() ) return;
    wp_redirect( wp_login_url( get_permalink() ) );
    exit;
  }

  /**
   * @description By default, on form creation, Forminator will send an email to the site admin.
   * We don't want that, so we remove it here.
   */
  public function removeDefaultEmailNotification( $notifications, $model, $data, $cls ){
    if ( ! empty( $notifications ) && empty( $model->fields ) ) {
      foreach ( $notifications as $key => $value ) {
        if ( 'notification-1234-4567' == $value['slug'] ) {
        unset( $notifications[ $key ] );
        }
      }
    }
    return $notifications;
  }
}
