<?php

class UcdlibAwardsConfig {

  public static $pluginVersion = '1.0.0';

  public static $pluginSlug = 'ucdlib-awards';
  public static $pluginHookSlug = 'ucdlib_awards';
  public static $twigNamespace = 'ucdlib-awards';
  public static $adminJsSlug = 'ucdlib-awards';
  public static $publicJsSlug = 'ucdlib-awards';
  public static $optionsSlug = 'ucdlib_awards';

  public static $ajaxActions = [
    'adminGeneral' => 'ucdlib_awards_admin_general',
    'adminDashboard' => 'ucdlib_awards_admin_dashboard',
    'adminCycles' => 'ucdlib_awards_admin_cycles',
    'adminLogs' => 'ucdlib_awards_admin_logs',
    'adminApplicants' => 'ucdlib_awards_admin_applicants',
    'adminRubric' => 'ucdlib_awards_admin_rubric',
    'adminJudges' => 'ucdlib_awards_admin_judges',
    'evaluation' => 'ucdlib_awards_evaluation',
    'adminEvaluation' => 'ucdlib_awards_admin_evaluation',
    'adminEmail' => 'ucdlib_awards_admin_email',
    'adminSupporters' => 'ucdlib_awards_admin_supporters',
  ];

  public static $urlQueryParams = [
    'cycle' => 'cycle'
  ];

  public static $forminatorSlugs = [
    'forms' => 'forminator-cform'
  ];

  public static $assignedJudgesProps = [
    ['meta_key' => 'assignedApplicant', 'outKey' => 'assigned'],
    ['meta_key' => 'conflictOfInterestApplicant', 'outKey' => 'conflictOfInterest'],
    ['meta_key' => 'evaluationInProgressApplicant', 'outKey' => 'evaluationInProgress'],
    ['meta_key' => 'evaluatedApplicant', 'outKey' => 'evaluated']
  ];

  public static $supporterProps = [
    ['meta_key' => 'supporterApplicant', 'outKey' => 'registered'],
    ['meta_key' => 'supporterApplicantSubmitted', 'outKey' => 'submitted']
  ];

  public function __construct(){
    $this->setBuildEnvVars();
  }

  /**
   * @description Get App env (dev or prod) - determines what assets to load
   */
  protected $appEnv;
  public function appEnv(){
    if ( !empty( $this->appEnv ) ){
      return $this->appEnv;
    }
    $this->appEnv = getenv('APP_ENV') ?: 'prod';
    return $this->appEnv;
  }

  protected $buildTime;
  public function buildTime(){
    if ( !empty( $this->buildTime ) ){
      return $this->buildTime;
    }
    $this->buildTime = getenv('BUILD_TIME');
    return $this->buildTime;
  }

  /**
   * @description Get App version - Set in config.sh and set as env in dockerfile
   */
  protected $appVersion;
  public function appVersion(){
    if ( !empty( $this->appVersion ) ){
      return $this->appVersion;
    }
    $this->appVersion = getenv('APP_VERSION');
    return $this->appVersion;
  }

  protected $loggerConfig;
  public function loggerConfig(){
    if ( !empty( $this->loggerConfig ) ){
      return $this->loggerConfig;
    }
    $appName = apply_filters('ucdlib_awards_log_app_name', 'ucdlib-awards');
    $this->loggerConfig = [
      'logLevel' => $this->getEnv('APP_LOGGER_LOG_LEVEL', 'info'),
      'logLevels' => new stdClass(),
      'disableCallerInfo' => $this->getEnv('APP_LOGGER_DISABLE_CALLER_INFO', false),
      'reportErrors' => [
        'enabled' => $this->getEnv('APP_REPORT_ERRORS_ENABLED', false),
        'url' => $this->getEnv('APP_REPORT_ERRORS_URL', ''),
        'method' => $this->getEnv('APP_REPORT_ERRORS_METHOD', 'POST'),
        'key' => $this->getEnv('APP_REPORT_ERRORS_KEY', ''),
        'headers' => new stdClass(),
        'sourceMapExtension' => $this->getEnv('APP_REPORT_ERRORS_SOURCE_MAP_EXTENSION', '.map'),
        'customAttributes' => ['appOwner' => 'itis', 'appName' => $appName]
      ]
    ];
    return $this->loggerConfig;
  }

  public function getEnv($key, $default = false){
    $v = getenv($key);
    if ( $v === false ){
      return $default;
    }
    if ( $v === 'true' ){
      return true;
    }
    if ( $v === 'false' ){
      return false;
    }
    return $v;
  }

 // sets the build environment variables from cork-build-info
 public function setBuildEnvVars(){
  $mainBuildInfo = $this->readBuildInfo('ucdlib-awards.json');
  if ( $mainBuildInfo ) {
    $appVersion = $this->getBuildVersion($mainBuildInfo);
    if ( $appVersion ) {
      putenv('APP_VERSION=' . $appVersion);
    }
    if ( !empty($mainBuildInfo['date']) ) {
      putenv('BUILD_TIME=' . $mainBuildInfo['date']);
    }
  }
}

// reads build info from a cork-build-info file
public function readBuildInfo($filename) {
  $filePath = '/cork-build-info/' . $filename;
  if (!file_exists($filePath)) {
    return null;
  }
  $jsonContent = file_get_contents($filePath);
  return json_decode($jsonContent, true);
}

public function getBuildVersion($buildInfo){
  if ( !empty($buildInfo['tag']) ) {
    return $buildInfo['tag'];
  } else if ( !empty($buildInfo['branch']) ) {
    return $buildInfo['branch'];
  } else if ( !empty($buildInfo['imageTag']) ) {
    $imageTag = explode(':', $buildInfo['imageTag']);
    return end($imageTag);
  }
  return null;
}

  /**
   * @description Get App bundle version - Breaks browser cache when app version changes, or in local dev
   */
  protected $bundleVersion;
  public function bundleVersion(){
    if ( !empty($this->bundleVersion) ) {
      return $this->bundleVersion;
    }
    $bundleVersion = (new DateTime())->getTimestamp();
    if ( $this->appEnv() === 'prod' && $this->buildTime() ){
      $bundleVersion = $this->buildTime();
    }

    $this->bundleVersion = $bundleVersion;
    return $bundleVersion;
  }

}
