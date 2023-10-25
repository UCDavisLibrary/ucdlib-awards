import { LitElement } from 'lit';
import { render } from "./ucdlib-awards-email-template.tpl.js";

import Mixin from "@ucd-lib/theme-elements/utils/mixins/mixin.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

export default class UcdlibAwardsEmailTemplate extends Mixin(LitElement)
  .with(MainDomElement) {

  static get properties() {
    return {
      emailPrefix: { type: String },
      defaultSubjectTemplate: { type: String },
      defaultBodyTemplate: { type: String },
      subjectTemplate: { type: String },
      bodyTemplate: { type: String },
      disableNotification: { type: Boolean },
      templateVariables: { type: Array },
      notAnAutomatedEmail: { type: Boolean },
      _subjectTemplate: { state: true },
      _bodyTemplate: { state: true },
      isDefaultBodyTemplate: { state: true },
      isDefaultSubjectTemplate: { state: true },
      _selectionPositionHistory: { state: true }
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.defaultSubjectTemplate = '';
    this.defaultBodyTemplate = '';
    this.subjectTemplate = '';
    this.bodyTemplate = '';
    this.disableNotification = false;
    this.templateVariables = [];
    this._subjectTemplate = '';
    this._bodyTemplate = '';
    this.isDefaultBodyTemplate = false;
    this.isDefaultSubjectTemplate = false;
    this.notAnAutomatedEmail = false;
    this.emailPrefix = '';
    this._selectionPositionHistory = [];
    this._selectionPositionHistoryMax = 10;
  }

  willUpdate(props) {
    if ( props.has('subjectTemplate') || props.has('defaultSubjectTemplate') ) {
      this._subjectTemplate = this.subjectTemplate || this.defaultSubjectTemplate;
    }
    if ( props.has('bodyTemplate') || props.has('defaultBodyTemplate') ) {
      this._bodyTemplate = this.bodyTemplate || this.defaultBodyTemplate;
    }
    if ( props.has('_bodyTemplate') ) {
      this.isDefaultBodyTemplate = this._bodyTemplate.trim() === this.defaultBodyTemplate.trim();
    }
    if ( props.has('_subjectTemplate') ) {
      this.isDefaultSubjectTemplate = this._subjectTemplate.trim() === this.defaultSubjectTemplate.trim();
    }
  }

  _onTemplateFocus(e) {
    const template = e.target.getAttribute('email-template');
    if ( !template ) return;
    const selectionStart = e.target.selectionStart;
    const selectionEnd = e.target.selectionEnd;
    this._selectionPositionHistory.push({ template, selectionStart, selectionEnd });
    if ( this._selectionPositionHistory.length > this._selectionPositionHistoryMax ) {
      this._selectionPositionHistory.shift();
    }
  }

  async _onFormInput(template, newValue){
    this[template] = newValue;
    await this.updateComplete;
    this.dispatchUpdateEvent();
  }

  _onTemplateRevert(template){
    if ( template === 'subject' ) {
      this._onFormInput('_subjectTemplate', this.defaultSubjectTemplate);
    } else {
      this._onFormInput('_bodyTemplate', this.defaultBodyTemplate);
    }
  }


  _onVariableSelect(e){
    if ( !e.target.value ) return;
    const v = `{{${e.target.value}}}`;
    let position;
    if ( this._selectionPositionHistory.length ) {
      position = this._selectionPositionHistory[this._selectionPositionHistory.length-1];
    } else {
      position = { selectionStart: 0, selectionEnd: 0, template: 'subject' };
    }
    const template = position.template === 'subject' ? '_subjectTemplate' : '_bodyTemplate';
    const value = this[template];
    const newValue = value.substring(0, position.selectionStart) + v + value.substring(position.selectionEnd);
    this._onFormInput(template, newValue);

    // return focus to input and set cursor position
    const ele = this.renderRoot.querySelector(`input[email-template=${position.template}]`);
    ele.focus();
    setTimeout(() => {
      ele.setSelectionRange(position.selectionStart + v.length, position.selectionStart + v.length);
    }, 100);

    // reset variable select
    e.target.value = '';

  }

  _onDisableToggle(){
    this.disableNotification = !this.disableNotification;
    this.dispatchUpdateEvent();
  }

  dispatchUpdateEvent() {
    this.dispatchEvent(new CustomEvent('email-update', {
      bubbles: true,
      composed: true,
      detail: {
        emailPrefix: this.emailPrefix,
        subjectTemplate: this.isDefaultSubjectTemplate ? '' : this._subjectTemplate,
        bodyTemplate: this.isDefaultBodyTemplate ? '' : this._bodyTemplate,
        disableNotification: this.disableNotification
      }
    }));
  }

}

customElements.define('ucdlib-awards-email-template', UcdlibAwardsEmailTemplate);
