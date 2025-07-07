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
      formSupporter: { type: Object },
      errorMessages: { type: Array },
      errorFields: {type: Object},
      templateDefaults: { type: Object },
      templateVariables: { type: Array },
      emailingEnabled: { type: Boolean },
      supportEnabled: { type: Boolean }
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
    this.formSupporter = {};
    this.formApplicant = {};
    this.errorMessages = [];
    this.cycleId = '';
    this.errorFields = {};
    this.templateDefaults = {};
    this.templateVariables = [];
    this.emailingEnabled = false;
    this.supportEnabled = false;

    this.page = 'general';
    this.pages = [
      { label: 'General Settings', value: 'general', formProperty: 'formGeneral' },
      { label: 'Admin Notifications', value: 'admin', formProperty: 'formAdmin' },
      { label: 'Reviewer Notifications', value: 'judge', formProperty: 'formJudge' },
      { label: 'Applicant Notifications', value: 'applicant', formProperty: 'formApplicant' },
      { label: 'Supporter Notifications', value: 'supporter', formProperty: 'formSupporter', hidden: true },
    ];
  }

  willUpdate(props){
    if ( props.has('supportEnabled')) {
      const page = this.pages.find(p => p.value === 'supporter');
      if ( page ) page.hidden = !this.supportEnabled;
    }
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

  if ( data.emailMeta ){
    this.formGeneral = data.emailMeta.general || {};
    this.formAdmin = data.emailMeta.admin || {};
    this.formJudge = data.emailMeta.judge || {};
    this.formApplicant = data.emailMeta.applicant || {};
    this.formSupporter = data.emailMeta.supporter || {};
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
  if ( data.emailingEnabled ) {
    this.emailingEnabled = data.emailingEnabled;
  }
  if ( data.supportEnabled ) {
    this.supportEnabled = data.supportEnabled;
  }
}

_onEmailUpdate(e){
  const page = this.pages.find(p => p.value === this.page);
  if ( !page ) return;
  const data = this[page.formProperty] || {};

  const { emailPrefix, bodyTemplate, subjectTemplate, disableNotification } = e.detail;
  data[`${emailPrefix}Body`] = bodyTemplate;
  data[`${emailPrefix}Subject`] = subjectTemplate;
  data[`${emailPrefix}Disable`] = disableNotification ? 'true' : '';

  this[page.formProperty] = {...data};

}

makeEmailObject(kwargs={}){
  const { label, emailPrefix, data, notAnAutomatedEmail } = kwargs;
  return {
    label,
    notAnAutomatedEmail: notAnAutomatedEmail ? true : false,
    emailPrefix,
    disable: { prop: `${emailPrefix}Disable`, value: data[`${emailPrefix}Disable`] ? true : false },
    subject: {
      prop: `${emailPrefix}Subject`,
      value: data[`${emailPrefix}Subject`] || '',
      default: this.templateDefaults[`${emailPrefix}Subject`] || '',
      templateVariables: this.templateVariables.filter(variable => variable.fields.includes(`${emailPrefix}Subject`))
    },
    body: {
      prop: `${emailPrefix}Body`,
      value: data[`${emailPrefix}Body`] || '',
      default: this.templateDefaults[`${emailPrefix}Body`] || '',
      templateVariables: this.templateVariables.filter(variable => variable.fields.includes(`${emailPrefix}Body`))
    },
  }
}

}

customElements.define('ucdlib-awards-admin-email', UcdlibAwardsAdminEmail);
