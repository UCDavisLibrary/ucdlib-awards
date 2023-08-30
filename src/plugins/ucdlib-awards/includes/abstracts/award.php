<?php

/**
 * @description Abstract class for a single award.
 * Sometimes an award will need some custom functionality beyond what is provided by the platform GUI.
 * The award plugin should extend this class.
 */
class UcdlibAwardsAwardAbstract {

  /**
   * @description Unique identifier for the award.
   */
  protected $_slug = 'ucdlib_award';

  /**
   * @description The title of the award.
   */
	protected $_title = "UC Davis Library Award";


  final public function get_slug() {
		return $this->_slug;
	}

  final public function get_title() {
		return $this->_title;
	}

}
