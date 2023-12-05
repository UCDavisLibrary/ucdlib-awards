import { LitElement } from 'lit';
import {render} from "./ucdlib-awards-supporters-display.tpl.js";

import Mixin from "@ucd-lib/theme-elements/utils/mixins/mixin.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

export default class UcdlibAwardsSupportersDisplay extends Mixin(LitElement)
  .with(MainDomElement) {

  static get properties() {
    return {
      supporters: { type: Array },
      selectedSupporters: { type: Array },
      sortDirection: { type: Object },
      expandedRecords: { type: Array },
      _supporters: { state: true },
      _allSelected: { state: true }
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.supporters = [];
    this._supporters = [];
    this.selectedSupporters = [];
    this._allSelected = false;
    this.sortDirection = {};
    this.expandedRecords = [];
  }

  willUpdate(props) {
    if (
      props.has('supporters') ||
      props.has('selectedSupporters') ||
      props.has('sortDirection') ||
      props.has('expandedRecords')) {

      let supporters = this.supporters.map(supporter => {
        supporter = {...supporter};
        supporter.selected = this.selectedSupporters.includes(supporter.id);
        supporter.expanded = this.expandedRecords.includes(supporter.id);
        return supporter;
      } );
      if ( Object.keys(this.sortDirection).length ) {
        let field = Object.keys(this.sortDirection)[0];
        let direction = this.sortDirection[field];
        supporters.sort((a, b) => {
          if ( a[field] < b[field] ) {
            return direction === 'asc' ? -1 : 1;
          }
          if ( a[field] > b[field] ) {
            return direction === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }
      this._supporters = supporters;
      this._allSelected = this._supporters.length && this._supporters.every(supporter => supporter.selected);
    }
  }

  sortSupporters(field, direction) {
    if ( !field ) return;
    if ( !direction ) direction = 'asc';
    if ( this.sortDirection[field] === direction ) {
      return;
    }
    this.sortDirection = {
      [field]: direction
    }
  }

  toggleSupporterExpand(rowId){
    if ( !rowId ) return;
    if ( this.expandedRecords.includes(rowId) ) {
      this.expandedRecords = this.expandedRecords.filter(id => id !== rowId);
    } else {
      this.expandedRecords = [...this.expandedRecords, rowId];
      this.requestUpdate();
    }
  }

  toggleSupporterSelect(rowId){
    if ( !rowId ) return;
    if ( rowId === 'all' ){
      if ( this._allSelected ) {
        this.selectedSupporters = [];
      } else {
        this.selectedSupporters = this._supporters.map(supporter => supporter.id);
      }
    } else {
      if ( this.selectedSupporters.includes(rowId) ) {
        this.selectedSupporters = this.selectedSupporters.filter(id => id !== rowId);
      } else {
        this.selectedSupporters = [...this.selectedSupporters, rowId];
      }
    }
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent('selected-supporters-change', {
      detail: {
        selectedSupporters: this.selectedSupporters
      }
    }));
  }

}

customElements.define('ucdlib-awards-supporters-display', UcdlibAwardsSupportersDisplay);
