import { LitElement } from 'lit';
import * as templates from "./ucdlib-awards-admin-cycles.tpl.js";
import wpAjaxController from "../../controllers/wp-ajax.js";

import Mixin from "@ucd-lib/theme-elements/utils/mixins/mixin.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { MutationObserverController } from '@ucd-lib/theme-elements/utils/controllers/index.js';


/**
 * @class UcdlibAwardsAdminCycles
 * @description Admin page for managing cycles.
 */
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
      deleteFormData: {state: true},
      formErrors: {state: true},
      formErrorMessages: {state: true},
      dashboardLink: {type: String},
    }
  }

  constructor() {
    super();
    this.render = templates.render.bind(this);
    this.renderEditForm = templates.renderEditForm.bind(this);
    this.renderOverview = templates.renderOverview.bind(this);
    this.renderDeleteForm = templates.renderDeleteForm.bind(this);
    this.renderFormErrorMessages = templates.renderFormErrorMessages.bind(this);
    this.requestedCycle = {};
    this.activeCycle = {};
    this.editFormData = {};
    this.deleteFormData = {};
    this.formErrors = {};
    this.formErrorMessages = [];
    this.siteForms = [];
    this.formsLink = '';
    this.page = 'view';
    this.dashboardLink = '';

    this.mutationObserver = new MutationObserverController(this);
    this.wpAjax = new wpAjaxController(this);
  }

  /**
   * @description LitElement lifecycle called when element will update
   * @param {*} props
   */
  willUpdate(props){
    if ( props.has('requestedCycle') ) {
      this.hasRequestedCycle = Object.keys(this.requestedCycle).length > 0;
    }
    if ( props.has('activeCycle') ) {
      this.hasActiveCycle = Object.keys(this.activeCycle).length > 0;
    }
  }

  /**
   * @description Callback for when an input is changed in the edit/add form
   * @param {String} prop - the property name
   * @param {String|Boolean} value - the new value of the property
   */
  _onEditFormInput(prop, value){
    if ( !this.editFormData ) this.editFormData = {};
    this.editFormData[prop] = value;
    this.formErrors[prop] = false;
    this.requestUpdate();
  }

  /**
   * @description Callback for when the edit/add form is submitted
   * Submits the form data to the wp-ajax endpoint
   * All form validation is done server-side
   * @param {Event} e - the form submit event
   */
  async _onEditFormSubmit(e){
    e.preventDefault();
    this.formErrors = {};
    this.formErrorMessages = [];
    const subAction = this.page;

    const payload = {};
    Object.keys(this.editFormData).forEach(key => {
      if ( this.editFormData[key] !== null || this.editFormData[key] !== undefined ) {
        payload[key] = this.editFormData[key];
      }
    });
    const response = await this.wpAjax.request(subAction, payload);
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
        this.dispatchEvent(new CustomEvent('toast-request', {
          bubbles: true,
          composed: true,
          detail: {
            message: 'Cycle updated',
            type: 'success'
          }
        }));
      } else if ( subAction === 'add' ) {
        this.editFormData = {};
        this.page = 'view';
        this.dispatchEvent(new CustomEvent('toast-request', {
          bubbles: true,
          composed: true,
          detail: {
            message: 'Cycle created',
            type: 'success'
          }
        }));
      } else {
        console.error('Unknown subAction', subAction);
      }
    } else {
      window.scrollTo({top: 0, behavior: 'smooth'});
      this.formErrors = response.errorFields;
      this.formErrorMessages = response.messages;
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
   * @description Callback for when the edit/add form is cancelled
   */
  _onEditFormCancel(){
    this.editFormData = {};
    this.formErrors = {};
    this.formErrorMessages = [];
    this.page = 'view';
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  /**
   * @description Callback for when the edit button is clicked
   * Displays the edit form
   * @returns
   */
  _onEditFormClick(){
    if ( this.page === 'edit' ) {
      this._onEditFormCancel();
      return;
    }
    this._setFormDataFromCycle();
    this.formErrors = {};
    this.formErrorMessages = [];
    this.page = 'edit';
  }

  /**
   * @description Callback for when the add button is clicked
   * Displays an empty edit form
   * @returns
   */
  _onAddFormClick(){
    if ( this.page === 'add' ) {
      if ( this.hasRequestedCycle ) {
        this._onEditFormCancel();
      }
      return;
    }
    this.editFormData = {};
    this.formErrors = {};
    this.formErrorMessages = [];
    this.page = 'add';
  }

  /**
   * @description Callback for when an input is changed in the delete form
   * @param {String} prop - the property name
   * @param {String} value - the new value of the property
   */
  _onDeleteFormInput(prop, value){
    if ( !this.deleteFormData ) this.deleteFormData = {};
    if ( !this.formErrors ) this.formErrors = {};
    this.deleteFormData[prop] = value;
    this.formErrors[prop] = false;
    this.requestUpdate();
  }

  /**
   * @description Callback for when the delete form is cancelled
   */
  _onDeleteFormCancel(){
    this.deleteFormData = {};
    this.formErrors = {};
    this.formErrorMessages = [];
    this.page = 'view';
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  /**
   * @description Callback for when the delete button is clicked
   * Displays the delete form
   * @returns
   */
  _onDeleteFormClick(){
    if ( this.page === 'delete' ) {
      this. _onDeleteFormCancel();
      return;
    }
    this.deleteFormData = {
      cycle_id: this.requestedCycle.cycle_id,
      title: this.requestedCycle.title,
      title_confirm: ''
    };
    this.formErrors = {};
    this.formErrorMessages = [];
    this.page = 'delete';
  }

  /**
   * @description Callback for when the delete form is submitted
   * Submits the form data to the wp-ajax endpoint
   * All form validation is done server-side
   * @param {Event} e - the form submit event
   */
  async _onDeleteFormSubmit(e){
    e.preventDefault();
    this.formErrors = {};
    this.formErrorMessages = [];
    const response = await this.wpAjax.request('delete', this.deleteFormData);

    if ( response.success ) {
      window.location.href = this.dashboardLink;
    } else {
      window.scrollTo({top: 0, behavior: 'smooth'});
      this.formErrors = response.errorFields;
      this.formErrorMessages = response.messages;
    }
  }

  /**
   * @description Sets the edit form data from cycle data
   * @param {Object} cycle - Cycle record from the db
   */
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
    const ints = [
      'cycle_id',
      'has_support',
      'is_active',
    ];
    ints.forEach(int => {
      if ( cycle[int] ) {
        cycle[int] = parseInt(cycle[int]);
      }
    });
    this.editFormData = {...cycle};
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
    if ( data.activeCycle ) {
      this.activeCycle = data.activeCycle;
    } else {
      this.editFormData.is_active = true;
    }
    if ( data.formsLink ) this.formsLink = data.formsLink;
    if ( data.siteForms ) this.siteForms = data.siteForms;
    if ( data.dashboardLink ) this.dashboardLink = data.dashboardLink;
    if ( data.requestedCycle ) {
      this.requestedCycle = data.requestedCycle;
      this.page = 'view';
    } else {
      this.page = 'add';
    }

  }

}

customElements.define('ucdlib-awards-admin-cycles', UcdlibAwardsAdminCycles);
