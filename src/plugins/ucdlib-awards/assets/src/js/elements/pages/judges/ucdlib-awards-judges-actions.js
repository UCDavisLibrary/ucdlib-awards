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
      showApplicantsSelect: { type: Boolean }
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

    this._actions = [];
    this.actions = [
      {
        label: 'Delete Judge',
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
        if ( !action.bulk && this.selectedJudges.length > 1 ) {
          action.disabled = true;
          if ( action.selected ) {
            disableActionSubmit = true;
          }
        }
        return action;
      });
      this.disableActionSubmit = disableActionSubmit;
    }

    if ( props.has('selectedAction') ) {
      const actions = this.actions.filter(action => action.applicants).map(action => action.slug);
      this.showApplicantsSelect = actions.includes(this.selectedAction);
    }
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

    this.dispatchEvent(new CustomEvent('action-submit', {detail}));
  }

  validateNewJudgeData(){
    const requiredProps = ['first_name', 'last_name', 'email'];
    if ( this.categories.length ) requiredProps.push('category');
    return requiredProps.every(prop => this.newJudgeData[prop]);
  }

}

customElements.define('ucdlib-awards-judges-actions', UcdlibAwardsJudgesActions);
