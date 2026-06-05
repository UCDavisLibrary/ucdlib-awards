import { html } from 'lit';

export function render() {
return html`
  ${this.renderActionPanel()}
  ${this.renderNewJudgePanel()}
  ${renderJudgeCopyForm.call(this)}
`;}

export function renderNewJudgePanel(){
  return html`
    <div class="panel panel--icon panel--icon-custom o-box category-brand--arboretum u-space-mb--flush">
      <h2 class="panel__title">
        <ucdlib-icon icon="ucd-public:fa-user-plus" class="panel__custom-icon"></ucdlib-icon>
        <span>Add a Reviewer</span>
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
          <div class="field-container" ?hidden=${!this.categories.length}>
            <label>Category</label>
            <select @change=${e => this._onNewJudgeInput('category', e.target.value)} .value=${this.newJudgeData?.category || ''}>
              <option value="">Select a category</option>
              ${this.categories.map(category => html`
                <option value="${category.value}" ?selected=${this.newJudgeData?.category == category.value}>${category.label}</option>
              `)}
            </select>
          </div>
          <div class='add-judge-buttons'>
            <button ?disabled=${!this.newJudgeDataIsValid || this.addingNewJudge} type="submit" class="btn marketing-highlight__cta border-box category-brand--arboretum width-100">Add</button>
            <div class='or-divider'>&#8212; Or &#8212;</div>
            <button ?disabled=${this.judgeCopyActionInProgess} type="button" class="btn marketing-highlight__cta border-box category-brand--arboretum width-100" @click=${this._onCopyJudgeClick}>Copy from a previous cycle</button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function renderJudgeCopyForm(){
  const visibleJudges = this.historicalJudges.filter(j => !j.hidden);
  const selectedJudges = visibleJudges.filter(j => j.selected);
  return html`
  <ucdlib-awards-modal dismiss-text='Cancel' content-title='Copy Reviewers from a Previous Cycle' .closeOnConfirm=${false}>
    <div class='${this.categories.length ? 'judge-copy-has-categories' : 'judge-copy-no-categories'}'>
      <div class='alert alert--error' ?hidden=${!this.judgeCopyErrors.length}>
        <ul>
          ${this.judgeCopyErrors.map(error => html`<li>${error}</li>`)}
        </ul>
      </div>
      <div class='field-container'>
        <label>Application Cycle</label>
        <select @change=${e => this._onCopyJudgeCycleFilterChange(e.target.value)} .value=${this.judgeCopyCycleFilter || ''} style='max-width: 300px;'>
          <option value="">All Cycles</option>
          ${this.allCycles.filter(cycle => cycle.cycle_id != this.cycleId).map(cycle => html`
            <option value="${cycle.cycle_id}" ?selected=${this.judgeCopyCycleFilter === cycle.cycle_id}>${cycle.title}</option>
          `)}
        </select>
      </div>
      <div>
        <div class='judge-copy-row judge-copy-row--header border-bottom-gold'>
          <div>
            <input type="checkbox" @input=${this._toggleSelectAllHistoricalJudges} .checked=${visibleJudges.length && visibleJudges.every(j => j.selected)}>
          </div>
          <div>Reviewer</div>
          <div class='category-column'>Category</div>
        </div>
        <div>
          ${this.historicalJudges.map(judge => html`
            <div class='judge-copy-row' ?hidden=${judge.hidden}>
              <div>
                <input type="checkbox" @input=${() => this._toggleHistoricalJudgeSelect(judge.data.user_id)} .checked=${judge.selected}>
              </div>
              <div>
                <div>${judge.name}</div>
                <div class='category-column-mobile'>${renderJudgeCategorySelect.call(this, judge)}</div>
              </div>
              <div class='category-column'>
                ${renderJudgeCategorySelect.call(this, judge)}
              </div>
            </div>
          `)}
        </div>
      </div>
    </div>
    <button
      slot="confirmButton"
      class='btn btn--primary'
      ?disabled=${!selectedJudges.length || this.judgeCopyActionInProgess}
      @click=${this._onConfirmCopyJudges}
    >
      Copy ${selectedJudges.length} Reviewer(s)
    </button>
  </ucdlib-awards-modal>
  `;
}

function renderJudgeCategorySelect(judge){
  return html`
    <select @change=${e => this._onCopyJudgeCategoryChange(judge, e.target.value)} .value=${judge?.category?.value || ''}>
      <option value="">Select a category</option>
      ${this.categories.map(category => html`
        <option value="${category.value}" ?selected=${judge?.category?.value === category.value}>${category.label}</option>
      `)}
    </select>
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
          Select at least one reviewer to perform an action
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
        <div class='field-container' ?hidden=${!this.showApplicantsSelect}>
          <label>Applicants</label>
          <ucd-theme-slim-select @change=${this._onApplicantsSelect}>
            <select multiple>
              ${this.categories.length ? html`
                ${this.categories.map(category => html`
                  <optgroup label="${category.label}">
                    ${this.applicants.filter(a => a.category?.value == category.value).map(applicant => html`
                      <option value="${applicant.id}" ?selected=${this.selectedApplicants.includes(applicant.id)}>${applicant.name}</option>
                    `)}
                  </optgroup>
                `)}
              ` : html`
                ${this.applicants.map(applicant => html`
                  <option value="${applicant.id}" ?selected=${this.selectedApplicants.includes(applicant.id)}>${applicant.name}</option>
                `)}
              `}
            </select>
          </ucd-theme-slim-select>
        </div>
        <div class='field-container' ?hidden=${this.selectedAction !== 'update-category'}>
          <label>New Category</label>
          <select @change=${e => this.selectedCategory = e.target.value} .value=${this.selectedCategory}>
            <option value="">Select a category</option>
            ${this.categories.map(category => html`
              <option value="${category.value}" ?selected=${this.selectedCategory == category.value}>${category.label}</option>
            `)}
          </select>
         </div>
        <button ?disabled=${this.disableActionSubmit || this.doingAction} type="submit" class="btn marketing-highlight__cta border-box category-brand--redwood width-100">Apply</button>
      </form>
    </div>
  `;
}
