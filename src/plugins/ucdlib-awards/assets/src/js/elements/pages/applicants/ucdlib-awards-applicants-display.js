import { LitElement } from 'lit';
import * as templates from "./ucdlib-awards-applicants-display.tpl.js";

import Mixin from "@ucd-lib/theme-elements/utils/mixins/mixin.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

export default class UcdlibAwardsApplicantsDisplay extends Mixin(LitElement)
  .with(MainDomElement) {

  static get properties() {
    return {

    }
  }

  constructor() {
    super();
    this.render = templates.render.bind(this);
  }

}

customElements.define('ucdlib-awards-applicants-display', UcdlibAwardsApplicantsDisplay);
