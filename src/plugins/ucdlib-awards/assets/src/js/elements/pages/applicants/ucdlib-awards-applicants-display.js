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
      sortDirection: { type: Object },
      expandedRecords: { type: Array },
      judges: { type: Array },
      assignmentStatusApplicant: {type: String},
      _applicants: { state: true },
      _allSelected: { state: true }
    }
  }

  constructor() {
    super();
    this.render = templates.render.bind(this);
    this.renderSortIcon = templates.renderSortIcon.bind(this);
    this.renderApplicantRow = templates.renderApplicantRow.bind(this);
    this.renderAssignmentModalContent = templates.renderAssignmentModalContent.bind(this);
    this.applicants = [];
    this._applicants = [];
    this.selectedApplicants = [];
    this._allSelected = false;
    this.showCategories = false;
    this.sortDirection = {};
    this.expandedRecords = [];
    this.judges = [];
    this.assignmentStatusApplicant = '';
  }

  willUpdate(props) {
    if (
      props.has('applicants') ||
      props.has('selectedApplicants') ||
      props.has('sortDirection') ||
      props.has('expandedRecords')) {

      let applicants = this.applicants.map(applicant => {
        applicant = {...applicant};
        applicant.selected = this.selectedApplicants.includes(applicant.user_id);
        applicant.expanded = this.expandedRecords.includes(applicant.user_id);
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
    }
  }

  _onAssignmentView(applicant_id){
    if ( !applicant_id ) return;
    this.assignmentStatusApplicant = applicant_id;

    const modal = this.querySelector('ucdlib-awards-modal');
    if ( modal ) {
      modal.show();
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
    this.dispatchEvent(new CustomEvent('selected-applicants-change', {
      detail: {
        selectedApplicants: this.selectedApplicants
      }
    }));
  }

}

customElements.define('ucdlib-awards-applicants-display', UcdlibAwardsApplicantsDisplay);
