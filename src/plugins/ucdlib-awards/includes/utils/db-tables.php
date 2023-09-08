<?php

if ( ! defined( 'ABSPATH' ) ) {
	die();
}

/**
 * @desciption Class for custom database tables.
 */
class UcdlibAwardsDbTables {

  CONST TABLE_PREFIX = 'ucda_';

  /**
	 * Table name keys
	*/
	const LOGS = 'logs';
	const SCORES = 'scores';
	const RUBRIC_ITEMS = 'rubric_items';
	const USERS = 'users';
  const CYCLES = 'cycles';
  const USER_META = 'user_meta';

	private static $tables = [];

/**
 * @description Get all table names
 */
	private static function table_names( $db = false ) {
		if ( ! $db ) {
			global $wpdb;
			$db = $wpdb;
		}

		return [
			self::LOGS         => $db->prefix . self::TABLE_PREFIX . 'logs',
      self::SCORES       => $db->prefix . self::TABLE_PREFIX . 'scores',
      self::RUBRIC_ITEMS => $db->prefix . self::TABLE_PREFIX . 'rubric_items',
      self::USERS        => $db->prefix . self::TABLE_PREFIX . 'users',
      self::CYCLES       => $db->prefix . self::TABLE_PREFIX . 'cycles',
      self::USER_META    => $db->prefix . self::TABLE_PREFIX . 'user_meta'
    ];
	}

/**
 * @description Get table name using class property key
 */
	public static function get_table_name( $name ) {
		if ( empty( self::$tables ) ) {
			self::$tables = self::table_names();
		}

		return isset( self::$tables[ $name ] ) ? self::$tables[ $name ] : false;
	}

  public static function get_table_column_labels( $table ) {
    $labels = [
      self::CYCLES => [
        'cycle_id' => 'Cycle ID',
        'title' => 'Cycle Title',
        'application_start' => 'Application Start Date',
        'application_end' => 'Application End Date',
        'evaluation_start' => 'Evaluation Start Date',
        'evaluation_end' => 'Evaluation End Date',
        'support_start' => 'Support Start Date',
        'support_end' => 'Support End Date',
        'has_support' => 'Support Letters Enabled',
        'is_active' => 'Cycle Is Active',
        'application_form_id' => 'Application Form',
        'support_form_id' => 'Support Letters Form',
        'cycle_meta' => 'Cycle Meta',
        'date_created' => 'Date Created',
        'date_updated' => 'Date Updated'
      ]
      ];

    return isset( $labels[ $table ] ) ? $labels[ $table ] : false;
  }

  /**
   * @description Install database tables - Should be run on plugin activation
   */
	public static function install_database_tables() {
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		global $wpdb;

		$wpdb->hide_errors();

		$charset_collate  = $wpdb->get_charset_collate();
    $max_index_length = 191;

    /**
     * Logs table
     * Not integral to the plugin, but useful for debugging
     * Data can be deleted at any time
     */
    $table_name = self::get_table_name( self::LOGS );
    $sql = "CREATE TABLE {$table_name} (
      `log_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
      `log_type` VARCHAR(191) NOT NULL,
      `log_subtype` VARCHAR(191) NOT NULL,
      `log_value` LONGTEXT NULL,
      `cycle_id` bigint(20) unsigned NOT NULL DEFAULT 0,
      `date_created` datetime NOT NULL default '0000-00-00 00:00:00',
      PRIMARY KEY (`log_id`),
      KEY `log_type` (`log_type`($max_index_length)),
      KEY `log_subtype` (`log_subtype`($max_index_length)),
      KEY `log_cycle_id` (`cycle_id`))
      $charset_collate;";
    dbDelta( $sql );

    /**
     * Scores table
     * Scores are on a per applicant/judge/rubric item basis
     * Judge and applicant id are foreign keys to the users table
     * Rubric id is a foreign key to the rubric items table
     */
    $table_name = self::get_table_name( self::SCORES );
    $sql = "CREATE TABLE {$table_name} (
      `score_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
      `judge_id` bigint(20) unsigned NOT NULL,
      `applicant_id` bigint(20) unsigned NOT NULL,
      `rubric_id` bigint(20) unsigned  NOT NULL DEFAULT 0,
      `score` int(11) unsigned NOT NULL,
      `note` LONGTEXT NULL,
      `date_created` datetime NOT NULL default '0000-00-00 00:00:00',
      `date_updated` datetime NOT NULL default '0000-00-00 00:00:00',
      PRIMARY KEY (`score_id`),
      KEY `score_judge_id` (`judge_id`),
      KEY `score_applicant_id` (`applicant_id`),
      KEY `score_rubric_id` (`rubric_id`))
      $charset_collate;";
    dbDelta( $sql );

