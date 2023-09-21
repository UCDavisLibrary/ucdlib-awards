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
      selectedApplicants: { type: Array }
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
  }

  willUpdate(props) {
    if ( props.has('categories') ) {
      this.hasCategories = this.categories.length > 0;
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
    if ( data.applicants ) {
      let applicants = data.applicants.map(applicant => {
        applicant.user_id = parseInt(applicant.user_id);
        applicant.is_admin = parseInt(applicant.is_admin);
        return applicant;
      });
      //this.applicants = applicants;
      //this.displayedApplicants = applicants;
      this.applicants = [...applicants, ...applicants, ...applicants];
      this.displayedApplicants = [...applicants, ...applicants, ...applicants];

    }
    console.log('data', data);

  }

}

customElements.define('ucdlib-awards-applicants-ctl', UcdlibAwardsApplicantsCtl);
