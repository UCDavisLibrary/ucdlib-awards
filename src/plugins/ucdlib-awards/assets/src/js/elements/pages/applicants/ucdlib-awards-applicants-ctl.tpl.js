import { html } from 'lit';


export function render() {
return html`
  <h3 class="page-subtitle">Applicants</h3>
  <div class="l-2col l-2col--67-33">
    <div class="l-second panel o-box">
      <ucdlib-awards-applicants-actions
        @search-query-change=${this._onSearchQueryChange}
        @action-submit=${this._onActionSubmit}
        .selectedApplicants=${this.selectedApplicants}
        .doingAction=${this.doingAction}
        .judges=${this.judges}
        .categories=${this.categories}
      >

      </ucdlib-awards-applicants-actions>
    </div>
    <div class="l-first panel o-box">
      <ucdlib-awards-applicants-display
        @selected-applicants-change=${this._onSelectedApplicantsChange}
        .applicants=${this.displayedApplicants}
        .showCategories=${this.hasCategories}
        .judges=${this.judges}
      >
      </ucdlib-awards-applicants-display>
    </div>
  </div>
`;}
