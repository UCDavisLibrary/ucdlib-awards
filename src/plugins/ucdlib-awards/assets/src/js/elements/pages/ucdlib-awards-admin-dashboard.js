import { LitElement } from 'lit';
import * as templates from "./ucdlib-awards-admin-dashboard.tpl.js";
import wpAjaxController from "../../controllers/wp-ajax.js";

import Mixin from "@ucd-lib/theme-elements/utils/mixins/mixin.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { MutationObserverController } from '@ucd-lib/theme-elements/utils/controllers/index.js';

export default class UcdlibAwardsAdminDashboard extends Mixin(LitElement)
  .with(MainDomElement) {

  static get properties() {
    return {
      requestedCycle: {state: true},
      hasRequestedCycle: {state: true},
      requestedCycleIsActive: {state: true},
      cyclesLink: {state: true},
      rubricLink: {state: true},
      hasRubric: {state: true},
      rubricItemTitles: {state: true},
      logsProps: {state: true},
      logsPropsJson: {state: true},
      logsLink: {state: true}
    }
  }

  constructor() {
    super();
    this.render = templates.render.bind(this);
    this.renderCycleDatesPanel = templates.renderCycleDatesPanel.bind(this);
    this.renderLogsPanel = templates.renderLogsPanel.bind(this);
    this.renderRubricPanel = templates.renderRubricPanel.bind(this);

    this.requestedCycle = {};
    this.hasRequestedCycle = false;
    this.requestedCycleIsActive = false;
    this.cyclesLink = '';
    this.logsProps = {};
    this.logsPropsJson = '';
    this.logsLink = '';
    this.hasRubric = false;
    this.rubricLink = '';
    this.rubricItemTitles = [];

    this.wpAjax = new wpAjaxController(this);
    this.mutationObserver = new MutationObserverController(this);
  }

  willUpdate(props){
    if ( props.has('requestedCycle') ) {
      this.hasRequestedCycle = Object.keys(this.requestedCycle).length > 0;
      this.requestedCycleIsActive = parseInt(this.requestedCycle.is_active) ? true : false;
    }
    if ( props.has('logsProps') ) {
      this.logsPropsJson = JSON.stringify(this.logsProps);
    }
  }

  _onChildListMutation(){
    Array.from(this.children).forEach(child => {
      if ( child.nodeName === 'SCRIPT' && child.type === 'application/json' ) {
        this._parsePropsScript(child);
        return;
      }
    });
  }

  _parsePropsScript(script){
    let data = {};
    try {
      data = JSON.parse(script.text);
    } catch(e) {
      console.error('Error parsing JSON script', e);
    }
    if ( !data ) return;
    if ( data.requestedCycle ) {
      this.requestedCycle = data.requestedCycle;
    }
    if ( data.logsProps ) {
      this.logsProps = data.logsProps;
    }
    if ( data.logsLink ) {
      this.logsLink = data.logsLink;
    }
    if ( data.rubricLink ){
      this.rubricLink = data.rubricLink;
    }
    if ( data.hasRubric ) {
      this.hasRubric = data.hasRubric;
    }
    if ( data.rubricItemTitles ) {
      this.rubricItemTitles = data.rubricItemTitles;
    }
    if ( data.cyclesLink && data.requestedCycle ) {
      const params = new URLSearchParams(data.cyclesLink.split('?')[1]);
      params.set('cycle', this.requestedCycle.cycle_id);
      this.cyclesLink = `${data.cyclesLink.split('?')[0]}?${params.toString()}`;
    }

  }

}

customElements.define('ucdlib-awards-admin-dashboard', UcdlibAwardsAdminDashboard);
