import { LitElement } from 'lit';
import * as templates from "./ucdlib-awards-admin-rubric.tpl.js";

import Mixin from "@ucd-lib/theme-elements/utils/mixins/mixin.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { MutationObserverController } from '@ucd-lib/theme-elements/utils/controllers/index.js';

export default class UcdlibAwardsAdminRubric extends Mixin(LitElement)
  .with(MainDomElement) {

  static get properties() {
    return {
      page: { type: String },
      rubricItems: { type: Array },
      cyclesWithRubric: { type: Array },
      hasRubric: { type: Boolean }
    }
  }

  constructor() {
    super();
    this.render = templates.render.bind(this);
    this.renderNoRubric = templates.renderNoRubric.bind(this);

    this.page = 'main';
    this.cyclesWithRubric = [];
    this.rubricItems = [];

    this.mutationObserver = new MutationObserverController(this);
  }

  _onNewRubricClick(action){
    if ( action === 'copy' ) {
      // do stuff
    } else if ( action === 'create' ) {
      // do stuff
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
    if ( data.rubricItems ) {
      this.rubricItems = data.rubricItems
    } else {
      this.hasRubric = false;
    }

    if ( !this.rubricItems.length && this.cyclesWithRubric.length ){
      this.page = 'no-rubric';
    }
    console.log('data', data);

  }

}

customElements.define('ucdlib-awards-admin-rubric', UcdlibAwardsAdminRubric);
