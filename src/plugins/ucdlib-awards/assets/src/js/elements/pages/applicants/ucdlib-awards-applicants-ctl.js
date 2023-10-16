import { LitElement } from 'lit';
import  * as templates from "./ucdlib-awards-applicants-ctl.tpl.js";
import wpAjaxController from "../../../controllers/wp-ajax.js";

import Mixin from "@ucd-lib/theme-elements/utils/mixins/mixin.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { MutationObserverController } from '@ucd-lib/theme-elements/utils/controllers/index.js';

import "./ucdlib-awards-applicants-display.js";
import "./ucdlib-awards-applicants-actions.js";


export default class UcdlibAwardsApplicantsCtl extends Mixin(LitElement)
  .with(MainDomElement) {


  static get properties() {
    return {
      categories: { type: Array },
      hasCategories: { type: Boolean },
      applicants: { type: Array },
      displayedApplicants: { type: Array },
      selectedApplicants: { type: Array },
      doingAction: { type: Boolean },
      cycleId: { type: Number }
    }
  }

  constructor() {
    super();
    this.render = templates.render.bind(this);

    this.mutationObserver = new MutationObserverController(this);
    this.wpAjax = new wpAjaxController(this);

    this.categories = [];
    this.hasCategories = false;
    this.applicants = [];
    this.displayedApplicants = [];
    this.selectedApplicants = [];
    this.doingAction = false;
    this.cycleId = 0;
  }

  willUpdate(props) {
    if ( props.has('categories') ) {
      this.hasCategories = this.categories.length > 0;
    }
  }

  _onSearchQueryChange(e) {
    const query = e.detail.searchQuery;
    this.selectedApplicants = [];
    if ( query === '' ) {
      this.displayedApplicants = [...this.applicants];
      return;
    }
    this.displayedApplicants = this.applicants.filter(applicant => {
      const name = applicant.name.toLowerCase().includes(query.toLowerCase());
      const category = applicant.category.toLowerCase().includes(query.toLowerCase());
      return name || category;
    });
  }

  async _onActionSubmit(e){
    if ( this.doingAction ) return;
    this.doingAction = true;

    const action = e.detail.action;
    if ( action === 'delete' ) {
      await this.deleteSelectedApplicants();
    }

    this.selectedApplicants = [];
    this.doingAction = false;
    this.renderRoot.querySelector('ucdlib-awards-applicants-actions').selectedAction = '';
    this.renderRoot.querySelector('ucdlib-awards-applicants-display').selectedApplicants = [];
  }

  _onSelectedApplicantsChange(e) {
    this.selectedApplicants = e.detail.selectedApplicants;
  }

  async deleteSelectedApplicants(){
    const response = await this.wpAjax.request('delete', {cycle_id: this.cycleId, applicant_ids: this.selectedApplicants});
    if ( response.success ) {
      this._setApplicants(response.data.applicants);
      this.selectedApplicants = [];
      this.dispatchEvent(new CustomEvent('toast-request', {
        bubbles: true,
        composed: true,
        detail: {
          message: response.messages[0],
          type: 'success'
        }
      }));
    } else {
      console.error('Error deleting applicants', response);
      let msg = 'Unable to delete applicants';
      if ( response.messages.length) msg += `: ${response.messages?.[0] || ''}`;
      this.dispatchEvent(new CustomEvent('toast-request', {
        bubbles: true,
        composed: true,
        detail: {
          message: msg,
          type: 'error'
        }
      }));
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
    if ( data.categories ) this.categories = data.categories;
    if ( data.judges ) this.judges = data.judges;
    if ( data.cycleId ) this.cycleId = data.cycleId;
    if ( data.applicants ) {
      this._setApplicants(data.applicants);
    }
    console.log('data', data);

  }

  _setApplicants(serverResponse){
    let applicants = serverResponse.map(applicant => {
      applicant.user_id = parseInt(applicant.user_id);
      applicant.is_admin = parseInt(applicant.is_admin);
      applicant.name = `${applicant.first_name || ''} ${applicant.last_name || ''}`;
      applicant.category = applicant.applicationCategory?.label || '';
      applicant.applicationStatusLabel = applicant.applicationStatus?.label || '';
      applicant.hasConflictOfInterest = (applicant.applicationStatus?.conflictOfInterestJudgeIds || []).length > 0;
      return applicant;
    });
    this.applicants = applicants;
    this.displayedApplicants = applicants;
  }

}

customElements.define('ucdlib-awards-applicants-ctl', UcdlibAwardsApplicantsCtl);
