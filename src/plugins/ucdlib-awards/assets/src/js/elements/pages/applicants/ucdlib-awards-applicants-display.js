import { LitElement } from 'lit';
import * as templates from "./ucdlib-awards-applicants-display.tpl.js";

import Mixin from "@ucd-lib/theme-elements/utils/mixins/mixin.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

export default class UcdlibAwardsApplicantsDisplay extends Mixin(LitElement)
  .with(MainDomElement) {

  static get properties() {
    return {
      applicants: { type: Array },
      selectedApplicants: { type: Array },
      showCategories: { type: Boolean },
      _applicants: { state: true },
      _allSelected: { state: true }
    }
  }

  constructor() {
    super();
    this.render = templates.render.bind(this);
    this.applicants = [];
    this._applicants = [];
    this.selectedApplicants = [];
    this._allSelected = false;
    this.showCategories = false;
  }

  willUpdate(props) {
    if ( props.has('applicants') || props.has('selectedApplicants')) {
      let applicants = this.applicants.map(applicant => {
        applicant.selected = this.selectedApplicants.includes(applicant.user_id);
        return applicant;
      } );
      this._applicants = applicants;
      this._allSelected = this._applicants.length && this._applicants.every(applicant => applicant.selected);
      console.log('applicants', this._applicants);
    }
  }

}

customElements.define('ucdlib-awards-applicants-display', UcdlibAwardsApplicantsDisplay);
