<?php

/**
 * @description Model for a single awards/application cycle
 */
class UcdlibAwardsCycle {

  public $plugin;
  public $cycleId;

  /**
   * @param $cycle int|string|object - Can be cycle id or cycle db record
   */
  public function __construct( $cycle ){
    $this->plugin = $GLOBALS['ucdlibAwards'];
    $this->record = null;
    $this->cycleId = null;
    if ( is_int($cycle) ){
      $this->cycleId = $cycle;
    } elseif ( is_string($cycle) ) {
      $this->cycleId = $this->getCycleIdFromSlug( $cycle );
    } elseif ( is_object($cycle) ) {
      $this->record = $cycle;
      $this->cycleId = $this->record->cycle_id;
    }
  }

  public function update($data){
    if ( isset($data['cycle_id']) ) unset($data['cycle_id']);
    if ( isset($data['date_created']) ) unset($data['date_created']);

    $validColumns = array_keys(UcdlibAwardsDbTables::get_table_column_labels( UcdlibAwardsDbTables::CYCLES ));
    foreach( $data as $key => $value ){
      if ( !in_array($key, $validColumns) ){
        unset($data[$key]);
      }
    }

    if ( isset($data['cycle_meta']) ){
      if ( !is_string($data['cycle_meta']) ){
        $data['cycle_meta'] = json_encode( $data['cycle_meta'] );
      }
    }

    $data['date_updated'] = date('Y-m-d H:i:s');
    global $wpdb;
    $cyclesTable = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::CYCLES );
    $wpdb->update(
      $cyclesTable,
      $data,
      ['cycle_id' => $this->cycleId]
    );
    $this->clearCache();
  }

  public function delete(){
    global $wpdb;

    // delete cycle record
    $cyclesTable = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::CYCLES );
    $wpdb->delete(
      $cyclesTable,
      ['cycle_id' => $this->cycleId]
    );

    // delete logs
    $logsTable = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::LOGS );
    $wpdb->delete(
      $logsTable,
      ['cycle_id' => $this->cycleId]
    );

    // get rubric ids for cycle
    $rubricItemsTable = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::RUBRIC_ITEMS );
    $sql = "SELECT rubric_item_id FROM $rubricItemsTable WHERE cycle_id = %d";
    $rubricItemIds = $wpdb->get_col( $wpdb->prepare( $sql, $this->cycleId ) );

    // delete rubric items
    $wpdb->delete(
      $rubricItemsTable,
      ['cycle_id' => $this->cycleId]
    );

    // delete scores for cycle rubric items
    if ( count($rubricItemIds) ){
      $scoresTable = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::SCORES );
      $sql = "DELETE FROM $scoresTable WHERE rubric_id IN (" . implode(',', $rubricItemIds) . ")";
      $wpdb->query( $sql );
    }

    // delete user meta
    $userMetaTable = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::USER_META );
    $wpdb->delete(
      $userMetaTable,
      ['cycle_id' => $this->cycleId]
    );

    $this->clearCache();
  }

  public function clearCache(){
    $this->record = null;
    $this->isActive = null;
    $this->allApplicants = null;
    $this->applicantCount = null;
    $this->categories = null;
    $this->applicationWindowStatus = null;
    $this->evaluationWindowStatus = null;
    $this->supportWindowStatus = null;
    $this->applicationForm = null;
    $this->applicationEntries = null;
    $this->userMeta = null;
    $this->cycleMeta = null;
    $this->supportForm = null;
  }

  public function title(){
    $record = $this->record();
    return $record->title;
  }

  public function supportIsEnabled(){
    $record = $this->record();
    return $record->has_support ? true : false;
  }

  public function applicationFormId(){
    $record = $this->record();
    return $record->application_form_id;
  }

  public function supportFormId(){
    $record = $this->record();
    if ( !$record->has_support ) return false;
    return $record->support_form_id;
  }

  protected $supportForm;
  public function supportForm(){
    if ( isset($this->supportForm) ) return $this->supportForm;
    $formId = $this->supportFormId();
    if ( !$formId ) {
      $this->supportForm = false;
      return $this->supportForm;
    }
    $forms = $this->plugin->forms->getForms([ $formId ]);
    if ( empty($forms) ) {
      $this->supportForm = false;
      return $this->supportForm;
    }
    $this->supportForm = $forms[0];
    return $this->supportForm;
  }

  public function supporterFields(){
    $out = [];
    $meta = $this->cycleMeta();
    if ( isset($meta['supporterFields']) ){
      $out = $meta['supporterFields'];
    }
    return $out;
  }

  public function supportFormLink(){
    $out = '';
    $meta = $this->cycleMeta();
    if ( isset($meta['supportFormLink']) ){
      $out = $meta['supportFormLink'];
    }
    return $out;
  }

  public function getSupporterFieldSlugs($fieldType=null){
    if ( !$this->supportIsEnabled() ) return [];
    $out = [];
    foreach ($this->supporterFields() as $fields) {
      foreach ($fields as $key => $value) {
        if ( empty($fieldType) ){
          $out[] = $value;
        } else if ( $key == $fieldType ){
          $out[] = $value;
        }
      }
    }
    return $out;
  }

  protected $cycleMeta;
  public function cycleMeta(){
    if ( isset($this->cycleMeta) ) return $this->cycleMeta;
    $record = $this->record();
    if ( empty($record->cycle_meta) ) {
      $this->cycleMeta = [];
      return $this->cycleMeta;
    }
    $this->cycleMeta = json_decode( $record->cycle_meta, true );
    return $this->cycleMeta;
  }

  public function updateMeta($items){
    $cycleMeta = $this->cycleMeta();

    foreach ($items as $key => $value) {
      $cycleMeta[$key] = $value;
    }

    global $wpdb;
    $cyclesTable = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::CYCLES );
    $wpdb->update(
      $cyclesTable,
      ['cycle_meta' => json_encode($cycleMeta)],
      ['cycle_id' => $this->cycleId]
    );
    $this->record = null;
    $this->cycleMeta = null;
  }

  public function getEmailMeta( $byGroup=false ){
    return $this->plugin->email->getAllMeta( $this->cycleId, $byGroup );
  }

  public function updateEmailMeta( $meta ){
    $this->plugin->email->updateMeta( $this->cycleId, $meta );
  }

  public function applicationIsCompleted($applicantId, $judgeId){
    $evaluationMap = $this->completedEvaluationsMap();
    if ( !isset($evaluationMap[ $judgeId ]) ) return false;
    return in_array($applicantId, $evaluationMap[ $judgeId ]);
  }

  protected $scoresArray;
  public function scoresArray(){
    if ( isset($this->scoresArray) ) return $this->scoresArray;

    $rubricItemsWithScores = $this->rubric()->getAllScores(true);

    $out = [];
    foreach ( $rubricItemsWithScores as $rubricItem ) {
      foreach ( $rubricItem['scores'] as $score ) {
        if ( !$this->applicationIsCompleted($score->applicant_id, $score->judge_id) ) continue;
        $applicant = $this->getApplicantById( $score->applicant_id );
        $judge = $this->getJudgeById( $score->judge_id );
        if ( !$applicant || !$judge ) continue;
        $o = [
          'judge' => [
            'id' => $judge->record()->user_id,
            'name' => $judge->name()
          ],
          'applicant' => [
            'id' => $applicant->record()->user_id,
            'name' => $applicant->name()
          ],
          'rubricItem' => [
            'id' => $rubricItem['rubric_item']->rubric_item_id,
            'title' => $rubricItem['rubric_item']->title,
            'weight' => $rubricItem['rubric_item']->weight,
            'order' => $rubricItem['rubric_item']->item_order
          ],
          'score' => [
            'score' => $score->score,
            'note' => $score->note
          ]
        ];
        if ( $this->categories() ){
          $o['category'] = $applicant->applicationCategory($this->cycleId);
        } else {
          $o['category'] = null;
        }
        $out[] = $o;
      }
    }

    $this->scoresArray = $out;
    return $this->scoresArray;
  }

  protected $applicationSummary;
  public function applicationSummary(){
    if ( isset($this->applicationSummary) ) return $this->applicationSummary;

    $entriesByUserId = $this->getEntriesByApplicantId();
    $assignments = $this->judgeAssignmentMap(true);
    $evaluations = $this->completedEvaluationsMap(true);
    $applications = array_map(function($entry) use ($assignments, $evaluations){
      $categorySlug = !empty($entry->meta_data['forminator_addon_ucdlib-awards_category']['value']) ? $entry->meta_data['forminator_addon_ucdlib-awards_category']['value'] : '';
      $applicantId = $entry->meta_data['forminator_addon_ucdlib-awards_applicant_id']['value'];

      $assignedJudges = !empty($assignments[ $applicantId ]) ? $assignments[ $applicantId ] : [];
      $completedEvaluations = !empty($evaluations[ $applicantId ]) ? $evaluations[ $applicantId ] : [];
      $completedEvaluations = array_intersect($completedEvaluations, $assignedJudges);
      if ( empty($assignedJudges) ){
        $status = 'unassigned';
      } else {
        $status = count($completedEvaluations) . '/' . count($assignedJudges);
      }
      $applicant = [
        'id' => $applicantId,
        'categorySlug' => $categorySlug,
        'status' => $status,
        'evaluatedCt' => count($completedEvaluations)
      ];
      return $applicant;
    }, $entriesByUserId);

    // sort by evaluated count asc
    usort($applications, function($a, $b){
      return $a['evaluatedCt'] <=> $b['evaluatedCt'];
    });

    $out = [];

    // tally by category if categories exist
    $categories = $this->categories();
    if ( !empty($categories) ){
      foreach( $categories as $category ){
        $o = ['category' => $category, 'categorySlug' => $category['value'], 'statusCts' => ['unassigned' => 0]];

        foreach( $applications as $application ){
          if ( $application['categorySlug'] == $category['value'] ){
            if ( !isset($o['statusCts'][ $application['status'] ]) ){
              $o['statusCts'][ $application['status'] ] = 0;
            }
            $o['statusCts'][ $application['status'] ]++;
          }
        }
        $out[] = $o;
      }
    }
    $o = ['categorySlug' => 'total', 'category' => null, 'statusCts' => ['unassigned' => 0]];
    foreach( $applications as $application ){
      if ( !isset($o['statusCts'][ $application['status'] ]) ){
        $o['statusCts'][ $application['status'] ] = 0;
      }
      $o['statusCts'][ $application['status'] ]++;
    }
    $out[] = $o;

    foreach ($out as &$o) {
      $o['statusCtRows'] = [['slug' => 'unassigned', 'ct' => $o['statusCts']['unassigned'], 'label' => 'Unassigned']];
      foreach ($o['statusCts'] as $slug => $ct) {
        if ( $slug == 'unassigned' ) continue;
        $o['statusCtRows'][] = ['slug' => $slug, 'ct' => $ct, 'label' => 'Evaluated ' . $slug];
      }

    }

    $this->applicationSummary = $out;
    return $this->applicationSummary;
  }

  /**
   * @description returns current status of application window: 'active', 'upcoming', or 'past'
   */
  protected $applicationWindowStatus;
  public function applicationWindowStatus(){
    if ( !empty( $this->applicationWindowStatus ) ) return $this->applicationWindowStatus;
    $record = $this->record();
    if ( empty($record->application_start) || empty($record->application_end) ) return false;
    $this->applicationWindowStatus = $this->dateRangeStatus( $record->application_start, $record->application_end );
    return $this->applicationWindowStatus;
  }

  /**
   * @description returns current status of evaluation window: 'active', 'upcoming', or 'past'
   */
  protected $evaluationWindowStatus;
  public function evaluationWindowStatus(){
    if ( !empty( $this->evaluationWindowStatus ) ) return $this->evaluationWindowStatus;
    $record = $this->record();
    if ( empty($record->evaluation_start) || empty($record->evaluation_end) ) return false;
    $this->evaluationWindowStatus = $this->dateRangeStatus( $record->evaluation_start, $record->evaluation_end );
    return $this->evaluationWindowStatus;
  }

  /**
   * @description returns current status of support window: 'active', 'upcoming', or 'past'
   */
  protected $supportWindowStatus;
  public function supportWindowStatus(){
    if ( !empty( $this->supportWindowStatus ) ) return $this->supportWindowStatus;
    $record = $this->record();
    if ( !$this->supportIsEnabled() || empty($record->support_start) || empty($record->support_end) ) return false;
    $this->supportWindowStatus = $this->dateRangeStatus( $record->support_start, $record->support_end );
    return $this->supportWindowStatus;
  }

  private function dateRangeStatus($start, $end){
    $now = new DateTime( 'now', new DateTimeZone('America/Los_Angeles') );
    $applicationStart = new DateTime( $start, new DateTimeZone('America/Los_Angeles') );
    $applicationEnd = new DateTime( $end, new DateTimeZone('America/Los_Angeles') );
    if ( $now < $applicationStart ) {
      return 'upcoming';
    } elseif ( $now > $applicationEnd ) {
      return 'past';
    } else {
      return 'active';
    }
  }

  protected $applicationForm;
  public function applicationForm(){
    if ( isset($this->applicationForm) ) return $this->applicationForm;
    $formId = $this->applicationFormId();
    if ( !$formId ) {
      $this->applicationForm = false;
      return $this->applicationForm;
    }
    $forms = $this->plugin->forms->getForms([ $formId ]);
    if ( empty($forms) ) {
      $this->applicationForm = false;
      return $this->applicationForm;
    }
    $this->applicationForm = $forms[0];
    return $this->applicationForm;
  }

  public function hasRubric(){
    $rubric = $this->rubric();
    return !empty($rubric->items());
  }

  public function rubric(){
    return $this->plugin->rubrics->getByCycleId( $this->cycleId );
  }

  protected $judgeIds;
  public function judgeIds(){
    if ( isset($this->judgeIds) ) return $this->judgeIds;
    global $wpdb;
    $table = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::USER_META );
    $sql = "SELECT user_id FROM $table WHERE cycle_id = %d AND meta_key = 'isJudge' AND meta_value = 'true'";
    $this->judgeIds = $wpdb->get_col( $wpdb->prepare( $sql, $this->cycleId ) );
    return $this->judgeIds;
  }

  public function deleteLetterOfSupport($supporterId, $applicantId){
    if (!$this->supportIsEnabled() || !$this->supportFormId() ) return;

    // remove supporterApplicantSubmitted flag from user meta
    global $wpdb;
    $table = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::USER_META );
    $wpdb->delete($table, [
      'cycle_id' => $this->cycleId,
      'user_id' => $supporterId,
      'meta_key' => 'supporterApplicantSubmitted',
      'meta_value' => (string) $applicantId
    ]);

    // remove entry
    return $this->plugin->forms->deleteSupportEntry( $this->supportFormId(), $supporterId, $applicantId );

  }

  public function deleteApplicants($applicantIds){
    if ( empty($applicantIds) ) return;
    if ( !is_array($applicantIds) ) $applicantIds = [$applicantIds];
    global $wpdb;

    // remove from user meta
    $table = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::USER_META );
    $meta_keys = ['isApplicant', 'hasSubmittedApplication'];
    $sql = "DELETE FROM $table WHERE cycle_id = %d AND user_id IN (" . implode(',', $applicantIds) . ") AND meta_key IN ('" . implode("','", $meta_keys) . "')";
    $wpdb->query( $wpdb->prepare( $sql, $this->cycleId ) );

    // remove from judge/sponsor user meta assignments
    $table = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::USER_META );
    $meta_keys = array_map(function($item){
      return $item['meta_key'];
    }, array_merge($this->plugin->config::$assignedJudgesProps, $this->plugin->config::$supporterProps));
    $sql = "DELETE FROM $table WHERE cycle_id = %d AND meta_value IN ('" . implode("','", $applicantIds) . "') AND meta_key IN ('" . implode("','", $meta_keys) . "')";
    $wpdb->query( $wpdb->prepare( $sql, $this->cycleId ) );

    // remove from scores
    $this->removeApplicantScores( $applicantIds );

    // remove applications
    if ( $this->applicationFormId() ){
      $this->plugin->forms->deleteEntriesByApplicantId( $this->applicationFormId(), $applicantIds );
    }

    $this->clearCache();
    $this->plugin->users->clearCache();
  }

  public function removeJudges($judgeIds){
    if ( empty($judgeIds) ) return;
    if ( !is_array($judgeIds) ) $judgeIds = [$judgeIds];
    global $wpdb;

    // remove from user meta
    $table = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::USER_META );
    $meta_keys = ['isJudge', 'judgeCategory', 'assignedApplicant'];
    $sql = "DELETE FROM $table WHERE cycle_id = %d AND user_id IN (" . implode(',', $judgeIds) . ") AND meta_key IN ('" . implode("','", $meta_keys) . "')";
    $wpdb->query( $wpdb->prepare( $sql, $this->cycleId ) );

    // remove from scores
    $this->removeJudgeScores( $judgeIds );
    $this->judgeIds = null;

  }

  public function removeJudgeScores($judgeIds){
    if ( empty($judgeIds) ) return;
    if ( !is_array($judgeIds) ) $judgeIds = [$judgeIds];

    if ( !$this->hasRubric() ) return;
    $rubricItemIds = $this->rubric()->itemIds();
    if ( empty($rubricItemIds) ) return;

    global $wpdb;
    $table = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::SCORES );
    $sql = "DELETE FROM $table WHERE rubric_id IN (" . implode(',', $rubricItemIds) . ") AND judge_id IN (" . implode(',', $judgeIds) . ")";
    $wpdb->query( $sql );
  }

  public function removeApplicantScores($applicantIds){
    if ( empty($applicantIds) ) return;
    if ( !is_array($applicantIds) ) $applicantIds = [$applicantIds];

    if ( !$this->hasRubric() ) return;
    $rubricItemIds = $this->rubric()->itemIds();
    if ( empty($rubricItemIds) ) return;

    global $wpdb;
    $table = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::SCORES );
    $sql = "DELETE FROM $table WHERE rubric_id IN (" . implode(',', $rubricItemIds) . ") AND applicant_id IN (" . implode(',', $applicantIds) . ")";
    $wpdb->query( $sql );
  }


  public function judgeAssignmentMap($byApplicant=false){
    $judgeIds = $this->judgeIds();
    $assignments = $this->userMetaItem('assignedApplicant');
    $out = [];
    if ( $byApplicant ) {
      foreach( $assignments as $assignment ){
        if ( !isset($out[ $assignment->meta_value ]) ){
          $out[ $assignment->meta_value ] = [];
        }
        $out[ $assignment->meta_value ][] = $assignment->user_id;
      }
    } else {
      foreach( $judgeIds as $judgeId ){
        $out[ $judgeId ] = [];
        foreach( $assignments as $assignment ){
          if ( $assignment->user_id == $judgeId ){
            $out[ $judgeId ][] = $assignment->meta_value;
          }
        }
      }
    }

    return $out;
  }

  public function conflictOfInterestMap(){
    $judgeIds = $this->judgeIds();
    $assignments = $this->userMetaItem('conflictOfInterestApplicant');
    $out = [];
    foreach( $judgeIds as $judgeId ){
      $out[ $judgeId ] = [];
      foreach( $assignments as $assignment ){
        if ( $assignment->user_id == $judgeId ){
          $out[ $judgeId ][] = $assignment->meta_value;
        }
      }
    }
    return $out;
  }

  public function completedEvaluationsMap($byApplicant=false){
    $judgeIds = $this->judgeIds();
    $assignments = $this->userMetaItem('evaluatedApplicant');
    $out = [];
    if ( $byApplicant ) {
      foreach( $assignments as $assignment ){
        if ( !isset($out[ $assignment->meta_value ]) ){
          $out[ $assignment->meta_value ] = [];
        }
        $out[ $assignment->meta_value ][] = $assignment->user_id;
      }
    } else {
      foreach( $judgeIds as $judgeId ){
        $out[ $judgeId ] = [];
        foreach( $assignments as $assignment ){
          if ( $assignment->user_id == $judgeId ){
            $out[ $judgeId ][] = $assignment->meta_value;
          }
        }
      }
    }
    return $out;
  }

  public function getJudgeById($id){
    $judges = $this->judges();
    foreach( $judges as $judge ){
      if ( $judge->record()->user_id == $id ) return $judge;
    }
    return false;
  }

  public function judges($returnArray=false, $arrayFields=[]){
    $judges = [];

    $judgeIds = $this->judgeIds();
    if ( empty($judgeIds) ) return $judges;
    $users = $this->plugin->users->getByUserIds( $judgeIds );
    if ( !$returnArray ) return $users;

    // categories
    $categoriesBySlug = [];
    $categories = $this->categories();
    if ( !empty($categories) ){
      foreach( $categories as $category ){
        $categoriesBySlug[ $category['value'] ] = $category;
      }
    }

    if ( !empty($arrayFields['assignments'])){
      $assignmentsByJudge = $this->judgeAssignmentMap();
    }
    if ( !empty($arrayFields['conflictsOfInterest']) ){
      $conflictsOfInterestByJudge = $this->conflictOfInterestMap();
    }
    if ( !empty($arrayFields['completedEvaluations']) ){
      $completedEvaluationsByJudge = $this->completedEvaluationsMap();
    }


    foreach( $users as $user ){
      $judge = [
        'id' => $user->record()->user_id,
        'name' => $user->name(),
        'email' => $user->record()->email,
        'hasUserLogin' => $user->hasUserLogin()
      ];
      $category = $user->cycleMetaItem('judgeCategory', $this->cycleId);
      if ( !empty($category) ){
        $judge['category'] = $category;
        if ( !empty($categoriesBySlug[ $category ]) ){
          $judge['categoryObject'] = $categoriesBySlug[ $category ];
        }
      }

      if ( !empty($arrayFields['assignments']) ){
        if ( !empty($assignmentsByJudge[ $judge['id'] ]) ){
          $judge['assignments'] = $assignmentsByJudge[ $judge['id'] ];
        } else {
          $judge['assignments'] = [];
        }
      }

      if ( !empty($arrayFields['conflictsOfInterest']) ){
        if ( !empty($conflictsOfInterestByJudge[ $judge['id'] ]) ){
          $judge['conflictsOfInterest'] = $conflictsOfInterestByJudge[ $judge['id'] ];
        } else {
          $judge['conflictsOfInterest'] = [];
        }
      }

      if ( !empty($arrayFields['completedEvaluations']) ){
        if ( !empty($completedEvaluationsByJudge[ $judge['id'] ]) ){
          $judge['completedEvaluations'] = $completedEvaluationsByJudge[ $judge['id'] ];
        } else {
          $judge['completedEvaluations'] = [];
        }
      }

      $judges[] = $judge;
    }
    return $judges;
  }

  /**
   * @description Get the basic cycle record from the db table
   */
  protected $record;
  public function record(){
    if ( !empty($this->record) ) return $this->record;
    global $wpdb;
    $cyclesTable = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::CYCLES );
    $sql = "SELECT * FROM $cyclesTable WHERE cycle_id = %d";
    $this->record = $wpdb->get_row( $wpdb->prepare( $sql, $this->cycleId ) );
    return $this->record;
  }

  /**
   * @description Get the cycle record as an associative array
   */
  public function recordArray($additionalProps = []){
    $out = (array) $this->record();
    if ( !empty($out['cycle_meta']) ){
      $out['cycle_meta'] = json_decode( $out['cycle_meta'], true );
    } else {
      $out['cycle_meta'] = new stdClass();
    }
    if ( !empty($additionalProps['applicantCount']) ){
      $out['applicantCount'] = $this->applicantCount();
    }
    return $out;
  }

  /**
   * @description This is the active application cycle
   */
  protected $isActive;
  public function isActive(){
    if ( isset($this->isActive) ) return $this->isActive;
    $record = $this->record();
    $this->isActive = $record->is_active;
    return $this->isActive;
  }

  protected $allApplicants;
  public function allApplicants(){
    if ( isset($this->allApplicants) ) return $this->allApplicants;
    $this->allApplicants = $this->plugin->users->getAllApplicants( $this->cycleId );
    return $this->allApplicants;
  }

  public function getApplicantById($id){
    $applicants = $this->allApplicants();
    foreach( $applicants as $applicant ){
      if ( $applicant->record()->user_id == $id ) return $applicant;
    }
    return false;
  }

  protected $applicationEntries;
  public function applicationEntries(){
    if ( isset($this->applicationEntries) ) return $this->applicationEntries;
    if ( !$this->applicationForm() ) {
      $this->applicationEntries = [];
      return $this->applicationEntries;
    }
    $this->applicationEntries = $this->plugin->forms->getEntries( $this->applicationForm()->id );
    return $this->applicationEntries;
  }

  public function getEntriesByApplicantId(){
    $entries = $this->applicationEntries();
    usort($entries, function($a, $b){
      return $b->date_created_sql <=> $a->date_created_sql;
    });

    $entriesByUserId = [];
    $key_app = 'forminator_addon_ucdlib-awards_applicant_id';
    $key_cycle = 'forminator_addon_ucdlib-awards_cycle_id';
    foreach( $entries as $entry ){
      if ( empty($entry->meta_data[$key_cycle]) ) continue;
      if ( $entry->meta_data[$key_cycle]['value'] != $this->cycleId ) continue;
      if (
        !empty($entry->meta_data[$key_app]['value'])
        && empty($entriesByUserId[ $entry->meta_data[$key_app]['value'] ])
        ) {
        $entriesByUserId[ $entry->meta_data[$key_app]['value'] ] = $entry;
      }
    }
    return $entriesByUserId;
  }

  // Entries for letter of support form
  protected $supportEntries;
  public function supportEntries(){
    if ( isset($this->supportEntries) ) return $this->supportEntries;
    if ( !$this->record() || !$this->record()->support_form_id ){
      $this->supportEntries = [];
      return $this->supportEntries;
    }
    $this->supportEntries = $this->plugin->forms->getEntries( $this->record()->support_form_id );
    return $this->supportEntries;
  }

  // latest entries for letter of support form by applicant id and supporter id, firstId is either 'applicantId' or 'supporterId'
  public function getSupportEntriesById($firstId='applicantId', $exportEntry=false){
    if ( $firstId != 'applicantId' && $firstId != 'supporterId' ) {
      $firstId = 'applicantId';
    }
    $secondId = $firstId == 'applicantId' ? 'supporterId' : 'applicantId';
    $keys = [
      'applicantId' => 'forminator_addon_ucdlib-awards_applicant_id',
      'supporterId' => 'forminator_addon_ucdlib-awards_supporter_id'
    ];
    $key_cycle = 'forminator_addon_ucdlib-awards_cycle_id';

    $entries = $this->supportEntries();
    usort($entries, function($a, $b){
      return $b->date_created_sql <=> $a->date_created_sql;
    });

    $entriesById = [];
    foreach( $entries as $entry ){
      if ( empty($entry->meta_data[$key_cycle]) ) continue;
      if ( $entry->meta_data[$key_cycle]['value'] != $this->cycleId ) continue;
      if (
        !empty($entry->meta_data[$keys[$firstId]]['value'])
        && !empty($entry->meta_data[$keys[$secondId]]['value'])
        ) {
        $firstIdValue = $entry->meta_data[$keys[$firstId]]['value'];
        $secondIdValue = $entry->meta_data[$keys[$secondId]]['value'];
        if ( empty($entriesById[ $firstIdValue ]) ){
          $entriesById[ $firstIdValue ] = [];
        }
        if ( empty($exportEntry) ){
          $entriesById[ $firstIdValue ][ $secondIdValue ] = $entry;
        } else {
          $entriesById[ $firstIdValue ][ $secondIdValue ] = $this->plugin->forms->exportEntry($entry, true);
        }

      }
    }
    return $entriesById;
  }

  /**
   * @description Get all applicants for the cycle with any additional specified metadata
   */
  public function getApplicants($args=[]){
    $allApplicants = $this->allApplicants();
    if ( empty($allApplicants) ) return [];
    if ( empty($args) ) return $allApplicants;

    if ( !empty($args['applicationEntry']) ){
      $entriesByUserId = $this->getEntriesByApplicantId();
    }

    if ( !empty($args['userMeta']) ){
      $userMeta = $this->userMeta();
      $userMetaByUserId = [];
      $assignedJudgesMeta = [];
      foreach( $userMeta as $meta ){
        if ( !isset($userMetaByUserId[ $meta->user_id ]) ){
          $userMetaByUserId[ $meta->user_id ] = [];
        }
        $userMetaByUserId[ $meta->user_id ][] = $meta;

        $applicantKeys = array_map(function($item){
          return $item['meta_key'];
        }, $this->plugin->config::$assignedJudgesProps);
        if ( in_array($meta->meta_key, $applicantKeys) ){
          $assignedJudgeIdsMeta[] = $meta;
        }
      }
    }

    foreach( $allApplicants as &$applicant ){

      if ( isset($entriesByUserId[ $applicant->id ]) ){
        $applicant->setApplicationEntry( $entriesByUserId[ $applicant->id ], $this->cycleId );
      }

      if ( isset($userMetaByUserId[ $applicant->id ]) ){
        $applicant->setCycleMeta( $userMetaByUserId[ $applicant->id ], $this->cycleId );
      }

      if ( isset($assignedJudgeIdsMeta) ){
        $applicant->setAssignedJudgeIdsMeta( $assignedJudgeIdsMeta );
      }

    }
    return $allApplicants;
  }

  public function unassignApplicants($applicant_ids, $judge_ids){
    if ( !is_array($applicant_ids) ) $applicant_ids = [$applicant_ids];
    if ( !is_array($judge_ids) ) $judge_ids = [$judge_ids];
    if ( empty($applicant_ids) || empty($judge_ids) ) return;
    $metaKey = 'assignedApplicant';

    $existingAssignments = $this->userMetaItem($metaKey);
    $existingAssignmentsByJudgeId = [];
    foreach( $existingAssignments as $assignment ){
      if ( !isset($existingAssignmentsByJudgeId[ $assignment->user_id ]) ){
        $existingAssignmentsByJudgeId[ $assignment->user_id ] = [];
      }
      $existingAssignmentsByJudgeId[ $assignment->user_id ][] = $assignment->meta_value;
    }

    $assignmentsToRemove = [];
    foreach( $judge_ids as $judge_id ){
      if ( !isset($existingAssignmentsByJudgeId[ $judge_id ]) ){
        $existingAssignmentsByJudgeId[ $judge_id ] = [];
      }
      $assignmentsToRemove[ $judge_id ] = array_intersect( $applicant_ids, $existingAssignmentsByJudgeId[ $judge_id ] );
    }
    $assignmentsToRemove = array_filter( $assignmentsToRemove );

    global $wpdb;
    $table = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::USER_META );
    foreach ($assignmentsToRemove as $judge_id => $applicant_ids) {
      foreach( $applicant_ids as $applicant_id ){
        $wpdb->delete(
          $table,
          [
            'user_id' => $judge_id,
            'cycle_id' => $this->cycleId,
            'meta_key' => $metaKey,
            'meta_value' => $applicant_id
          ]
        );
      }
    }
    $this->userMeta = null;
    return $assignmentsToRemove;
  }

  public function assignApplicants($applicant_ids, $judge_ids){
    if ( !is_array($applicant_ids) ) $applicant_ids = [$applicant_ids];
    if ( !is_array($judge_ids) ) $judge_ids = [$judge_ids];
    if ( empty($applicant_ids) || empty($judge_ids) ) return;
    $metaKey = 'assignedApplicant';

    $existingAssignments = $this->userMetaItem($metaKey);
    $existingAssignmentsByJudgeId = [];
    foreach( $existingAssignments as $assignment ){
      if ( !isset($existingAssignmentsByJudgeId[ $assignment->user_id ]) ){
        $existingAssignmentsByJudgeId[ $assignment->user_id ] = [];
      }
      $existingAssignmentsByJudgeId[ $assignment->user_id ][] = $assignment->meta_value;
    }

    $newAssignments = [];
    foreach( $judge_ids as $judge_id ){
      if ( !isset($existingAssignmentsByJudgeId[ $judge_id ]) ){
        $existingAssignmentsByJudgeId[ $judge_id ] = [];
      }
      $newAssignments[ $judge_id ] = array_diff( $applicant_ids, $existingAssignmentsByJudgeId[ $judge_id ] );
    }
    $newAssignments = array_filter( $newAssignments );

    global $wpdb;
    $table = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::USER_META );

    foreach( $newAssignments as $judge_id => $applicant_ids ){
      foreach( $applicant_ids as $applicant_id ){
        $wpdb->insert(
          $table,
          [
            'user_id' => $judge_id,
            'cycle_id' => $this->cycleId,
            'meta_key' => $metaKey,
            'meta_value' => $applicant_id,
            'date_created' => date('Y-m-d H:i:s'),
            'date_updated' => date('Y-m-d H:i:s')
          ]
        );
      }
    }

    $this->userMeta = null;

    return $newAssignments;
  }

  public function userMetaItem($metaKey){
    $out = [];
    $userMeta = $this->userMeta();
    if ( empty($userMeta) ) return $out;
    foreach( $userMeta as $meta ){
      if ( $meta->meta_key == $metaKey ) {
        $out[] = $meta;
      }
    }
    return $out;
  }

  protected $userMeta;
  public function userMeta(){
    if ( isset($this->userMeta) ) return $this->userMeta;
    global $wpdb;
    $userMetaTable = UcdlibAwardsDbTables::get_table_name( UcdlibAwardsDbTables::USER_META );
    $sql = "SELECT * FROM $userMetaTable WHERE cycle_id = %d";
    $this->userMeta = $wpdb->get_results( $wpdb->prepare( $sql, $this->cycleId ) );
    return $this->userMeta;
  }

  public function supportTransactions(){
    $metaKeys = [
      'registered' => 'supporterApplicant',
      'submitted' => 'supporterApplicantSubmitted'
    ];
    $out = [];
    $userIds = [];
    foreach ($this->userMeta() as $metaItem) {
      if ( !in_array($metaItem->meta_key, $metaKeys) ) continue;
      if ( empty($metaItem->user_id) || empty($metaItem->meta_value) ) continue;
      $rowId = $metaItem->user_id . '_' . $metaItem->meta_value;
      if ( empty($out[$rowId]) ){
        if (!in_array($metaItem->user_id, $userIds) ){
          $userIds[] = $metaItem->user_id;
        }
        if (!in_array($metaItem->meta_value, $userIds) ){
          $userIds[] = $metaItem->meta_value;
        }
        $out[$rowId] = [
          'id' => $rowId,
          'supporterId' => $metaItem->user_id,
          'supporterName' => '',
          'supporterEmail' => '',
          'applicantId' => $metaItem->meta_value,
          'applicantName' => '',
          'applicantEmail' => '',
          'registered' => false,
          'registeredTimestamp' => '',
          'submitted' => false,
          'submittedTimestamp' => ''
        ];
      }
      if ( $metaItem->meta_key == $metaKeys['registered'] ){
        $out[$rowId]['registered'] = true;
        $out[$rowId]['registeredTimestamp'] = $metaItem->date_updated;
      }
      if ( $metaItem->meta_key == $metaKeys['submitted'] ){
        $out[$rowId]['submitted'] = true;
        $out[$rowId]['submittedTimestamp'] = $metaItem->date_updated;
      }
    }

    $users = $this->plugin->users->getByUserIds( $userIds );
    foreach ($out as &$o) {
      $applicant = $this->plugin->users->getByUserId( $o['applicantId'] );
      if ( $applicant ){
        $o['applicantName'] = $applicant->name();
        $o['applicantEmail'] = $applicant->record()->email;
      }
      $supporter = $this->plugin->users->getByUserId( $o['supporterId'] );
      if ( $supporter ){
        $o['supporterName'] = $supporter->name();
        $o['supporterEmail'] = $supporter->record()->email;
      }
    }

    return $out;

  }

  protected $applicantCount;
  public function applicantCount(){
    if ( isset($this->applicantCount) ) return $this->applicantCount;
    $this->applicantCount = $this->plugin->users->getApplicantCount( $this->cycleId );
    return $this->applicantCount;
  }

  protected $categories;
  public function categories(){
    if ( isset($this->categories) ) return $this->categories;
    $record = $this->record();
    if (
       empty($record->has_categories ) ||
       empty($record->category_form_slug) ||
       empty($record->application_form_id)
       ) {
      $this->categories = false;
      return $this->categories;
       }
    $formFields = $this->plugin->forms->getFormFields( $record->application_form_id );
    if ( empty($formFields) ) {
      $this->categories = false;
      return $this->categories;
    }
    foreach( $formFields as $fieldWrapper ){
      if ( !is_array($fieldWrapper['fields']) ) continue;
      foreach( $fieldWrapper['fields'] as $field ){
        if ( $field['element_id'] != $record->category_form_slug ) continue;
        if ( !is_array($field['options']) || !count($field['options']) ) continue;
        $this->categories = $field['options'];
        return $this->categories;
      }
    }
    $this->categories = null;
    return $this->categories;
  }
}
