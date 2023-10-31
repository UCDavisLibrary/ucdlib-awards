import { LitElement } from 'lit';
import {render, styles} from "./ucdlib-awards-supporters-display.tpl.js";

export default class UcdlibAwardsSupportersDisplay extends LitElement {

  static get properties() {
    return {
      
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
  }

}

customElements.define('ucdlib-awards-supporters-display', UcdlibAwardsSupportersDisplay);