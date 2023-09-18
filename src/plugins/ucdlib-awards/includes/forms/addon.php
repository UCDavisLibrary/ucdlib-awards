<?php

final class UcdlibAwardsFormsAddon extends Forminator_Addon_Abstract {

	private static $_instance = null;

	protected $_slug                   = 'ucdlib-awards';
	protected $_version                = '1.0.0';
	protected $_min_forminator_version = '1.25';
	protected $_short_title            = 'ucdlib-awards';
	protected $_title                  = 'UC Davis Library Awards';
	protected $_url                    = 'https://library.ucdavis.edu';
	protected $_full_path              = __FILE__;
	protected $_icon                   = '';
	protected $_icon_x2                = '';
	protected $_image_x2               = '';

  protected $_form_hooks    = 'UcdlibAwardsFormsAddonHooks';

	public function __construct() {
		$this->_description = __( 'Integrations for the UC Davis Library Awards Platform. Activation handled automatically', 'forminator' );

		$this->_update_settings_error_message = __(
			'Sorry, we failed to update settings, please check your form and try again',
			'forminator'
		);

    $plugin = $GLOBALS['ucdlibAwards'];
    $this->_image = $plugin->assetsUrl() . '/images/book-logo.png';
    $this->_icon = $this->_image;
	}

	/**
	 * @return self|null
	 */
	public static function get_instance() {
		if ( is_null( self::$_instance ) ) {
			self::$_instance = new self();
		}

		return self::$_instance;
	}

	/**
	 * We don't need to check for settings, so we can just return true
	 *
	 * @return bool
	 */
	public function is_connected() {
		return true;
	}

	/**
	 * @description Checks if a form is associated with the active cycle
	 *
	 * @param $form_id
	 *
	 * @return bool
	 */
	public function is_form_connected( $form_id ) {
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
