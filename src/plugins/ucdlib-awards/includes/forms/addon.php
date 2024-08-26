<?php
final class Forminator_Integration_Ucdlibawards extends Forminator_Integration {

	protected static $instance = null;

	protected $_slug                   = 'ucdlibawards';
	protected $_version                = '1.0.0';
	protected $_min_forminator_version = '1.25';
	protected $_short_title            = 'ucdlibawards';
	protected $_title                  = 'UC Davis Library Awards';
	protected $_url                    = 'https://library.ucdavis.edu';

	public function __construct() {
		$this->_description = __( 'Integrations for the UC Davis Library Awards Platform. Activation handled automatically', 'forminator' );

		$this->_update_settings_error_message = __(
			'Sorry, we failed to update settings, please check your form and try again',
			'forminator'
		);
	}

  // public function addon_path() : string  {
  //   $plugin = $GLOBALS['ucdlibAwards'];
  //   return forminator_addon_rt_url();
  // }

  public function assets_path() : string {
    $plugin = $GLOBALS['ucdlibAwards'];
    return $plugin->assetsUrl() . '/forminator/';
  }

	/**
	 * We don't need to check for settings, so we can just return true
	 *
	 * @return bool
	 */
	public function is_connected() {
		return true;
	}

  public function is_authorized() {
		return true;
	}

	/**
	 * @description Checks if a form is associated with the active cycle
	 *
	 * @param $form_id
	 *
	 * @return bool
	 */
	public function is_module_connected( $module_id, $module_slug = 'form', $check_lead = false ) {
		$form_id = $module_id;
		$plugin = $GLOBALS['ucdlibAwards'];
		$applicationFormId = $plugin->forms->applicationFormId();
		if ( !empty($applicationFormId) && $form_id == $applicationFormId ) {
		return true;
		}
		$supportFormId = $plugin->forms->supportFormId();
		if ( !empty($supportFormId) && $form_id == $supportFormId ) {
		return true;
		}
		return false;
	}
}
