import { LitElement } from 'lit';
import * as templates from "./ucdlib-awards-judges-assignments.tpl.js";

import Mixin from "@ucd-lib/theme-elements/utils/mixins/mixin.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

export default class UcdlibAwardsJudgesAssignments extends Mixin(LitElement)
  .with(MainDomElement) {

  static get properties() {
    return {
      judges: { type: Array },
      _judges: {state: true},
      applicants: { type: Array },
      _applicants: {state: true},
      categories: { type: Array }
    }
  }

  constructor() {
    super();
    this.render = templates.render.bind(this);
    this.renderCell = templates.renderCell.bind(this);

    this.judges = [];
    this._judges = [];
    this.applicants = [];
    this._applicants = [];
    this.categories = [];

    this.statuses = [
      {prop: 'conflictsOfInterest', label: 'Conflict of Interest', color: 'double-decker'},
      {prop: 'evaluations', label: 'Evaluated'},
      {prop: 'assignments', label: 'Assigned'}
    ];
  }

  willUpdate(props) {
    if ( props.has('judges') || props.has('categories') ) {
      const applicants = [];
      this._judges = this.judges.map(judge => {

        this.statuses.forEach(status => {
          if ( judge[status.prop] ) {
            judge[status.prop].forEach(applicantId => {
              const applicant = this.applicants.find(a => a.id == applicantId);
              if ( applicant ) {
                if ( applicants.find(a => a.id === applicantId)) {
                  const a = applicants.find(a => a.id === applicantId);
                  a.byJudgeStatus.push({judgeId: judge.id, status});
                } else {
                  const categorySuperscript = this.categories.findIndex(c => c.value == applicant.category?.value) + 1;
                  applicants.push(
                    {...applicant,
                      categorySuperscript,
                      byJudgeStatus: [{judgeId: judge.id, status}]});
                }
              }
            });
          }
        });

        const j = {...judge};
        if ( this.categories.length ) {
          j.categorySuperscript = this.categories.findIndex(c => c.value === j.category) + 1;
        }
        return j;
      });

      applicants.sort((a, b) => {
        if ( a.name < b.name ) return -1;
        if ( a.name > b.name ) return 1;
        return 0;
      });
      this._applicants = applicants;
    }
  }

  show() {
    this.renderRoot.querySelector('ucdlib-awards-modal').show();
  }

}

customElements.define('ucdlib-awards-judges-assignments', UcdlibAwardsJudgesAssignments);
