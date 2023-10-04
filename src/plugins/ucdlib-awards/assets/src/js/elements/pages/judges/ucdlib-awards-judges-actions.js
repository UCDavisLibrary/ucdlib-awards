import { LitElement } from 'lit';
import * as templates from "./ucdlib-awards-judges-actions.tpl.js";

import Mixin from "@ucd-lib/theme-elements/utils/mixins/mixin.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

export default class UcdlibAwardsJudgesActions extends Mixin(LitElement)
  .with(MainDomElement) {

  static get properties() {
    return {
      newJudgeData: { type: Object },
      newJudgeDataIsValid: { type: Boolean },
      addingNewJudge: { type: Boolean },
      categories: { type: Array },
      judgeCt: { type: Number }
    }
  }

  constructor() {
    super();
    this.render = templates.render.bind(this);
    this.renderNewJudgePanel = templates.renderNewJudgePanel.bind(this);
    this.renderActionPanel = templates.renderActionPanel.bind(this);

    this.newJudgeData = {};
    this.newJudgeDataIsValid = false;
    this.addingNewJudge = false;
    this.categories = [];
    this.judgeCt = 0;
  }

  _onNewJudgeInput(prop, value){
    this.newJudgeData[prop] = value;
    this.newJudgeDataIsValid = this.validateNewJudgeData();
    this.requestUpdate();
  }

  _onNewJudgeSubmit(e) {
    e.preventDefault();
    this.addingNewJudge = true;
    this.dispatchEvent(new CustomEvent('add-judge', {
      detail: this.newJudgeData
    }));
  }

  validateNewJudgeData(){
    const requiredProps = ['first_name', 'last_name', 'email'];
    if ( this.categories.length ) requiredProps.push('category');
    return requiredProps.every(prop => this.newJudgeData[prop]);
  }

}

customElements.define('ucdlib-awards-judges-actions', UcdlibAwardsJudgesActions);
