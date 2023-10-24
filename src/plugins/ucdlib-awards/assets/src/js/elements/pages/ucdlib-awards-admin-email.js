import { LitElement } from 'lit';
import * as templates from "./ucdlib-awards-admin-email.tpl.js";
import wpAjaxController from "../../controllers/wp-ajax.js";

import Mixin from "@ucd-lib/theme-elements/utils/mixins/mixin.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { MutationObserverController } from '@ucd-lib/theme-elements/utils/controllers/index.js';

export default class UcdlibAwardsAdminEmail extends Mixin(LitElement)
  .with(MainDomElement) {

  static get properties() {
    return {
      pages: { type: Array },
      page: { type: String },
      cycleId: { type: String },
      formGeneral: { type: Object },
      formAdmin: { type: Object },
      formJudge: { type: Object },
      formApplicant: { type: Object },
      errorMessages: { type: Array },
      errorFields: {type: Object},
      templateDefaults: { type: Object },
      templateVariables: { type: Array }
    }
  }

  constructor() {
    super();
    this.render = templates.render.bind(this);

    this.wpAjax = new wpAjaxController(this);
    this.mutationObserver = new MutationObserverController(this);

    this.formGeneral = {};
    this.formAdmin = {};
    this.formJudge = {};
    this.formApplicant = {};
    this.errorMessages = [];
    this.cycleId = '';
    this.errorFields = {};
    this.templateDefaults = {};
    this.templateVariables = [];

    this.page = 'general';
    this.pages = [
      { label: 'General Settings', value: 'general', formProperty: 'formGeneral' },
      { label: 'Admin Notifications', value: 'admin', formProperty: 'formAdmin' },
      { label: 'Judge Notifications', value: 'judge', formProperty: 'formJudge' },
      { label: 'Applicant Notifications', value: 'applicant', formProperty: 'formApplicant' }
    ];
  }

  _onNavClick(e) {
    const clickedText = e.detail?.linkText;
    const newPage = this.pages.find(page => page.label === clickedText);
    if ( !newPage ) return;
    if ( newPage.value === this.page ) return;
    this.errorMessages = [];
    this.errorFields = {};
    this.page = newPage.value;
  }

  async _onFormSubmit(e) {
    e.preventDefault();
    const page = this.pages.find(p => p.value === this.page);
    if ( !page ) return;
    const data = this[page.formProperty];
    this.errorMessages = [];
    this.errorFields = {};
    console.log(data);

    const payload = {
      cycle_id: this.cycleId,
      group: page.value,
      data
    };
    const response = await this.wpAjax.request('updateMetaGroup', payload);
    if ( response.success ){
      this[page.formProperty] = response.data.emailMeta;
      this.dispatchEvent(new CustomEvent('toast-request', {
        bubbles: true,
        composed: true,
        detail: {
          message: 'Settings updated',
          type: 'success'
        }
      }));
    } else {
      console.error('Error updating settings', response);
      this.errorMessages = response.messages || [];
      this.errorFields = response.errorFields || {};
    }
  }

  _onFormInput(page, prop, value) {
    page = this.pages.find(p => p.value === page);
    if ( !page ) return;
    const data = this[page.formProperty];
    data[prop] = value;
    this[page.formProperty] = {...data};

    if ( this.errorFields[prop] ) {
      delete this.errorFields[prop];
    }

  }

  /**
   * @description Callback for the mutation observer
   */
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
  console.log(data);

  if ( data.emailMeta ){
    this.formGeneral = data.emailMeta.general || {};
    this.formAdmin = data.emailMeta.admin || {};
    this.formJudge = data.emailMeta.judge || {};
    this.formApplicant = data.emailMeta.applicant || {};
  }
  if ( data.cycleId ) {
    this.cycleId = data.cycleId;
  }
  if ( data.templateDefaults ) {
    this.templateDefaults = data.templateDefaults;
  }
  if ( data.templateVariables ) {
    this.templateVariables = data.templateVariables;
  }
}

}

customElements.define('ucdlib-awards-admin-email', UcdlibAwardsAdminEmail);
