import { LitElement } from 'lit';
import {render} from "./ucdlib-awards-supporters-actions.tpl.js";

import Mixin from "@ucd-lib/theme-elements/utils/mixins/mixin.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

export default class UcdlibAwardsSupportersActions extends Mixin(LitElement)
  .with(MainDomElement) {

  static get properties() {
    return {
      actions: { type: Array },
      selectedAction: { type: String},
      selectedSupporters: { type: Array },
      disableActionSubmit: { type: Boolean },
      doingAction: { type: Boolean },
      _actions: {state: true}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.selectedAction = '';
    this.selectedSupporters = [];
    this.disableActionSubmit = false;
    this.doingAction = false;

    this.actions = [
      {
        label: 'Delete Submission',
        slug: 'delete',
        bulk: true
      },
      {
        label: 'Download Submission',
        slug: 'getSubmission',
        bulk: true
      },
      {
        label: 'Send Email Reminder',
        slug: 'send-reminder',
        bulk: true
      }
    ];
  }

  willUpdate(props) {

    if ( props.has('actions') || props.has('selectedAction') || props.has('selectedSupporters')){
      let disableActionSubmit = !this.selectedSupporters.length || !this.selectedAction;
      const placeholder = {
        label: 'Select an action',
        slug: '',
        bulk: false
      }
      this._actions = [placeholder, ...this.actions].map(action => {
        action = {...action};
        action.selected = action.slug === this.selectedAction;

        if ( !action.slug || !this.selectedSupporters.length ) action.disabled = true;
        if ( !action.bulk && this.selectedSupporters.length > 1 ) {
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

customElements.define('ucdlib-awards-supporters-actions', UcdlibAwardsSupportersActions);
