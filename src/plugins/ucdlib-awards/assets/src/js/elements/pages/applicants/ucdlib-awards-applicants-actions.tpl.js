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
        <form @submit=${this._onActionSubmit}>
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
          <div class='field-container' ?hidden=${!this.showJudgesSelect}>
            <label>Judges</label>
            <ucd-theme-slim-select @change=${this._onJudgeSelect}>
            <select multiple>
              ${this.categories.length ? html`
                ${this.categories.map(category => html`
                  <optgroup label="${category.label}">
                    ${this.judges.filter(j => j.categoryObject?.value == category.value).map(judge => html`
                      <option value="${judge.id}" ?selected=${this.selectedJudges.includes(judge.id)}>${judge.name}</option>
                    `)}
                  </optgroup>
                `)}
              ` : html`
                ${this.judges.map(judge => html`
                  <option value="${judge.id}" ?selected=${this.selectedJudges.includes(judge.id)}>${judge.name}</option>
                `)}
              `}
            </select>
          </ucd-theme-slim-select>
          </div>
          <button ?disabled=${this.disableActionSubmit || this.doingAction} type="submit" class="btn marketing-highlight__cta border-box category-brand--redwood width-100">Apply</button>
        </form>
      </section>
    </div>
  `;
}
