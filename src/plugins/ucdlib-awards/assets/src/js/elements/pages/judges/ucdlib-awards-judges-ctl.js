import { LitElement } from 'lit';
import * as templates from "./ucdlib-awards-judges-ctl.tpl.js";
import wpAjaxController from "../../../controllers/wp-ajax.js";

import Mixin from "@ucd-lib/theme-elements/utils/mixins/mixin.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { MutationObserverController } from '@ucd-lib/theme-elements/utils/controllers/index.js';

import "./ucdlib-awards-judges-actions.js";
import "./ucdlib-awards-judges-display.js";

export default class UcdlibAwardsJudgesCtl extends Mixin(LitElement)
  .with(MainDomElement) {

  static get properties() {
    return {
      categories: { type: Array },
      hasCategories: { type: Boolean },
      cycleId: { type: Number },
      judges: { type: Array }
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
  }

  willUpdate(props) {
    if ( props.has('categories') ) {
      this.hasCategories = this.categories.length > 0;
    }
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
    console.log('data', data);

  }

}

customElements.define('ucdlib-awards-judges-ctl', UcdlibAwardsJudgesCtl);
