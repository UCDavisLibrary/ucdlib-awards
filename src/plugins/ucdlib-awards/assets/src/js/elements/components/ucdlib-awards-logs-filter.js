import { LitElement } from 'lit';
import * as templates from "./ucdlib-awards-logs-filter.tpl.js";
import wpAjaxController from "../../controllers/wp-ajax.js";

import Mixin from "@ucd-lib/theme-elements/utils/mixins/mixin.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { MutationObserverController } from '@ucd-lib/theme-elements/utils/controllers/index.js';

export default class UcdlibAwardsLogsFilter extends Mixin(LitElement)
  .with(MainDomElement) {

  static get properties() {
    return {
      filters: { type: Array },
      selectedFilters: { type: Object },
      doingQuery: { type: Boolean }
    }
  }

  constructor() {
    super();
    this.render = templates.render.bind(this);
    this.renderFilter = templates.renderFilter.bind(this);

    this.filters = [];
    this.selectedFilters = {};
    this.doingQuery = false;

    this.mutationObserver = new MutationObserverController(this);
    this.wpAjax = new wpAjaxController(this);
  }

  async _onSubmit(e){
    e.preventDefault();
    if ( this.doingQuery ) return;
    console.log('submit', this.selectedFilters);

    const mainEle = document.querySelector('ucdlib-awards-page');
    if ( !mainEle ) {
      console.error('Could not find main element');
      return;
    }
    const logsEle = mainEle.renderRoot.querySelector('ucdlib-awards-logs');
    if ( !logsEle ) {
      console.error('Could not find logs element');
      return;
    }

    this.doingQuery = true;
    await logsEle._filterElementUpdate(this);
    this.doingQuery = false;
  }

  _onFilterChange(prop, value){
    if ( !this.selectedFilters ) this.selectedFilters = {};
    this.selectedFilters[prop] = value;
    this.requestUpdate();
  }

  _onChildListMutation(){
    Array.from(this.children).forEach(child => {
      if ( child.nodeName === 'SCRIPT' && child.type === 'application/json' ) {
        this._parsePropsScript(child);
        return;
      }
    });
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

  }

}

customElements.define('ucdlib-awards-logs-filter', UcdlibAwardsLogsFilter);
