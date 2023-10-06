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
      categories: { type: Array }
    }
  }

  constructor() {
    super();
    this.render = templates.render.bind(this);

    this.judges = [];
    this._judges = [];
    this.categories = [];
  }

  willUpdate(props) {
    if ( props.has('judges') ) {
      this._judges = this.judges.map(judge => {
        const j = {...judge};
        j.categorySuperscript = this.categories.findIndex(c => c.value === j.category) + 1;
        return j;
      });
    }
  }

  show() {
    this.renderRoot.querySelector('ucdlib-awards-modal').show();
  }

}

customElements.define('ucdlib-awards-judges-assignments', UcdlibAwardsJudgesAssignments);