    /**
     * Rubric items table
     * Rubric items are created by the admin and are used to score applications for a given cycle
     * Items are on a scale of 1-5 by default, but can be changed by the admin
     */
    $table_name = self::get_table_name( self::RUBRIC_ITEMS );
    $sql = "CREATE TABLE {$table_name} (
      `rubric_item_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
      `cycle_id` bigint(20) unsigned NOT NULL,
      `title` VARCHAR(200) NOT NULL,
      `description` LONGTEXT NULL,
      `range_min` int(11) unsigned NOT NULL DEFAULT 1,
      `range_max` int(11) unsigned NOT NULL DEFAULT 5,
      `range_step` int(11) unsigned NOT NULL DEFAULT 1,
      `weight` int(11) unsigned NOT NULL DEFAULT 1,
      `date_created` datetime NOT NULL default '0000-00-00 00:00:00',
      `date_updated` datetime NOT NULL default '0000-00-00 00:00:00',
      PRIMARY KEY (`rubric_item_id`),
      KEY `rubric_item_cycle_id` (`cycle_id`))
      $charset_collate;";
    dbDelta( $sql );

    /**
     * Users table
     * Might have been better to use the wp_users table, but I wanted to keep things separate
     * wp_user_login is a foreign key to the wp_users table, also it represents the user's kerberos id
     */
    $table_name = self::get_table_name( self::USERS );
    $sql = "CREATE TABLE {$table_name} (
      `user_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
      `first_name` VARCHAR(200) NOT NULL DEFAULT '',
      `last_name` VARCHAR(200) NOT NULL DEFAULT '',
      `wp_user_login` VARCHAR(60) NOT NULL,
      `email` VARCHAR(100) NOT NULL,
      `is_admin` TINYINT(1) NOT NULL DEFAULT 0,
      `date_created` datetime NOT NULL default '0000-00-00 00:00:00',
      `date_updated` datetime NOT NULL default '0000-00-00 00:00:00',
      PRIMARY KEY (`user_id`),
      UNIQUE (`wp_user_login`),
      KEY `user_wp_user_login` (`wp_user_login`(60)),
      KEY `user_email` (`email`(100)))
      $charset_collate;";
    dbDelta( $sql );

    /**
     * Application cycles table (usually corresponds to a given year)
     * Cycles are created by the admin and are used to group applications
     * Only one cycle can be active at a time
     */
    $table_name = self::get_table_name( self::CYCLES );
    $sql = "CREATE TABLE {$table_name} (
      `cycle_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
      `title` VARCHAR(200) NOT NULL DEFAULT '',
      `application_start` datetime NOT NULL default '0000-00-00 00:00:00',
      `application_end` datetime NOT NULL default '0000-00-00 00:00:00',
      `evaluation_start` datetime NOT NULL default '0000-00-00 00:00:00',
      `evaluation_end` datetime NOT NULL default '0000-00-00 00:00:00',
      `support_start` datetime NULL,
      `support_end` datetime NULL,
      `has_support` TINYINT(1) NOT NULL DEFAULT 0,
      `is_active` TINYINT(1) NOT NULL DEFAULT 0,
      `application_form_id` bigint(20) unsigned NOT NULL DEFAULT 0,
      `support_form_id` bigint(20) unsigned NOT NULL DEFAULT 0,
      `cycle_meta` LONGTEXT NULL,
      `date_created` datetime NOT NULL default '0000-00-00 00:00:00',
      `date_updated` datetime NOT NULL default '0000-00-00 00:00:00',
      PRIMARY KEY (`cycle_id`))
      $charset_collate;";
    dbDelta( $sql );

    /**
     * User meta table
     * Functions similar to the wp_usermeta table except it has a cycle_id column
     * Which is a foreign key to the cycles table
     */
    $table_name = self::get_table_name( self::USER_META );
    $sql = "CREATE TABLE {$table_name} (
      `meta_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
      `user_id` bigint(20) unsigned NOT NULL,
      `cycle_id` bigint(20) unsigned NOT NULL DEFAULT 0,
      `meta_key` VARCHAR(191) default NULL,
      `meta_value` LONGTEXT NULL,
      `date_created` datetime NOT NULL default '0000-00-00 00:00:00',
      `date_updated` datetime NOT NULL default '0000-00-00 00:00:00',
      PRIMARY KEY (`meta_id`),
      KEY `meta_key` (`meta_key`($max_index_length)),
      KEY `meta_user_id` (`user_id` ASC ),
      KEY `meta_cycle_id` (`cycle_id` ASC ),
      KEY `meta_key_object` (`user_id` ASC, `cycle_id` ASC, `meta_key` ASC))
      $charset_collate;";
    dbDelta( $sql );
  }

}
