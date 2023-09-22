import { LitElement } from 'lit';
import * as templates from "./ucdlib-awards-applicants-display.tpl.js";

import Mixin from "@ucd-lib/theme-elements/utils/mixins/mixin.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

// todo: remove this
import testApplicants from "./test-applicants.js";

export default class UcdlibAwardsApplicantsDisplay extends Mixin(LitElement)
  .with(MainDomElement) {

  static get properties() {
    return {
      applicants: { type: Array },
      selectedApplicants: { type: Array },
      showCategories: { type: Boolean },
      sortDirection: { type: Object },
      expandedRecords: { type: Array },
      _applicants: { state: true },
      _allSelected: { state: true }
    }
  }

  constructor() {
    super();
    this.render = templates.render.bind(this);
    this.renderSortIcon = templates.renderSortIcon.bind(this);
    this.applicants = [];
    this._applicants = [];
    this.selectedApplicants = [];
    this._allSelected = false;
    this.showCategories = false;
    this.sortDirection = {};
    this.expandedRecords = [];
  }

  willUpdate(props) {
    if (
      props.has('applicants') ||
      props.has('selectedApplicants') ||
      props.has('sortDirection') ||
      props.has('expandedRecords')) {
      //todo remove this
      let applicants = [...this.applicants, ...testApplicants].map(applicant => {

        applicant.selected = this.selectedApplicants.includes(applicant.user_id);
        applicant.expanded = this.expandedRecords.includes(applicant.user_id);

        applicant.name = `${applicant.first_name || ''} ${applicant.last_name || ''}`;
        applicant.category = applicant.applicationCategory?.label || '';
        applicant.applicationStatusLabel = applicant.applicationStatus?.label || '';
        applicant.submitted = new Date(applicant.applicationEntry?.date_created_sql || '');
        return applicant;
      } );
      if ( Object.keys(this.sortDirection).length ) {
        let field = Object.keys(this.sortDirection)[0];
        let direction = this.sortDirection[field];
        applicants.sort((a, b) => {
          if ( a[field] < b[field] ) {
            return direction === 'asc' ? -1 : 1;
          }
          if ( a[field] > b[field] ) {
            return direction === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }
      this._applicants = applicants;
      this._allSelected = this._applicants.length && this._applicants.every(applicant => applicant.selected);
      console.log('applicants', this._applicants);
    }
  }

  sortApplicants(field, direction) {
    if ( !field ) return;
    if ( !direction ) direction = 'asc';
    if ( this.sortDirection[field] === direction ) {
      return;
    }
    this.sortDirection = {
      [field]: direction
    }
  }

  toggleApplicantExpand(applicant_id){
    if ( !applicant_id ) return;
    if ( this.expandedRecords.includes(applicant_id) ) {
      this.expandedRecords = this.expandedRecords.filter(id => id !== applicant_id);
    } else {
      this.expandedRecords = [...this.expandedRecords, applicant_id];
      this.requestUpdate();
    }
  }

  toggleApplicantSelect(applicant_id){
    if ( !applicant_id ) return;
    if ( applicant_id === 'all' ){
      if ( this._allSelected ) {
        this.selectedApplicants = [];
      } else {
        this.selectedApplicants = this._applicants.map(applicant => applicant.user_id);
      }
    } else {
      if ( this.selectedApplicants.includes(applicant_id) ) {
        this.selectedApplicants = this.selectedApplicants.filter(id => id !== applicant_id);
      } else {
        this.selectedApplicants = [...this.selectedApplicants, applicant_id];
        this.requestUpdate();
      }
    }
  }

}

customElements.define('ucdlib-awards-applicants-display', UcdlibAwardsApplicantsDisplay);
