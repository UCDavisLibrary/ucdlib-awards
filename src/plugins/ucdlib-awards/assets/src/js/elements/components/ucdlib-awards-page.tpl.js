import { html } from 'lit';

import normalize from "@ucd-lib/theme-sass/normalize.css.js";
import baseHtml from "@ucd-lib/theme-sass/1_base_html/_index.css.js";
import baseClass from "@ucd-lib/theme-sass/2_base_class/_index.css.js";
import oBox from "@ucd-lib/theme-sass/3_objects/_index.css.js";
import brandBox from "@ucd-lib/theme-sass/4_component/_brand-textbox.css.js";
import panel from "@ucd-lib/theme-sass/4_component/_panel.css.js";
import brandColors from "@ucd-lib/theme-sass/4_component/_category-brand.css.js";
import focalLink from "@ucd-lib/theme-sass/4_component/_focal-link.css.js";
import layouts from "@ucd-lib/theme-sass/5_layout/_index.css.js";
import spaceUtils from "@ucd-lib/theme-sass/6_utility/_u-space.css.js";

import customStyles from "../../styles/index.js";

export function styles() {

  return [
    normalize,
    baseHtml,
    baseClass,
    oBox,
    panel,
    brandBox,
    brandColors,
    focalLink,
    layouts,
    spaceUtils,
    ...customStyles
  ];
}

export function render() {
return html`
  <div id='page-title' ?hidden=${!this.pageTitle}>
    ${this.siteLogo ? html`<img src=${this.siteLogo}>` : ''}
    <h2 class='heading--weighted-underline'><span class='heading--weighted--weighted'>${this.pageTitle}</span></h2>
  </div>
  <div ?hidden=${this.hideCycleNotification} class="basic-notification">
    <ucdlib-icon class='double-decker u-space-mr' icon="ucd-public:fa-circle-exclamation"></ucdlib-icon>
    <div class='notification-text'>
      There are no application cycles set up!
      <span ?hidden=${!this.cyclesLink}><a href=${this.cyclesLink}>Create one.</a></span>
    </div>
  </div>
  <div id='content'></div>
`;}
