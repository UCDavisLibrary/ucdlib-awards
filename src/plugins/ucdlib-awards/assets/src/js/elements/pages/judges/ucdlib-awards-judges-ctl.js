import { LitElement } from 'lit';
import * as templates from "./ucdlib-awards-judges-ctl.tpl.js";
import wpAjaxController from "../../../controllers/wp-ajax.js";

import Mixin from "@ucd-lib/theme-elements/utils/mixins/mixin.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { MutationObserverController } from '@ucd-lib/theme-elements/utils/controllers/index.js';

import "./ucdlib-awards-judges-actions.js";
import "./ucdlib-awards-judges-display.js";
import "./ucdlib-awards-judges-assignments.js";

export default class UcdlibAwardsJudgesCtl extends Mixin(LitElement)
  .with(MainDomElement) {

  static get properties() {
    return {
      categories: { type: Array },
      hasCategories: { type: Boolean },
      cycleId: { type: Number },
      judges: { type: Array },
      selectedJudges: { type: Array },
      applicants: { type: Array },
      judgeAssignmentFiltered: { type: Array },
      doingAction: { type: Boolean }
    }
  }

  constructor() {
    super();
    this.render = templates.render.bind(this);

    this.mutationObserver = new MutationObserverController(this);
    this.wpAjax = new wpAjaxController(this);

    this.categories = [];
    this.hasCategories = false;
    this.cycleId = 0;
    this.judges = [];
    this.selectedJudges = [];
    this.applicants = [];
    this.doingAction = false;
    this.judgeAssignmentFiltered = [];
  }

  willUpdate(props) {
    if ( props.has('categories') ) {
      this.hasCategories = this.categories.length > 0;
    }

    if ( props.has('judges') ){
      this._parseJudges();
    }
  }

  _parseJudges(){
    this.judges = (this.judges || []).map(judge => {
      judge.assignments = judge.assignments || [];
      judge.completedEvaluations = judge.completedEvaluations || [];
      judge.conflictsOfInterest = judge.conflictsOfInterest || [];

      judge.assignedAndEvaluated = judge.completedEvaluations.filter(e => judge.assignments.includes(e));
      judge.assignedAndHasConflict = judge.conflictsOfInterest.filter(c => judge.assignments.includes(c));

      judge.assignedCt = judge.assignments.length || 0;
      judge.evaluatedCt = judge.assignedAndEvaluated.length || 0;
      judge.hasConflictOfInterest = judge.assignedAndHasConflict.length > 0;
      return judge;
    });
  }

  async _onAddJudge(e){
    const ele = e.target;
    if ( !e.detail || !ele ) return;


    const payload = {
      cycle_id: this.cycleId,
      judge: e.detail
    }
    const response = await this.wpAjax.request('add', payload);
    if ( response.success ) {

      ele.newJudgeData = {};
      ele.newJudgeDataIsValid = false;
      this.judges = response.data.judges;

      this.dispatchEvent(new CustomEvent('toast-request', {
        bubbles: true,
        composed: true,
        detail: {
          message: 'Judge Added',
          type: 'success'
        }
      }));

    } else {
      console.error('Error adding judge', response);
      let msg = 'Unable to add judge';
      if ( response.messages.length) msg += `: ${response.messages[0]}`;
      this.dispatchEvent(new CustomEvent('toast-request', {
        bubbles: true,
        composed: true,
        detail: {
          message: msg,
          type: 'error'
        }
      }));

    }

    ele.addingNewJudge = false;
  }

  async _onActionSubmit(e){
    if ( this.doingAction ) return;
    this.doingAction = true;

    const action = e.detail.action;
    if ( action === 'delete' ) {
      await this.deleteSelectedJudges();
    } else if ( action === 'assign' ) {
      await this.assignApplicants(e.detail.applicants);
    } else if ( action === 'unassign' ) {
      await this.unassignApplicants(e.detail.applicants);
    } else if ( action === 'view-assignments' ) {
      this.judgeAssignmentFiltered = this.judges.filter(judge => this.selectedJudges.includes(judge.id));
      this.renderRoot.querySelector('ucdlib-awards-judges-assignments').show();
      this.doingAction  = false;
      return;
    } else if ( action === 'send-reminder' ) {
      await this.sendEmailReminder();
    }

    this.selectedJudges = [];
    this.doingAction = false;
    this.renderRoot.querySelector('ucdlib-awards-judges-actions').selectedAction = '';
    this.renderRoot.querySelector('ucdlib-awards-judges-display').selectedJudges = [];
  }

  async sendEmailReminder(){
    const payload = {
      cycle_id: this.cycleId,
      judge_ids: this.selectedJudges
    }
    const response = await this.wpAjax.request('send-email-reminder', payload);
    if ( response.success ) {
      this.dispatchEvent(new CustomEvent('toast-request', {
        bubbles: true,
        composed: true,
        detail: {
          message: response.messages[0],
          type: 'success'
        }
      }));
    } else {
      console.error('Error sending email reminder', response);
      let msg = 'Unable to send email reminder';
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

  async unassignApplicants(applicants){
    const payload = {
      cycle_id: this.cycleId,
      judge_ids: this.selectedJudges,
      applicant_ids: applicants
    }
    const response = await this.wpAjax.request('unassign', payload);
    this.renderRoot.querySelector('ucdlib-awards-judges-actions').selectedApplicants = [];
    if ( response.success ) {
      this.judges = response.data.judges;
      this.dispatchEvent(new CustomEvent('toast-request', {
        bubbles: true,
        composed: true,
        detail: {
          message: response.messages[0],
          type: 'success'
        }
      }));
    } else {
      console.error('Error unassigning applicants', response);
      let msg = 'Unable to unassign applicants';
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

  async assignApplicants(applicants){
    const payload = {
      cycle_id: this.cycleId,
      judge_ids: this.selectedJudges,
      applicant_ids: applicants
    }
    const response = await this.wpAjax.request('assign', payload);
    this.renderRoot.querySelector('ucdlib-awards-judges-actions').selectedApplicants = [];
    if ( response.success ) {
      this.judges = response.data.judges;
      this.dispatchEvent(new CustomEvent('toast-request', {
        bubbles: true,
        composed: true,
        detail: {
          message: response.messages[0],
          type: 'success'
        }
      }));
    } else {
      console.error('Error assigning applicants', response);
      let msg = 'Unable to assign applicants';
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

  async deleteSelectedJudges(){
    const response = await this.wpAjax.request('delete', {cycle_id: this.cycleId, judge_ids: this.selectedJudges});
    if ( response.success ) {
      this.judges = response.data.judges;
      this.selectedJudges = [];
      this.dispatchEvent(new CustomEvent('toast-request', {
        bubbles: true,
        composed: true,
        detail: {
          message: response.messages[0],
          type: 'success'
        }
      }));
    } else {
      console.error('Error deleting judges', response);
      let msg = 'Unable to delete judges';
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

  _onSelectedJudgesChange(e) {
    this.selectedJudges = e.detail.selectedJudges;
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
    if ( data.cycleId ) this.cycleId = data.cycleId;
    if ( data.judges ) this.judges = data.judges;
    if ( data.applicants ) this.applicants = data.applicants;

  }

}

customElements.define('ucdlib-awards-judges-ctl', UcdlibAwardsJudgesCtl);
