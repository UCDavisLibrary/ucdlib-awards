import { html, css } from 'lit';

export function styles() {
  const elementStyles = css`
    :host {
      display: block;
    }
  `;

  return [elementStyles];
}

export function render() {
return html`
  <h3 class="page-subtitle">Judges</h3>
  <div class="l-2col l-2col--67-33">
    <div class="l-second panel o-box">
      <ucdlib-awards-judges-actions
        @add-judge=${this._onAddJudge}
        .categories=${this.categories}
        .judgeCt=${this.judges.length}
      ></ucdlib-awards-judges-actions>
    </div>
    <div class="l-first panel o-box">
      <ucdlib-awards-judges-display
        @selected-judges-change=${this._onSelectedJudgesChange}
        .judges=${this.judges}
        .showCategories=${this.hasCategories}
      ></ucdlib-awards-judges-display>
    </div>
  </div>

`;}
