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
    console.log('query', query);
    const response = await this.wpAjax.request('query', {query});

    // query is already in progress
    if ( !response ) return;

    this.page = 'logs-loading';
    console.log('response', response);
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
    }

    if ( !log.displayText ) {
      log.displayText = 'Error displaying this log!';
      log.icon = 'ucd-public:fa-question';
      log.iconColor = 'double-decker';
    }
    log.displayDate = datetimeUtils.mysqlToLocaleString(log.date_created, true);
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

  _parseApplicationLog(log){
    log.icon = 'ucd-public:fa-square-pen';
    log.iconColor = 'pinot';
    if ( log.log_subtype === 'submit' ) {
      log.displayText = `Application submitted by ${this.getUserName(log.user_id_subject)}`;
    }
    return log;
  }

  getUserName(userId){
    let out = 'Unknown User';
    let user = this.users.find(user => user.user_id == userId);
    if ( !user ) return out;
    let name = `${user.first_name} ${user.last_name}`;
    if ( !name.trim() ) return user.display_name;
    out = name;
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
    console.log('filterElement', filterElement);
    this.logPage = 1;
    this.filters = filterElement.selectedFilters;
    await this.query();
    return true;
  }

}

customElements.define('ucdlib-awards-logs', UcdlibAwardsLogs);
