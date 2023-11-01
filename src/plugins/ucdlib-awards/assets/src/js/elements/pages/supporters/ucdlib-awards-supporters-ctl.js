import { LitElement } from 'lit';
import {render} from "./ucdlib-awards-supporters-ctl.tpl.js";

import wpAjaxController from "../../../controllers/wp-ajax.js";
import datetimeUtils from "../../../utils/datetime.js";

import Mixin from "@ucd-lib/theme-elements/utils/mixins/mixin.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { MutationObserverController } from '@ucd-lib/theme-elements/utils/controllers/index.js';

import "./ucdlib-awards-supporters-display.js";
import "./ucdlib-awards-supporters-actions.js";

export default class UcdlibAwardsSupportersCtl extends Mixin(LitElement)
  .with(MainDomElement) {

  static get properties() {
    return {
      supporters: { type: Array },
      displayedSupporters: { type: Array },
      selectedSupporters: { type: Array },
      doingAction: { type: Boolean },
      cycleId: { type: Number }
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.mutationObserver = new MutationObserverController(this);
    this.wpAjax = new wpAjaxController(this);

    this.supporters = [];
    this.displayedSupporters = [];
    this.selectedSupporters = [];
    this.doingAction = false;
    this.cycleId = 0;
  }

  async _onActionSubmit(e){
    if ( this.doingAction ) return;
    this.doingAction = true;

    const action = e.detail.action;

    if ( action === 'getSubmission' ){
      await this.getSubmission();
    } else if ( action === 'delete' ){
      await this.delete();
    } else if ( action === 'send-reminder' ){
      await this.sendEmailReminder();
    }

    this.selectedSupporters = [];
    this.doingAction = false;
    this.renderRoot.querySelector('ucdlib-awards-supporters-actions').selectedAction = '';
    this.renderRoot.querySelector('ucdlib-awards-supporters-display').selectedSupporters = [];
  }

  _onSelectedSupportersChange(e) {
    this.selectedSupporters = e.detail.selectedSupporters;
  }

  _setSupporters(serverResponse) {
    serverResponse.forEach(supporter => {
      supporter.dateSubmitted = '';
      supporter.timeSubmitted = '';
      if ( supporter.submitted ) {
        supporter.dateSubmitted = datetimeUtils.mysqlToLocaleString(supporter.submittedTimestamp);
        supporter.timeSubmitted = datetimeUtils.mysqlToLocaleStringTime(supporter.submittedTimestamp);
      }
    });
    this.supporters = serverResponse;
    this.displayedSupporters = [...this.supporters];
  }

  async sendEmailReminder(){
    const payload = {
      cycle_id: this.cycleId,
      supporter_row_ids: this.selectedSupporters
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

  async delete(){
    const payload = {
      'cycle_id': this.cycleId,
      'supporter_row_ids': this.selectedSupporters
    }
    const response = await this.wpAjax.request('delete', payload);
    if (response.success ){
      this._setSupporters(response.data.supporters);
      this.dispatchEvent(new CustomEvent('toast-request', {
        bubbles: true,
        composed: true,
        detail: {
          message: 'Supporters deleted',
          type: 'success'
        }
      }));
    } else {
      console.error('delete error', response);
      let msg = 'Unable to delete supporter submissions';
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

  async getSubmission(){
    const payload = {
      'cycle_id': this.cycleId,
      'supporter_row_ids': this.selectedSupporters
    }
    const response = await this.wpAjax.request('getSubmission', payload);
    console.log('getSubmission response', response);
    if ( response.success ){
      const blob = new Blob([response.data.htmlDoc], {type: 'text/html'});
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');

    } else {
      console.error('getSubmission error', response);
      let msg = 'Unable to retrieve submissions';
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
    if ( data.cycleId ) this.cycleId = data.cycleId;
    if ( data.supporters ) {
      this._setSupporters(data.supporters);
    }
    console.log('data', data);

  }

}

customElements.define('ucdlib-awards-supporters-ctl', UcdlibAwardsSupportersCtl);
