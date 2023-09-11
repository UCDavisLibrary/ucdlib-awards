import { LitElement } from 'lit';
import * as templates from "./ucdlib-awards-admin-cycles.tpl.js";
import wpAjaxController from "../../controllers/wp-ajax.js";

import Mixin from "@ucd-lib/theme-elements/utils/mixins/mixin.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { MutationObserverController } from '@ucd-lib/theme-elements/utils/controllers/index.js';


export default class UcdlibAwardsAdminCycles extends Mixin(LitElement)
  .with(MainDomElement) {

  static get properties() {
    return {
      requestedCycle: {state: true},
      hasRequestedCycle: {state: true},
      activeCycle: {state: true},
      siteForms: {state: true},
      formsLink: {type: String},
      page: {state: true},
      editFormData: {state: true},
      editFormErrors: {state: true},
      editFormErrorMessages: {state: true}
    }
  }

  constructor() {
    super();
    this.render = templates.render.bind(this);
    this.renderEditForm = templates.renderEditForm.bind(this);
    this.requestedCycle = {};
    this.activeCycle = {};
    this.editFormData = {};
    this.editFormErrors = {};
    this.siteForms = [];
    this.formsLink = '';
    this.page = 'view';
    this.editFormErrorMessages = [];

    this.mutationObserver = new MutationObserverController(this);
    this.wpAjax = new wpAjaxController(this);
  }

  willUpdate(props){
    if ( props.has('requestedCycle') ) {
      this.hasRequestedCycle = Object.keys(this.requestedCycle).length > 0;
    }
    if ( props.has('activeCycle') ) {
      this.hasActiveCycle = Object.keys(this.activeCycle).length > 0;
    }
  }

  _onEditFormInput(prop, value){
    if ( !this.editFormData ) this.editFormData = {};
    this.editFormData[prop] = value;
    this.editFormErrors[prop] = false;
    this.requestUpdate();
  }

  async _onEditFormSubmit(e){
    e.preventDefault();
    this.editFormErrors = {};
    this.editFormErrorMessages = [];
    console.log('submit', this.editFormData);
    const subAction = this.page;
    const response = await this.wpAjax.request(subAction, this.editFormData);
    if ( response.success ) {
      // emit event to parent so that it can update the cycles list
      this.dispatchEvent(new CustomEvent('cycle-update', {
        bubbles: true,
        composed: true
      }));

      if ( this.editFormData.is_active ) {
        this.activeCycle = response.data.cycle;
      }

      if ( subAction === 'edit' ){
        this.requestedCycle = response.data.cycle;
        this.editFormData = {};
        this.page = 'view';
        // emit toast event
      } else if ( subAction === 'add' ) {
        this.editFormData = {};
        this.page = 'view';
        // emit toast event
      } else {
        console.error('Unknown subAction', subAction);
      }
    } else {
      window.scrollTo({top: 0, behavior: 'smooth'});
      this.editFormErrors = response.errorFields;
      this.editFormErrorMessages = response.messages;
    }
    console.log('response', response);
  }

  _onChildListMutation(){
    Array.from(this.children).forEach(child => {
      if ( child.nodeName === 'SCRIPT' && child.type === 'application/json' ) {
        this._parsePropsScript(child);
        return;
      }
    });
  }

  _onEditFormCancel(){
    this.editFormData = {};
    this.page = 'view';
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  _onEditFormClick(){
    if ( this.page === 'edit' ) return;
    this._setFormDataFromCycle();
    this.page = 'edit';
  }

  _onAddFormClick(){
    if ( this.page === 'add' ) return;
    this.editFormData = {};
    this.page = 'add';
  }

  _setFormDataFromCycle(cycle){
    if ( !cycle ) cycle = {...this.requestedCycle};
    const dates = [
      'application_start',
      'application_end',
      'evaluation_start',
      'evaluation_end',
      'support_start',
      'support_end'
    ]
    dates.forEach(date => {
      if ( cycle[date] ) {
        cycle[date] = cycle[date].split(' ')[0];
      }
    });
    this.editFormData = {...cycle};
  }

  _parsePropsScript(script){
    let data = {};
    try {
      data = JSON.parse(script.text);
    } catch(e) {
      console.error('Error parsing JSON script', e);
    }
    if ( !data ) return;
    if ( data.activeCycle ) {
      this.activeCycle = data.activeCycle;
    } else {
      this.editFormData.is_active = true;
    }
    if ( data.formsLink ) this.formsLink = data.formsLink;
    if ( data.siteForms ) this.siteForms = data.siteForms;
    if ( data.requestedCycle ) {
      this.requestedCycle = data.requestedCycle;
      this.page = 'view';
    } else {
      this.page = 'add';
    }

  }

}

customElements.define('ucdlib-awards-admin-cycles', UcdlibAwardsAdminCycles);
