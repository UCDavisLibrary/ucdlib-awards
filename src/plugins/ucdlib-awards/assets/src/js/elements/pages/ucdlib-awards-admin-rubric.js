import { LitElement } from 'lit';
import * as templates from "./ucdlib-awards-admin-rubric.tpl.js";

import wpAjaxController from "../../controllers/wp-ajax.js";

import Mixin from "@ucd-lib/theme-elements/utils/mixins/mixin.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { MutationObserverController } from '@ucd-lib/theme-elements/utils/controllers/index.js';

export default class UcdlibAwardsAdminRubric extends Mixin(LitElement)
  .with(MainDomElement) {

  static get properties() {
    return {
      page: { type: String },
      rubricItems: { type: Array },
      editedRubricItems: { type: Array },
      cyclesWithRubric: { type: Array },
      hasRubric: { type: Boolean },
      errorMessages: { type: Array },
      fieldsWithErrors: { type: Object }
    }
  }

  constructor() {
    super();
    this.render = templates.render.bind(this);
    this.renderNoRubric = templates.renderNoRubric.bind(this);
    this.renderForm = templates.renderForm.bind(this);
    this.renderFormItem = templates.renderFormItem.bind(this);
    this.renderUploadPanel = templates.renderUploadPanel.bind(this);

    this.page = 'main';
    this.cyclesWithRubric = [];
    this.rubricItems = [];
    this.editedRubricItems = [];
    this.hasRubric = false;
    this.errorMessages = [];
    this.fieldsWithErrors = {};

    this.mutationObserver = new MutationObserverController(this);
    this.wpAjax = new wpAjaxController(this);
  }

  willUpdate(props){
    if ( props.has('rubricItems') ){
      this.editedRubricItems = JSON.parse(JSON.stringify(this.rubricItems));
    }
  }

  _onFormInput(itemIndex, prop, value){
    if ( itemIndex == 0 && !this.editedRubricItems.length ) {
      this.editedRubricItems.push({});
    }

    const ints = ['range_min', 'range_max', 'range_step', 'weight'];
    if ( ints.includes(prop) ) value = parseInt(value);

    this.editedRubricItems[itemIndex][prop] = value;
    this.requestUpdate();
  }

  async _onFormSubmit(e){
    e.preventDefault();
    this.errorMessages = [];
    this.fieldsWithErrors = {};
    console.log('submit', this.editedRubricItems);

    const payload = this.editedRubricItems.map(item => {
      const newItem = {};
      Object.keys(item).forEach(key => {
        if ( item[key] !== null || item[key] !== undefined ) {
          newItem[key] = item[key];
        }
      });
      return newItem;
    });
    const response = await this.wpAjax.request('updateItems', payload);
    console.log('response', response);

    if ( response.success ) {

    } else {
      window.scrollTo({top: 0, behavior: 'smooth'});
      this.fieldsWithErrors = response.errorFields;
      this.errorMessages = response.messages;
    }
  }

  _onNewRubricClick(action){
    if ( action === 'copy' ) {
      // do stuff
    } else if ( action === 'create' ) {
      // do stuff
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
    if ( data.cyclesWithRubric ) this.cyclesWithRubric = data.cyclesWithRubric;
    if ( data.rubricItems ) {
      this.rubricItems = data.rubricItems
    }
    this.hasRubric = this.rubricItems.length > 0;

    if ( !this.rubricItems.length && this.cyclesWithRubric.length ){
      this.page = 'no-rubric';
    }
    console.log('data', data);

  }

}

customElements.define('ucdlib-awards-admin-rubric', UcdlibAwardsAdminRubric);
