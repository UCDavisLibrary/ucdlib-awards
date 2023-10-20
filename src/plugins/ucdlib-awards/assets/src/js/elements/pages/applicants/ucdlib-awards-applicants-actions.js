import { LitElement } from 'lit';
import * as templates from "./ucdlib-awards-applicants-actions.tpl.js";

import Mixin from "@ucd-lib/theme-elements/utils/mixins/mixin.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

export default class UcdlibAwardsApplicantsActions extends Mixin(LitElement)
  .with(MainDomElement) {

  static get properties() {
    return {
      searchQuery: { type: String },
      actions: { type: Array },
      selectedAction: { type: String},
      selectedApplicants: { type: Array },
      disableActionSubmit: { type: Boolean },
      doingAction: { type: Boolean },
      _actions: {state: true}
    }
  }

  constructor() {
    super();
    this.render = templates.render.bind(this);
    this.renderSearchPanel = templates.renderSearchPanel.bind(this);
    this.renderActionPanel = templates.renderActionPanel.bind(this);
    this.searchQuery = '';
    this.selectedAction = '';
    this.selectedApplicants = [];
    this.disableActionSubmit = false;
    this.doingAction = false;

    this.actions = [
      {
        label: 'Delete',
        slug: 'delete',
        bulk: true
      },
      {
        label: 'Download Applications',
        slug: 'getApplications',
        bulk: true
      }
    ];
  }

  willUpdate(props) {

    if ( props.has('actions') || props.has('selectedAction') || props.has('selectedApplicants')){
      let disableActionSubmit = !this.selectedApplicants.length || !this.selectedAction;
      const placeholder = {
        label: 'Select an action',
        slug: '',
        bulk: false
      }
      this._actions = [placeholder, ...this.actions].map(action => {
        action = {...action};
        action.selected = action.slug === this.selectedAction;

        if ( !action.slug || !this.selectedApplicants.length ) action.disabled = true;
        if ( !action.bulk && this.selectedApplicants.length > 1 ) {
          action.disabled = true;
          if ( action.selected ) {
            disableActionSubmit = true;
          }
        }
        return action;
      });
      this.disableActionSubmit = disableActionSubmit;
    }
  }

  _onSearchInput(e) {
    this.searchQuery = e.target.value;
    this.dispatchEvent(new CustomEvent('search-query-change', {
      detail: {
        searchQuery: this.searchQuery
      }
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

    this.dispatchEvent(new CustomEvent('action-submit', {detail}));
  }

}

customElements.define('ucdlib-awards-applicants-actions', UcdlibAwardsApplicantsActions);
