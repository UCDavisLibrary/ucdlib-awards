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
  <h3 class="page-subtitle">Reviewers</h3>
  <div class="l-2col l-2col--67-33">
    <div class="l-second panel o-box">
      <ucdlib-awards-judges-actions
        @add-judge=${this._onAddJudge}
        @action-submit=${this._onActionSubmit}
        .doingAction=${this.doingAction}
        .categories=${this.categories}
        .judgeCt=${this.judges.length}
        .selectedJudges=${this.selectedJudges}
        .applicants=${this.applicants}
      ></ucdlib-awards-judges-actions>
    </div>
    <div class="l-first panel o-box">
      <ucdlib-awards-judges-display
        @selected-judges-change=${this._onSelectedJudgesChange}
        .judges=${this.judges}
        .showCategories=${this.hasCategories}
      ></ucdlib-awards-judges-display>
      <ucdlib-awards-judges-assignments
        .judges=${this.judgeAssignmentFiltered}
        .categories=${this.categories}
        .applicants=${this.applicants}
      ></ucdlib-awards-judges-assignments>
    </div>
  </div>

`;}
