import { LitElement } from 'lit';
import * as templates from "./ucdlib-awards-judges-display.tpl.js";

import Mixin from "@ucd-lib/theme-elements/utils/mixins/mixin.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";


export default class UcdlibAwardsJudgesDisplay extends Mixin(LitElement)
  .with(MainDomElement) {

  static get properties() {
    return {
      judges: { type: Array },
      selectedJudges: { type: Array },
      showCategories: { type: Boolean },
      sortDirection: { type: Object },
      expandedRecords: { type: Array },
      _judges: { state: true },
      _allSelected: { state: true }
    }
  }

  constructor() {
    super();
    this.render = templates.render.bind(this);
    this.renderJudgeRow = templates.renderJudgeRow.bind(this);
    this.renderSortIcon = templates.renderSortIcon.bind(this);

    this.judges = [];
    this._judges = [];
    this.selectedJudges = [];
    this._allSelected = false;
    this.showCategories = false;
    this.sortDirection = {};
    this.expandedRecords = [];
  }

  willUpdate(props) {
    if (
      props.has('judges') ||
      props.has('selectedJudges') ||
      props.has('sortDirection') ||
      props.has('expandedRecords')) {

      let judges = this.judges.map(judge => {
        judge.selected = this.selectedJudges.includes(judge.id);
        judge.assignedCt = judge.assignments?.length || 0;
        judge.evaluatedCt = judge.applicationsEvaluatedCt || 0;
        judge.expanded = this.expandedRecords.includes(judge.id);
        if ( this.showCategories ) {
          judge.categoryLabel = judge.categoryObject?.label || '';
        }
        judge.categoryLabel
        return judge;
      } );

      if ( Object.keys(this.sortDirection).length ) {
        let field = Object.keys(this.sortDirection)[0];
        let direction = this.sortDirection[field];
        judges.sort((a, b) => {
          if ( a[field] < b[field] ) {
            return direction === 'asc' ? -1 : 1;
          }
          if ( a[field] > b[field] ) {
            return direction === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }
      this._judges = judges;
      this._allSelected = this._judges.length && this._judges.every(judge => judge.selected);
      console.log('judges', this._judges);
    }
  }

  sortJudges(field, direction) {
    if ( !field ) return;
    if ( !direction ) direction = 'asc';
    if ( this.sortDirection[field] === direction ) {
      return;
    }
    this.sortDirection = {
      [field]: direction
    }
  }

  toggleJudgeExpand(jid){
    if ( !jid ) return;
    if ( this.expandedRecords.includes(jid) ) {
      this.expandedRecords = this.expandedRecords.filter(id => id !== jid);
    } else {
      this.expandedRecords = [...this.expandedRecords, jid];
      this.requestUpdate();
    }
  }

  toggleJudgeSelect(jid){
    if ( !jid ) return;
    if ( jid === 'all' ){
      if ( this._allSelected ) {
        this.sele = [];
      } else {
        this.selectedJudges = this._judges.map(judge => judge.id);
      }
    } else {
      if ( this.selectedJudges.includes(jid) ) {
        this.selectedJudges = this.selectedJudges.filter(i => i !== jid);
      } else {
        this.selectedJudges = [...this.selectedJudges, jid];
        this.requestUpdate();
      }
    }
    this.dispatchEvent(new CustomEvent('selected-judges-change', {
      detail: {
        selectedJudges: this.selectedJudges
      }
    }));
  }

}

customElements.define('ucdlib-awards-judges-display', UcdlibAwardsJudgesDisplay);
