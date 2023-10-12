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
    if ( empty($entry->entry_id) ) return false;
    return $entry;
  }

  public function getEntries( $formId ){
    if ( !$this->forminatorActivated ) return [];
    $entries = Forminator_API::get_entries( $formId );
    if ( is_wp_error($entries) ) return [];
    return $entries;
  }

  public function getFormFields($formId){
    if ( !$this->forminatorActivated ) return [];
    $fields = Forminator_API::get_form_wrappers($formId);
    if ( is_wp_error($fields) ) return [];
    return $fields;
  }

  public function deleteEntriesByApplicantId($formId, $applicantIds){
    if ( !$this->forminatorActivated ) return false;
    $applicantIds = is_array($applicantIds) ? $applicantIds : [$applicantIds];
    $applicantIds = array_map(function($id){
      return (string) $id;
    }, $applicantIds);

    $entries = $this->getEntries($formId);
    if ( empty($entries) ) return false;
    foreach( $entries as $entry ){
      $applicantId = $entry->get_meta('forminator_addon_ucdlib-awards_applicant_id');
      $applicantId = (string) $applicantId;
      if ( in_array($applicantId, $applicantIds) ){
        $entry->delete();
      }
    }
  }

  public function exportEntry($entry){
    if ( !$this->forminatorActivated ) return [];
    if ( !is_object($entry) || get_class($entry) !== 'Forminator_Form_Entry_Model' ) return [];
    $formModel = Forminator_Base_Form_Model::get_model( $entry->form_id );
    if ( ! is_object( $formModel ) ) {
      return [];
    }
    // get form mappers aka fields
    $mappers = $this->get_custom_form_export_mappers( $formModel );

    // combine fields with entry values
    $data = [];
    foreach ( $mappers as $mapper ) {
      // its from model's property.
      if ( isset( $mapper['property'] ) ) {
        if ( property_exists( $entry, $mapper['property'] ) ) {
          $property = $mapper['property'];
          $mapper['value'] = (string) $entry->$property;
        } else {
          $mapper['value'] = '';
        }
        $data[] = $mapper;
      } else {
        $data = self::add_meta_value( $data, $mapper, $entry );
      }
    }
    return $data;
    return 'steve is great';

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

  private function get_custom_form_export_mappers( $model ) {
		/** @var  Forminator_Form_Model $model */
		$fields = $model->get_grouped_real_fields();

		$field_mappers = self::get_mappers( $fields, $model );
		$mappers       = array_merge(
			array(
				array(
					// read form model's property.
					'property' => 'time_created', // must be on export.
					'label'    => esc_html__( 'Submission Time', 'forminator' ),
					'type'     => 'entry_time_created',
				),
			),
			$field_mappers
		);

		return $mappers;
	}

  // stolen from forminator class-export.php
	private static function get_mappers( $fields, $model, $group_field = null ) {
		$mappers        = array();
		foreach ( $fields as $field ) {
			$field_type = $field->__get( 'type' );

			// base mapper for every field.
			$mapper             = array();
			$mapper['meta_key'] = $field->slug;
			$mapper['label']    = $field->get_label_for_entry();
			$mapper['type']     = $field_type;

			if ( $group_field ) {
				$mapper['label'] = $group_field->get_label_for_entry() . ' - ' . $mapper['label'];
			}

			// fields that should be displayed as multi column (sub_metas).
			if ( 'name' === $field_type ) {
				$is_multiple_name = filter_var( $field->__get( 'multiple_name' ), FILTER_VALIDATE_BOOLEAN );
				if ( $is_multiple_name ) {
					$prefix_enabled      = filter_var( $field->__get( 'prefix' ), FILTER_VALIDATE_BOOLEAN );
					$first_name_enabled  = filter_var( $field->__get( 'fname' ), FILTER_VALIDATE_BOOLEAN );
					$middle_name_enabled = filter_var( $field->__get( 'mname' ), FILTER_VALIDATE_BOOLEAN );
					$last_name_enabled   = filter_var( $field->__get( 'lname' ), FILTER_VALIDATE_BOOLEAN );
					// at least one sub field enabled.
					if ( $prefix_enabled || $first_name_enabled || $middle_name_enabled || $last_name_enabled ) {
						// sub metas.
						$mapper['sub_metas'] = array();
						if ( $prefix_enabled ) {
							$default_label         = Forminator_Form_Entry_Model::translate_suffix( 'prefix' );
							$label                 = $field->__get( 'prefix_label' );
							$mapper['sub_metas'][] = array(
								'key'   => 'prefix',
								'label' => $mapper['label'] . ' - ' . ( $label ? $label : $default_label ),
							);
						}

						if ( $first_name_enabled ) {
							$default_label         = Forminator_Form_Entry_Model::translate_suffix( 'first-name' );
							$label                 = $field->__get( 'fname_label' );
							$mapper['sub_metas'][] = array(
								'key'   => 'first-name',
								'label' => $mapper['label'] . ' - ' . ( $label ? $label : $default_label ),
							);
						}

						if ( $middle_name_enabled ) {
							$default_label         = Forminator_Form_Entry_Model::translate_suffix( 'middle-name' );
							$label                 = $field->__get( 'mname_label' );
							$mapper['sub_metas'][] = array(
								'key'   => 'middle-name',
								'label' => $mapper['label'] . ' - ' . ( $label ? $label : $default_label ),
							);
						}
						if ( $last_name_enabled ) {
							$default_label         = Forminator_Form_Entry_Model::translate_suffix( 'last-name' );
							$label                 = $field->__get( 'lname_label' );
							$mapper['sub_metas'][] = array(
								'key'   => 'last-name',
								'label' => $mapper['label'] . ' - ' . ( $label ? $label : $default_label ),
							);
						}
					} else {
						// if no subfield enabled when multiple name remove mapper (means dont show it on export).
						$mapper = array();
					}
				}
			} elseif ( 'address' === $field_type ) {
				$street_enabled  = filter_var( $field->__get( 'street_address' ), FILTER_VALIDATE_BOOLEAN );
				$line_enabled    = filter_var( $field->__get( 'address_line' ), FILTER_VALIDATE_BOOLEAN );
				$city_enabled    = filter_var( $field->__get( 'address_city' ), FILTER_VALIDATE_BOOLEAN );
				$state_enabled   = filter_var( $field->__get( 'address_state' ), FILTER_VALIDATE_BOOLEAN );
				$zip_enabled     = filter_var( $field->__get( 'address_zip' ), FILTER_VALIDATE_BOOLEAN );
				$country_enabled = filter_var( $field->__get( 'address_country' ), FILTER_VALIDATE_BOOLEAN );
				if ( $street_enabled || $line_enabled || $city_enabled || $state_enabled || $zip_enabled || $country_enabled ) {
					$mapper['sub_metas'] = array();
					if ( $street_enabled ) {
						$default_label         = Forminator_Form_Entry_Model::translate_suffix( 'street_address' );
						$label                 = $field->__get( 'street_address_label' );
						$mapper['sub_metas'][] = array(
							'key'   => 'street_address',
							'label' => $mapper['label'] . ' - ' . ( $label ? $label : $default_label ),
						);
					}
					if ( $line_enabled ) {
						$default_label         = Forminator_Form_Entry_Model::translate_suffix( 'address_line' );
						$label                 = $field->__get( 'address_line_label' );
						$mapper['sub_metas'][] = array(
							'key'   => 'address_line',
							'label' => $mapper['label'] . ' - ' . ( $label ? $label : $default_label ),
						);
					}
					if ( $city_enabled ) {
						$default_label         = Forminator_Form_Entry_Model::translate_suffix( 'city' );
						$label                 = $field->__get( 'address_city_label' );
						$mapper['sub_metas'][] = array(
							'key'   => 'city',
							'label' => $mapper['label'] . ' - ' . ( $label ? $label : $default_label ),
						);
					}
					if ( $state_enabled ) {
						$default_label         = Forminator_Form_Entry_Model::translate_suffix( 'state' );
						$label                 = $field->__get( 'address_state_label' );
						$mapper['sub_metas'][] = array(
							'key'   => 'state',
							'label' => $mapper['label'] . ' - ' . ( $label ? $label : $default_label ),
						);
					}
					if ( $zip_enabled ) {
						$default_label         = Forminator_Form_Entry_Model::translate_suffix( 'zip' );
						$label                 = $field->__get( 'address_zip_label' );
						$mapper['sub_metas'][] = array(
							'key'   => 'zip',
							'label' => $mapper['label'] . ' - ' . ( $label ? $label : $default_label ),
						);
					}
					if ( $country_enabled ) {
						$default_label         = Forminator_Form_Entry_Model::translate_suffix( 'country' );
						$label                 = $field->__get( 'address_country_label' );
						$mapper['sub_metas'][] = array(
							'key'   => 'country',
							'label' => $mapper['label'] . ' - ' . ( $label ? $label : $default_label ),
						);
					}
				} else {
					// if no subfield enabled when multiple name remove mapper (means dont show it on export).
					$mapper = array();
				}
			} elseif ( 'stripe' === $field_type || 'paypal' === $field_type ) {
				$mapper['sub_metas']   = array();
				$mapper['sub_metas'][] = array(
					'key'   => 'mode',
					'label' => $mapper['label'] . ' - ' . esc_html__( 'Mode', 'forminator' ),
				);
				$mapper['sub_metas'][] = array(
					'key'   => 'product_name',
					'label' => $mapper['label'] . ' - ' . esc_html__( 'Product / Plan Name', 'forminator' ),
				);
				$mapper['sub_metas'][] = array(
					'key'   => 'payment_type',
					'label' => $mapper['label'] . ' - ' . esc_html__( 'Payment type', 'forminator' ),
				);
				$mapper['sub_metas'][] = array(
					'key'   => 'amount',
					'label' => $mapper['label'] . ' - ' . esc_html__( 'Amount', 'forminator' ),
				);
				$mapper['sub_metas'][] = array(
					'key'   => 'currency',
					'label' => $mapper['label'] . ' - ' . esc_html__( 'Currency', 'forminator' ),
				);
				$mapper['sub_metas'][] = array(
					'key'   => 'quantity',
					'label' => $mapper['label'] . ' - ' . esc_html__( 'Quantity', 'forminator' ),
				);
				$mapper['sub_metas'][] = array(
					'key'   => 'transaction_id',
					'label' => $mapper['label'] . ' - ' . esc_html__( 'Transaction ID', 'forminator' ),
				);
				$mapper['sub_metas'][] = array(
					'key'   => 'status',
					'label' => $mapper['label'] . ' - ' . esc_html__( 'Status', 'forminator' ),
				);
				$mapper['sub_metas'][] = array(
					'key'   => 'subscription_id',
					'label' => $mapper['label'] . ' - ' . esc_html__( 'Manage', 'forminator' ),
				);
			} elseif ( 'group' === $field_type ) {
				$group_fields  = $model->get_grouped_real_fields( $field->slug );
				$group_mappers = self::get_mappers( $group_fields, $model, $field );
				$mappers       = array_merge( $mappers, $group_mappers );
				continue;
			}

			if ( ! empty( $mapper ) ) {
				$mappers[] = $mapper;
			}
		}

		return $mappers;
	}

	/**
	 * Add meta value - lifted from forminator class-export.php, with some slight mods
	 *
	 * @param array  $data Saved data.
	 * @param array  $mapper Mapper.
	 * @param object $entry Entry object.
	 * @return array Updated data.
	 */
	private static function add_meta_value( $data, $mapper, $entry ) {
		$copies = array_filter(
			$entry->meta_data,
			function( $key ) use ( $mapper ) {
				return strpos( $key, $mapper['meta_key'] . '-' ) === 0 || $mapper['meta_key'] === $key;
			},
			ARRAY_FILTER_USE_KEY
		);

		if ( ! $copies ) {
      $mapper['value'] = '';
			$data[] = $mapper;
			return $data;
		}

		foreach ( $copies as $slug => $copy ) {
			// meta_key based.
			$meta_value = $entry->get_meta( $slug, '' );

			if ( ! isset( $mapper['sub_metas'] ) ) {
        $mapper['value'] = Forminator_Form_Entry_Model::meta_value_to_string( $mapper['type'], $meta_value );
			} else {

				// sub_metas available.
				foreach ( $mapper['sub_metas'] as &$sub_meta ) {
					$sub_key = $sub_meta['key'];
					if ( ! empty( $meta_value[ $sub_key ] ) ) {
						$value = $meta_value[ $sub_key ];
						$field_type = $mapper['type'] . '.' . $sub_key;

						$sub_meta['value'] = Forminator_Form_Entry_Model::meta_value_to_string( $field_type, $value );
					} else {
						$sub_meta['value'] = '';
					}
				}
			}
		}

    $data[] = $mapper;

		return $data;
	}

}
