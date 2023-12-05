import { LitElement } from 'lit';
import * as templates from "./ucdlib-awards-admin-evaluation.tpl.js";

import Mixin from "@ucd-lib/theme-elements/utils/mixins/mixin.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { MutationObserverController } from '@ucd-lib/theme-elements/utils/controllers/index.js';

export default class UcdlibAwardsAdminEvaluation extends Mixin(LitElement)
  .with(MainDomElement) {

  static get properties() {
    return {
      scores: { type: Array },
      categories: { type: Array },
      scoringCalculation: { type: String },
      rubricItems: { type: Array }
    }
  }

  constructor() {
    super();
    this.render = templates.render.bind(this);
    this.renderScoresTable = templates.renderScoresTable.bind(this);
    this.scores = [];
    this.categories = [];
    this.scoringCalculation = 'sum';
    this.rubricItems = [];

    this.mutationObserver = new MutationObserverController(this);
  }

  willUpdate(props) {
    if ( props.has('scores') ){
      this.rubricItems = this._extractRubricItems(this.scores);
    }
  }

  // download scores as CSV
  _onDownloadClick(){
    let csvContent = "data:text/csv;charset=utf-8,";

    // headers
    const headers = [
      'Applicant Name',
      'Applicant Id',
      'Judge Name',
      'Judge Id',
      'Category',
      'Rubric Item',
      'Rubric Item Id',
      'Rubric Item Weight',
      'Score',
      'Judge Comment'
    ];
    csvContent += headers.join(',') + '\n';

    // rows
    const rows = this.scores.map(score => {
      return [
        this._quoteAndEscapeCSVValue(score.applicant?.name),
        this._quoteAndEscapeCSVValue(score.applicant?.id),
        this._quoteAndEscapeCSVValue(score.judge?.name),
        this._quoteAndEscapeCSVValue(score.judge?.id),
        this._quoteAndEscapeCSVValue(score.category?.label),
        this._quoteAndEscapeCSVValue(score.rubricItem?.title),
        this._quoteAndEscapeCSVValue(score.rubricItem?.id),
        this._quoteAndEscapeCSVValue(score.rubricItem?.weight),
        this._quoteAndEscapeCSVValue(score.score?.score),
        this._quoteAndEscapeCSVValue(score.score?.note)
      ];
    });
    csvContent += rows.map(row => row.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `scores-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  _quoteAndEscapeCSVValue(value) {
    if ( !value ) return '';
    const escapedValue = value.replace(/"/g, '""');
    return `"${escapedValue}"`;
}

  _extractRubricItems(scores) {
    const items = {};
    for (const score of scores) {
      const rubricItemId = score.rubricItem?.id;
      if ( rubricItemId && !items[rubricItemId] ) {
        items[rubricItemId] = score.rubricItem;
      }
    }
    const out = Object.values(items);
    out.sort((a, b) => parseInt(a.order) - parseInt(b.order));
    return out;
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

  if ( data.scores ) {
    this.scores = data.scores;
  }
  if ( data.categories ) {
    this.categories = data.categories;
  }
  if ( data.scoringCalculation ) {
    this.scoringCalculation = data.scoringCalculation;
  }
}

}

customElements.define('ucdlib-awards-admin-evaluation', UcdlibAwardsAdminEvaluation);
