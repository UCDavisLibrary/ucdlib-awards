import { LitElement } from 'lit';
import {render} from "./ucdlib-awards-supporters-ctl.tpl.js";
import wpAjaxController from "../../../controllers/wp-ajax.js";

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
    console.log(action);

    this.selectedSupporters = [];
    this.doingAction = false;
    this.renderRoot.querySelector('ucdlib-awards-supporters-actions').selectedAction = '';
    this.renderRoot.querySelector('ucdlib-awards-supporters-display').selectedSupporters = [];
  }

  _onSelectedSupportersChange(e) {
    this.selectedSupporters = e.detail.selectedSupporters;
  }

  _setSupporters(serverResponse) {
    this.supporters = serverResponse;
    this.displayedSupporters = [...this.supporters];
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
