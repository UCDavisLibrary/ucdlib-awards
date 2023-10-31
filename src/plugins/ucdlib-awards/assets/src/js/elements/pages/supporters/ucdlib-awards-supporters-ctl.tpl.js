import { html } from 'lit';

export function render() {
return html`
  <h3 class="page-subtitle">Supporters</h3>
  <div class="l-2col l-2col--67-33">
    <div class="l-second panel o-box">
      <ucdlib-awards-supporters-actions
        @action-submit=${this._onActionSubmit}
        .selectedSupporters=${this.selectedSupporters}
        .doingAction=${this.doingAction}
      ></ucdlib-awards-supporters-actions>
    </div>
    <div class="l-first panel o-box">
      <ucdlib-awards-supporters-display
        @selected-supporters-change=${this._onSelectedSupportersChange}
        .supporters=${this.displayedSupporters}
      ></ucdlib-awards-supporters-display>
    </div>
  </div>

`;}
