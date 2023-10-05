import { html, css } from 'lit';
import headingStyles from "@ucd-lib/theme-sass/1_base_html/_headings.css.js";
import headingClassesStyles from "@ucd-lib/theme-sass/2_base_class/_headings.css.js";
import buttonStyles from "@ucd-lib/theme-sass/2_base_class/_buttons.css.js";

/**
 * @description element styles
 * @returns
 */
export function styles() {
  const elementStyles = css`
    :host {
      display: block;
      position: fixed;
      z-index: 1000;
    }
    .container {
      width: 100%;
      height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1;
    }
    [hidden] {
      display: none !important;
    }
    .film {
      background-color: #00000085;
      width: 100%;
      height: 100%;
      z-index: 99;
      position: fixed;
      left: 0;
      top: 0;
    }
    .box-content {
      background-color: #fff;
      width: 85%;
      max-width: 910px;
      min-height: 200px;
      z-index: 100;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem 0;
    }
    .header-right {
      margin-left: 1rem;
    }
    .close-icon {
      color: #000;
      cursor: pointer;
    }
    .close-icon:hover {
      color: #008eaa;
    }
    .body-content {
      margin: 1rem 1.5rem;
      max-height: calc(100vh - 300px);
      overflow: scroll;
    }
    .footer {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100px;
    }
  `;

  return [
    buttonStyles,
    headingStyles,
    headingClassesStyles,
    elementStyles
  ];
}

/**
 * @description Main render function
 * @returns {TemplateResult}
 */
export function render() {
  return html`
  <div class="container" ?hidden="${!this.visible}">
    <div class="film" @click="${this.hide}"></div>
    <div class="box-content" style='width:${this.contentWidth}'>
      <div class="header">
        <h2>${this.contentTitle}</h2>
        <div class="header-right"><span class="close-icon" @click="${this.hide}">X</span></div>
      </div>
      <div class="body-content"><slot></slot></div>
      <div class="footer" ?hidden=${this.hideFooter}>
        <div>
          <a class='btn btn--alt3 btn--sm' @click="${this.hide}">${this.dismissText}</a>
          <slot name="confirmButton" @click="${this._onConfirmClicked}"></slot>
        </div>
      </div>
    </div>
  </div>
`;}
