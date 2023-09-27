import { html } from 'lit';

export function render() {
return html`
  ${this.renderActionPanel()}
  ${this.renderSearchPanel()}
`;}


export function renderSearchPanel(){
  return html`
    <div class="panel panel--icon panel--icon-custom o-box category-brand--redbud u-space-mb--flush">
      <h2 class="panel__title">
        <ucdlib-icon icon="ucd-public:fa-magnifying-glass" class="panel__custom-icon"></ucdlib-icon>
        <span>Search</span>
      </h2>
      <section>
      <div class="field-container">
        <input
          type="text"
          .value=${this.searchQuery}
          @input=${this._onSearchInput}
          placeholder="Search Applicants">
      </div>
      </section>
    </div>
  `;
}

export function renderActionPanel(){
  return html`
    <div class="panel panel--icon panel--icon-custom o-box category-brand--redwood">
      <h2 class="panel__title">
        <ucdlib-icon icon="ucd-public:fa-wrench" class="panel__custom-icon"></ucdlib-icon>
        <span>Actions</span>
      </h2>
      <section>
        <div ?hidden=${this.selectedApplicants.length} class='u-space-mb hint-text'>
          Select at least one applicant to perform an action
        </div>
        <div class="field-container">
          <select
            @change=${(e) => this.selectedAction = e.target.value}
            .value=${this.selectedAction}
          >
            ${this._actions.map(action => html`
              <option
                value=${action.slug}
                ?selected=${action.slug === this.selectedAction}
                ?disabled=${action.disabled}
              >${action.label}
              </option>
            `)}
          </select>
        </div>
        <button type="button" ?disabled=${this.disableActionSubmit} class="btn btn--primary btn--block border-box">Apply</button>
      </section>
    </div>
  `;
}
