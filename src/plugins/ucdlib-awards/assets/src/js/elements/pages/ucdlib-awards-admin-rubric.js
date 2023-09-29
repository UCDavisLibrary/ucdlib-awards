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
      fieldsWithErrors: { type: Object },
      cycleId: { type: Number},
      expandedItems: { type: Array },
      cycleToCopyId: { type: Number },
      copyFormDisabled: { type: Boolean }
    }
  }

  constructor() {
    super();
    this.render = templates.render.bind(this);
    this.renderNoRubric = templates.renderNoRubric.bind(this);
    this.renderForm = templates.renderForm.bind(this);
    this.renderFormItem = templates.renderFormItem.bind(this);
    this.renderUploadPanel = templates.renderUploadPanel.bind(this);
    this.renderInsertBar = templates.renderInsertBar.bind(this);
    this.renderCalculationPanel = templates.renderCalculationPanel.bind(this);
    this.renderCopyRubricForm = templates.renderCopyRubricForm.bind(this);

    this.page = 'main';
    this.cyclesWithRubric = [];
    this.rubricItems = [];
    this.editedRubricItems = [];
    this.hasRubric = false;
    this.errorMessages = [];
    this.fieldsWithErrors = {};
    this.cycleId = 0;
    this.expandedItems = [];
    this.cycleToCopyId = 0;
    this.copyFormDisabled = false;

    this.mutationObserver = new MutationObserverController(this);
    this.wpAjax = new wpAjaxController(this);
  }

  willUpdate(props){
    if ( props.has('rubricItems') ){
      this.editedRubricItems = JSON.parse(JSON.stringify(this.rubricItems));
    }
  }

  _onToggleExpand(index){
    if ( this.expandedItems.includes(index) ) {
      this.expandedItems = this.expandedItems.filter(i => i !== index);
    } else {
      this.expandedItems.push(index);
    }
    this.requestUpdate();
  }

  _onFormInput(itemIndex, prop, value){
    if ( itemIndex == 0 && !this.editedRubricItems.length ) {
      this.editedRubricItems.push({});
    }

    if ( this.fieldsWithErrors[prop] && Array.isArray(this.fieldsWithErrors[prop]) ) {
      this.fieldsWithErrors[prop] = this.fieldsWithErrors[prop].filter(i => i !== itemIndex);
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
      const newItem = {
        cycle_id: this.cycleId
      };
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
      this.rubricItems = response.data.rubricItems;
      this.dispatchEvent(new CustomEvent('toast-request', {
        bubbles: true,
        composed: true,
        detail: {
          message: 'Rubric updated',
          type: 'success'
        }
      }));

    } else {
      window.scrollTo({top: 0, behavior: 'smooth'});
      this.fieldsWithErrors = response.errorFields;
      Object.values(this.fieldsWithErrors).forEach(items => {
        if ( Array.isArray(items) ) {
          items.forEach(item => {
            if ( !this.expandedItems.includes(item) ) {
              this.expandedItems.push(item);
            }
          });
        }
      });
      this.errorMessages = response.messages;
    }
  }

  _onInsertItem(index){
    this.editedRubricItems.splice(index, 0, {});
    const expandedItems = this.expandedItems.map(i => {
      if ( i >= index ) return i+1;
      return i;
    });
    expandedItems.push(index);
    this.expandedItems = expandedItems;
    this.requestUpdate();
  }

  _onDeleteItem(index){
    this.editedRubricItems.splice(index, 1);
    const expandedItems = this.expandedItems.filter(i => i !== index).map(i => {
      if ( i >= index ) return i-1;
      return i;
    });
    this.expandedItems = expandedItems;
    if ( !this.editedRubricItems.length ) {
      this.hasRubric = false;
    }
    this.requestUpdate();
  }

  _onMoveItem(index, direction){
    if ( direction === 'up' ) {
      const item = this.editedRubricItems.splice(index, 1)[0];
      this.editedRubricItems.splice(index-1, 0, item);
    } else {
      const item = this.editedRubricItems.splice(index, 1)[0];
      this.editedRubricItems.splice(index+1, 0, item);
    }
    const expandedItems = this.expandedItems.map(i => {
      if ( i === index ) return direction === 'up' ? i-1 : i+1;
      if ( i === index-1 ) return direction === 'up' ? i+1 : i-1;
      return i;
    });
    this.expandedItems = expandedItems;
    this.requestUpdate();
  }

  _onNewRubricClick(action){
    if ( action === 'copy' ) {
      this.page = 'copy';
    } else if ( action === 'create' ) {
      this.page = 'main';
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
    if ( data.cycleId ) this.cycleId = parseInt(data.cycleId);
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
