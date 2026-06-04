import { LitElement } from 'lit';
import * as templates from "./ucdlib-awards-judges-actions.tpl.js";

import Mixin from "@ucd-lib/theme-elements/utils/mixins/mixin.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

export default class UcdlibAwardsJudgesActions extends Mixin(LitElement)
  .with(MainDomElement) {

  static get properties() {
    return {
      newJudgeData: { type: Object },
      newJudgeDataIsValid: { type: Boolean },
      addingNewJudge: { type: Boolean },
      selectedAction: { type: String},
      categories: { type: Array },
      judgeCt: { type: Number },
      selectedJudges: { type: Array },
      _actions: {state: true},
      actions: { type: Array },
      doingAction: { type: Boolean },
      disableActionSubmit: { type: Boolean },
      applicants: { type: Array },
      selectedApplicants: { type: Array },
      showApplicantsSelect: { type: Boolean },
      selectedCategory: { type: String },
      fetchingPreviousJudges: { state: true },
      historicalJudges: { type: Array }
    }
  }

  constructor() {
    super();
    this.render = templates.render.bind(this);
    this.renderNewJudgePanel = templates.renderNewJudgePanel.bind(this);
    this.renderActionPanel = templates.renderActionPanel.bind(this);

    this.newJudgeData = {};
    this.newJudgeDataIsValid = false;
    this.selectedAction = '';
    this.addingNewJudge = false;
    this.categories = [];
    this.judgeCt = 0;
    this.selectedJudges = [];
    this.disableActionSubmit = false;
    this.applicants = [];
    this.showApplicantsSelect = false;
    this.selectedApplicants = [];
    this.doingAction = false;
    this.selectedCategory = '';
    this.fetchingPreviousJudges = false;
    this.historicalJudges = [];

    this._actions = [];
    this.actions = [
      {
        label: 'Delete Reviewer',
        slug: 'delete',
        bulk: true,
        applicants: false
      },
      {
        label: 'Assign Applications',
        slug: 'assign',
        bulk: true,
        applicants: true
      },
      {
        label: 'View Assignments',
        slug: 'view-assignments',
        bulk: true,
        applicants: false
      },
      {
        label: 'Unassign Applications',
        slug: 'unassign',
        bulk: true,
        applicants: true
      },
      {
        label: 'Send Email Reminder',
        slug: 'send-reminder',
        bulk: true
      },
      {
        label: 'Update Category',
        slug: 'update-category',
        bulk: true
      }
    ];
  }

  willUpdate(props) {

    if ( props.has('actions') || props.has('selectedAction') || props.has('selectedJudges')){
      let disableActionSubmit = !this.selectedJudges.length || !this.selectedAction;
      const placeholder = {
        label: 'Select an action',
        slug: '',
        bulk: false
      }
      this._actions = [placeholder, ...this.actions].map(action => {
        action = {...action};
        action.selected = action.slug === this.selectedAction;

        if ( !action.slug || !this.selectedJudges.length ) action.disabled = true;
        if ( action.slug === 'update-category' && !this.categories.length ) {
          return null;
        }
        if ( !action.bulk && this.selectedJudges.length > 1 ) {
          action.disabled = true;
          if ( action.selected ) {
            disableActionSubmit = true;
          }
        }
        return action;
      }).filter(action => action);
      this.disableActionSubmit = disableActionSubmit;
    }

    if ( props.has('selectedAction') ) {
      const actions = this.actions.filter(action => action.applicants).map(action => action.slug);
      this.showApplicantsSelect = actions.includes(this.selectedAction);
    }
  }

  get allCycles(){
    if ( this._allCycles ) return this._allCycles;
    const parent = this.closest('ucdlib-awards-page');
    if ( !parent?.cycles ) {
      console.error('Unable to find parent page element with cycles property');
      return [];
    }
    this._allCycles = parent.cycles;
    return this._allCycles;
  }


  get wpAjax(){
    if ( this._wpAjax ) return this._wpAjax;
    const parent = this.closest('ucdlib-awards-judges-ctl');
    if ( !parent?.wpAjax ) {
      console.error('Unable to find parent controller element');
      return null;
    }
    this._wpAjax = parent.wpAjax;
    return this._wpAjax;
  }

  _onApplicantsSelect(e){
    this.selectedApplicants = e.detail.map(applicant => applicant.value);
  }

  _onNewJudgeInput(prop, value){
    this.newJudgeData[prop] = value;
    this.newJudgeDataIsValid = this.validateNewJudgeData();
    this.requestUpdate();
  }

  _onNewJudgeSubmit(e) {
    e.preventDefault();
    this.addingNewJudge = true;
    this.dispatchEvent(new CustomEvent('add-judge', {
      detail: this.newJudgeData
    }));
  }

  _onCopyJudgeCategoryChange(judge, categoryValue){
    this.historicalJudges = this.historicalJudges.map(j => {
      if ( j.data.user_id === judge.data.user_id ) {
        return {
          ...j, 
          category: this.categories.find(c => c.value == categoryValue) || null
        };
      }
      return j;
    });
  }

  async _onCopyJudgeClick(){
    if ( this.fetchingPreviousJudges ) return;
    this.fetchingPreviousJudges = true;

    const payload = {
      exclude_current_cycle: this.wpAjax.host.cycleId
    }
    const response = await this.wpAjax.request('get-all-judges', payload);
    if ( response.success ) {

      this.historicalJudges = response.data.judges.map( judge => {
        const d = {
          name: `${judge.first_name || ''} ${judge.last_name || ''}`.trim() || judge.email,
          data: judge,
          selected: false,
          hidden: false,
          category: this.categories.find(c => judge.categories?.some(jc => jc.category === c.value)) || null
        }
        return d;
      }).sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        if ( aName < bName ) return -1;
        if ( aName > bName ) return 1;
        return 0;
      });

      this.renderRoot.querySelector('ucdlib-awards-modal').show();
    } else {
      console.error('Unable to fetch previous judges', response);
      let msg = 'Unable to fetch previous judges';
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

    this.fetchingPreviousJudges = false;
  }

  _toggleHistoricalJudgeSelect(judgeId){
    this.historicalJudges = this.historicalJudges.map(j => {
      if ( j.data.user_id === judgeId ) {
        return {...j, selected: !j.selected};
      }
      return j;
    });
  }

  _toggleSelectAllHistoricalJudges(){
    const allSelected = this.historicalJudges.filter(j => !j.hidden).every(j => j.selected);
    this.historicalJudges = this.historicalJudges.map(j => {
      if ( j.hidden ) return j;
      return {...j, selected: !allSelected};
    });
  }

  _onActionSubmit(e){
    e.preventDefault();

    const action = this.actions.find(action => action.slug === this.selectedAction);
    if ( !action ) {
      console.error('Unable to find action', this.selectedAction);
      return;
    }

    const detail = {
      action: this.selectedAction
    }
    if ( action.applicants ) detail.applicants = this.selectedApplicants;
    if ( action.slug === 'update-category' ) detail.category = this.selectedCategory;

    this.dispatchEvent(new CustomEvent('action-submit', {detail}));
  }

  validateNewJudgeData(){
    const requiredProps = ['first_name', 'last_name', 'email'];
    if ( this.categories.length ) requiredProps.push('category');
    return requiredProps.every(prop => this.newJudgeData[prop]);
  }

}

customElements.define('ucdlib-awards-judges-actions', UcdlibAwardsJudgesActions);
