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
      isDefaultSubjectTemplate: { state: true }
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
  }

  willUpdate(props) {
    if ( props.has('subjectTemplate') || props.has('defaultSubjectTemplate') ) {
      this._subjectTemplate = this.subjectTemplate || this.defaultSubjectTemplate;
    }
    if ( props.has('bodyTemplate') || props.has('defaultBodyTemplate') ) {
      this._bodyTemplate = this.bodyTemplate || this.defaultBodyTemplate;
    }
    if ( props.has('_bodyTemplate') ) {
      this.isDefaultBodyTemplate = this._bodyTemplate === this.defaultBodyTemplate;
    }
    if ( props.has('_subjectTemplate') ) {
      this.isDefaultSubjectTemplate = this._subjectTemplate === this.defaultSubjectTemplate;
    }
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
        subjectTemplate: this.isDefaultSubjectTemplate ? '' : this._subjectTemplate,
        bodyTemplate: this.isDefaultBodyTemplate ? '' : this._bodyTemplate,
        disableNotification: this.disableNotification
      }
    }));
  }

}

customElements.define('ucdlib-awards-email-template', UcdlibAwardsEmailTemplate);
