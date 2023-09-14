import { LitElement } from 'lit';
import * as templates from "./ucdlib-awards-logs.tpl.js";
import wpAjaxController from "../../controllers/wp-ajax.js";

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
    console.log('response', response);
    if ( response.success ) {
      this.logs = response.data.results.map(log => this._parseLog(log));
      this.totalPages = response.data.totalPages;
      this.page = 'logs-success';

    } else {
      this.errorMessages = response.messages;
      this.page = 'logs-error';
    }
  }

  _parseLog(log){
    return log;
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

}

customElements.define('ucdlib-awards-logs', UcdlibAwardsLogs);
