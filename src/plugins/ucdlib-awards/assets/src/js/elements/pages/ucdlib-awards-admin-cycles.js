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
      // TODO: emit event to parent so that it can update the cycles list

      // this.activeCycle = response.data.activeCycle;

      // set success message

      if ( subAction === 'edit' ){
        //this.requestedCycle = response.data.cycle;
        //this.editFormData = response.data.cycle;
        //this.page = 'view';
      } else if ( subAction === 'add' ) {
        //this.editFormData = response.data;
        //this.page = 'view';
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
