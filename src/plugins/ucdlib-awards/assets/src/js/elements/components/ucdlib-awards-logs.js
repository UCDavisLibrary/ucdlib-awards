import { LitElement } from 'lit';
import * as templates from "./ucdlib-awards-logs.tpl.js";
import wpAjaxController from "../../controllers/wp-ajax.js";
import datetimeUtils from "../../utils/datetime.js";

import Mixin from "@ucd-lib/theme-elements/utils/mixins/mixin.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { MutationObserverController } from '@ucd-lib/theme-elements/utils/controllers/index.js';

export default class UcdlibAwardsLogs extends Mixin(LitElement)
  .with(MainDomElement) {

  static get properties() {
    return {
      logs: { type: Array },
      cycleId: { type: Number },
      filters: { type: Object },
      totalPages: { type: Number },
      users: { type: Array },
      logPage: { type: Number },
      page: { type: String },
      errorMessages: { type: Array }
    }
  }

  constructor() {
    super();
    this.render = templates.render.bind(this);

    this.filters = {};
    this.logs = [];
    this.cycleId = 0;
    this.totalPages = 1;
    this.logPage = 1;
    this.page = 'logs-loading';
    this.errorMessages = [];
    this.users = [];

    this.mutationObserver = new MutationObserverController(this);
    this.wpAjax = new wpAjaxController(this);
  }

  _onChildListMutation(){
    Array.from(this.children).forEach(child => {
      if ( child.nodeName === 'SCRIPT' && child.type === 'application/json' ) {
        this._parsePropsScript(child);
        return;
      }
    });
  }

  async query(){
    const query = {...this.filters, page: this.logPage, cycle: this.cycleId};
    const response = await this.wpAjax.request('query', {query});

    // query is already in progress
    if ( !response ) return;

    this.page = 'logs-loading';
    if ( response.success ) {
      this.users = response.data.users;
      this.logs = response.data.results.map(log => this.parseLog(log));
      this.logPage = response.data.currentPage;
      this.totalPages = response.data.totalPages;
      this.page = 'logs-success';

    } else {
      this.errorMessages = response.messages;
      this.page = 'logs-error';
    }
  }

  parseLog(log){
    if ( log.log_type == 'cycle' ){
      log = this._parseCycleLog(log);
    } else if ( log.log_type == 'application' ) {
      log = this._parseApplicationLog(log);
    } else if ( log.log_type == 'rubric' ) {
      log = this._parseRubricLog(log);
    } else if ( log.log_type == 'evaluation-admin' ) {
      log = this._parseEvaluationAdminLog(log);
    } else if ( log.log_type == 'evaluation' ) {
      log = this._parseEvaluationLog(log);
    } else if ( log.log_type == 'email' ) {
      log = this._parseEmailLog(log);
    }

    if ( !log.displayText ) {
      log.displayText = 'Error displaying this log!';
      log.icon = 'ucd-public:fa-question';
      log.iconColor = 'double-decker';
    }
    log.displayDate = datetimeUtils.mysqlToLocaleString(log.date_created, {includeTime: true});
    return log;
  }

  _parseCycleLog(log){
    log.icon = 'ucd-public:fa-arrows-spin';
    log.iconColor = 'gunrock';

    if ( log.log_subtype === 'update' ) {
      log.displayText = `Cycle updated`;
    } else if ( log.log_subtype === 'create' ) {
      log.displayText = `Cycle created`;
    } else if ( log.log_subtype === 'delete' ) {
      log.displayText = `Cycle deleted`;
    }
    log.displayText += ` by ${this.getUserName(log.user_id_subject)}`;

    return log;
  }

  _parseEvaluationAdminLog(log){
    log.icon = 'ucd-public:fa-users-gear';
    log.iconColor = 'cabernet';
    if ( log.log_subtype === 'judge-added' ){
      let judge = '';
      if ( !parseInt(log.user_id_object) && log.log_value?.judge ) {
        judge = `${log.log_value.judge?.first_name || ''} ${log.log_value.judge?.last_name || ''}`;
      } else {
        judge = this.getUserName(log.user_id_object);
      }
      let admin = this.getUserName(log.user_id_subject);
      log.displayText = `${judge} assigned as reviewer ${admin ? `by ${admin}` : ''}`;
    } else if ( log.log_subtype === 'judge-removed' ) {
      log.displayText = `${this.getUserName(log.user_id_object)} removed as reviewer by ${this.getUserName(log.user_id_subject)}`;
    } else if ( log.log_subtype === 'application-assignment' ) {
      log.displayText = `Applicant ${this.getUserName(log.user_id_subject)} assigned to ${this.getUserName(log.user_id_object)} for evaluation`;
    } else if ( log.log_subtype === 'application-unassigned' ) {
      log.displayText = `Applicant ${this.getUserName(log.user_id_subject)} unassigned from ${this.getUserName(log.user_id_object)}`;
    }
    return log;
  }

  _parseEvaluationLog(log){
    log.icon = 'ucd-public:fa-gavel';
    log.iconColor = 'redbud';
    if ( log.log_subtype === 'conflict-of-interest' ){
      log.displayText = `Conflict of interest declared by ${this.getUserName(log.user_id_subject)} for applicant ${this.getUserName(log.user_id_object)}`;
    } else if ( log.log_subtype === 'completed' ) {
      log.displayText = `Evaluation completed by ${this.getUserName(log.user_id_subject)} for applicant ${this.getUserName(log.user_id_object)}`;
    }
    return log;
  }

  _parseEmailLog(log){
    log.icon = 'ucd-public:fa-envelope';
    log.iconColor = 'delta';
    if ( log.log_subtype === 'update-settings' ) {
      log.displayText = `Email settings updated by ${this.getUserName(log.user_id_subject)}`;
    } else if ( log.log_subtype === 'application-confirmation' ) {
      log.displayText = `Application confirmation email sent to ${this.getUserName(log.user_id_subject)}`;
    } else if ( log.log_subtype === 'applicant-assigned' ) {
      log.displayText = `Applicant assigned email sent to ${this.getUserName(log.user_id_subject)}`;
    } else if ( log.log_subtype === 'evaluation-nudge' ){
      log.displayText = `Evaluation nudge email sent to reviewer ${this.getUserName(log.user_id_subject)}`;
    } else if ( log.log_subtype === 'support-requested' ){
      log.displayText = `Letter of support request email sent to ${this.getUserName(log.user_id_subject)} for applicant ${this.getUserName(log.user_id_object)}`;
    } else if ( log.log_subtype === 'supporter-nudge' ){
      log.displayText = `Letter of support nudge email sent to ${this.getUserName(log.user_id_subject)} for applicant ${this.getUserName(log.user_id_object)}`;
    }
    return log;
  }

  _parseApplicationLog(log){
    log.icon = 'ucd-public:fa-square-pen';
    log.iconColor = 'pinot';
    if ( log.log_subtype === 'submit' ) {
      log.displayText = `Application submitted by ${this.getUserName(log.user_id_subject)}`;
    } else if ( log.log_subtype === 'delete' ) {
      log.displayText = `Applicant ${this.getUserName(log.user_id_object)} deleted by ${this.getUserName(log.user_id_subject)}`;
    } else if ( log.log_subtype === 'support-submitted' ){
      log.displayText = `Letter of support submitted by ${this.getUserName(log.user_id_subject)} for applicant ${this.getUserName(log.user_id_object)}`;
    }
    return log;
  }

  _parseRubricLog(log){
    log.icon = 'ucd-public:fa-list-check';
    log.iconColor = 'redwood';
    if ( log.log_subtype === 'create' ) {
      log.displayText = `Evaluation rubric created by ${this.getUserName(log.user_id_subject)}`;
    } else if ( log.log_subtype === 'update' ) {
      log.displayText = `Evaluation rubric updated by ${this.getUserName(log.user_id_subject)}`;
    }
    return log;
  }

  getUserName(userId){
    let out = 'Unknown User';
    let user = this.users.find(user => user.user_id == userId);
    if ( user ){
      let name = `${user.first_name} ${user.last_name}`;
      if ( name.trim() ) {
        out = name.trim();
      } else if ( user.display_name ) {
        out = user.display_name;
      }
    }
    out = `<span class='log-person'>${out}</span>`
    return out;
  }

  _onPageChange(e){
    const newPage = e.detail.page;
    if ( newPage === this.logPage ) return;
    this.logPage = newPage;
    this.query();
  }

  /**
   * @description Parses the JSON script tag in the DOM and sets the element properties
   * @param {*} script - the JSON script tag DOM element
   * @returns
   */
  _parsePropsScript(script){
    let data = {};
    try {
      data = JSON.parse(script.text);
    } catch(e) {
      console.error('Error parsing JSON script', e);
    }
    if ( !data ) return;
    if ( data.filters ) this.filters = data.filters;
    if ( data.cycleId ) this.cycleId = data.cycleId;
    if ( data.doQueryOnLoad && this.logs.length === 0 ) {
      this.query();
    }

  }

  async _filterElementUpdate(filterElement){
    if ( !filterElement ) return;
    this.logPage = 1;
    this.filters = filterElement.selectedFilters;
    await this.query();
    return true;
  }

}

customElements.define('ucdlib-awards-logs', UcdlibAwardsLogs);
