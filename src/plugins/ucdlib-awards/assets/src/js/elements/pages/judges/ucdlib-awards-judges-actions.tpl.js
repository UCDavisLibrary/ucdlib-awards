import { html } from 'lit';

export function render() {
return html`
  ${this.renderActionPanel()}
  ${this.renderNewJudgePanel()}

`;}

export function renderNewJudgePanel(){
  return html`
    <div class="panel panel--icon panel--icon-custom o-box category-brand--arboretum u-space-mb--flush">
      <h2 class="panel__title">
        <ucdlib-icon icon="ucd-public:fa-user-plus" class="panel__custom-icon"></ucdlib-icon>
        <span>Add a Judge</span>
      </h2>
      <section>
        <form @submit="${this._onNewJudgeSubmit}">
          <div class="field-container">
            <label>First Name</label>
            <input type="text" @input=${e => this._onNewJudgeInput('first_name', e.target.value)} .value=${this.newJudgeData?.first_name || ''}>
          </div>
          <div class="field-container">
            <label>Last Name</label>
            <input type="text" @input=${e => this._onNewJudgeInput('last_name', e.target.value)} .value=${this.newJudgeData?.last_name || ''}>
          </div>
          <div class="field-container">
            <label>UC Davis Email</label>
            <input type="email" @input=${e => this._onNewJudgeInput('email', e.target.value)} .value=${this.newJudgeData?.email || ''}>
          </div>
          <div class="field-container">
            <label>Category</label>
            <select @change=${e => this._onNewJudgeInput('category', e.target.value)} .value=${this.newJudgeData?.category || ''}>
              <option value="">Select a category</option>
              ${this.categories.map(category => html`
                <option value="${category.value}" ?selected=${this.newJudgeData?.category == category.value}>${category.label}</option>
              `)}
            </select>
          </div>
          <button ?disabled=${!this.newJudgeDataIsValid || this.addingNewJudge} type="submit" class="btn marketing-highlight__cta border-box category-brand--arboretum width-100">Add</button>
        </form>
      </section>
    </div>
  `;
}

export function renderActionPanel(){
  if ( !this.judgeCt ) return html``;
  return html`
    <div class="panel panel--icon panel--icon-custom o-box category-brand--redwood">
      <h2 class="panel__title">
        <ucdlib-icon icon="ucd-public:fa-wrench" class="panel__custom-icon"></ucdlib-icon>
        <span>Actions</span>
      </h2>
      <form @submit=${this._onActionSubmit}>
        <div ?hidden=${this.selectedJudges.length} class='u-space-mb hint-text'>
          Select at least one judge to perform an action
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
        <button ?disabled=${this.disableActionSubmit} type="submit" class="btn marketing-highlight__cta border-box category-brand--redwood width-100">Apply</button>
      </form>
    </div>
  `;
}
