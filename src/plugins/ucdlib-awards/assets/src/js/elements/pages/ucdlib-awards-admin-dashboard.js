import { LitElement } from 'lit';
import {render} from "./ucdlib-awards-admin-dashboard.tpl.js";
import Mixin from "@ucd-lib/theme-elements/utils/mixins/mixin.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

export default class UcdlibAwardsAdminDashboard extends Mixin(LitElement)
  .with(MainDomElement) {

  static get properties() {
    return {

    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
  }

}

customElements.define('ucdlib-awards-admin-dashboard', UcdlibAwardsAdminDashboard);
