import { html } from 'lit';

export function render() {
return html`
  <h3 class='page-subtitle'>Evaluation Rubric</h3>
  <ucdlib-pages selected='rubric--${this.page}'>
    <div id='rubric--no-rubric'>${this.renderNoRubric()}</div>
    <div id='rubric--copy'>${this.renderCopyRubricForm()}</div>
    <div id='rubric--main'>
      <div class="l-2col l-2col--67-33">
        <div class="l-first panel o-box">
          ${this.renderForm()}
        </div>
        <div class="l-second panel o-box">
          ${this.renderUploadPanel()}
          ${this.renderCalculationPanel()}
        </div>
      </div>
    </div>
  </ucdlib-pages>
`;}

export function renderNoRubric() {
return html`
  <div class="priority-links">
    <div class="priority-links__item">
      <a class="vertical-link vertical-link--circle category-brand--rose pointer" @click=${() => this._onNewRubricClick('copy')}>
        <div class="vertical-link__figure">
          <ucdlib-icon class="vertical-link__image" icon="ucd-public:fa-copy"></ucdlib-icon>
        </div>
        <div class="vertical-link__title">copy rubric from another cycle</div>
      </a>
    </div>
    <div class="priority-links__item">
      <a class="vertical-link vertical-link--circle category-brand--cabernet pointer" @click=${() => this._onNewRubricClick('create')}>
        <div class="vertical-link__figure">
          <ucdlib-icon class="vertical-link__image" icon="ucd-public:fa-plus"></ucdlib-icon>
        </div>
        <div class="vertical-link__title">create new rubric</div>
      </a>
    </div>
  </div>
`;}

export function renderForm() {

  return html`
    <form @submit=${this._onFormSubmit}>
      <div
        ?hidden=${!this.errorMessages.length}
        class="brand-textbox category-brand__background category-brand--double-decker u-space-mb">
        <ul class='u-space-mt--flush list--flush'>
          ${this.errorMessages.map(msg => html`<li>${msg}</li>`)}
        </ul>
      </div>
    ${this.hasRubric ? html`
      <div>
        <h4 class='u-space-mb--flush'>Rubric Items</h4>
        ${this.renderInsertBar(0, 'before')}
        ${this.editedRubricItems.map((item, index) => html`
          <div class='gold-box o-box'>
            <div class='flex-center'>
              <h5 class='flex-grow u-space-mb--flush u-space-mr'>${item.title || ''}</h5>
              ${this.expandedItems.includes(index) ? html`
                <ucdlib-icon
                  icon="ucd-public:fa-caret-up"
                  class="pointer icon-hover primary"
                  title="Collapse"
                  @click=${() => this._onToggleExpand(index)}></ucdlib-icon>
              ` : html`
                <ucdlib-icon
                  icon="ucd-public:fa-pen-to-square"
                  title="Edit"
                  class="pointer icon-hover primary"
                  @click=${() => this._onToggleExpand(index)}></ucdlib-icon>
              `}
            </div>
            <div ?hidden=${!this.expandedItems.includes(index)} class='o-box'>
              ${this.renderFormItem(item, index)}
            </div>
          </div>
          ${this.renderInsertBar(index)}
        `)}
      </div>
    ` : html`
      <div class='hint-text u-space-mb'>
        Create rubric items for reviewers to use when evaluating applications.
        Scores for each item will be averaged to determine the overall score for an applicant.
      </div>
      <div class='hint-text u-space-mb'>
        Start by making a single item, click the "Create" button, then add more items as needed.
      </div>
      ${this.renderFormItem(this.editedRubricItems.length ? this.editedRubricItems[0] : {}, 0, {noActions: true})}
    `}
    <button type='submit' class="btn btn--primary border-box">${this.hasRubric ? 'Save Items' : 'Create'}</button>
    </form>
  `;
}

export function renderFormItem(item, index, args={}) {
  const title = item.title || '';
  const description = item.description || '';
  const weight = item.weight || '1';
  const rangeMin = item.range_min || '1';
  const rangeMax = item.range_max || '5';
  const rangeStep = item.range_step || '1';
  const noActions = args.noActions || false;
  const noMoveUp = index === 0;
  const noMoveDown = index === this.editedRubricItems.length - 1;

  const errors = {};
  Object.keys(this.fieldsWithErrors).forEach(field => {
    if ( Array.isArray(this.fieldsWithErrors[field]) ) {
      errors[field] = this.fieldsWithErrors[field].includes(index);
    }
  });
  return html`
    <div>
      <div>
        <div class='field-container ${errors.title ? 'error' : ''}'>
          <label>Item Title</label>
          <input type="text" .value=${title} maxlength='200' @input=${(e) => this._onFormInput(index, 'title', e.target.value)}>
        </div>
        <div class='field-container ${errors.description ? 'error' : ''}'>
          <label>Description</label>
          <textarea
            rows="3"
            maxlength='500'
            placeholder="An optional brief description for the item"
            @input=${(e) => this._onFormInput(index, 'description', e.target.value)}
            .value=${description}>
          </textarea>
        </div>
      </div>
      <fieldset>
        <legend>Scoring</legend>
        <div class='l-4col'>
          <div class='l-first field-container ${errors.weight ? 'error' : ''}'>
            <label class='overflow-elipsis'>Item Weight</label>
            <input type="number" min="1" max="100" .value=${weight} @input=${(e) => this._onFormInput(index, 'weight', e.target.value)}>
          </div>
          <div class='l-second field-container ${errors.range_min ? 'error' : ''}'>
            <label class='overflow-elipsis'>Range Min</label>
            <input type="number" min="1" max="100" .value=${rangeMin} @input=${(e) => this._onFormInput(index, 'range_min', e.target.value)}>
          </div>
          <div class='l-third field-container ${errors.range_max ? 'error' : ''}'>
            <label class='overflow-elipsis'>Range Max</label>
            <input type="number" min="1" max="100" .value=${rangeMax} @input=${(e) => this._onFormInput(index, 'range_max', e.target.value)}>
          </div>
          <div class='l-fourth field-container ${errors.range_step ? 'error' : ''}'>
            <label class='overflow-elipsis'>Range Interval</label>
            <input type="number" min="1" max="100" .value=${rangeStep} @input=${(e) => this._onFormInput(index, 'range_step', e.target.value)}>
          </div>
        </div>
      </fieldset>
      <div ?hidden=${noActions} class='l-3col'>
        <div class='l-first u-space-mb'>
          <span
            class="marketing-highlight__cta border-box category-brand--double-decker width-100"
            @click=${() => this._onDeleteItem(index)}>
            Delete</span>
        </div>
        <div class='l-second u-space-mb'>
          <button
            type='button'
            ?disabled=${noMoveUp}
            @click=${() => this._onMoveItem(index, 'up')}
            class="btn btn--alt3 btn--block border-box">Move Up</button>
        </div>
        <div class='l-third u-space-mb'>
          <button
            type='button'
            ?disabled=${noMoveDown}
            @click=${() => this._onMoveItem(index, 'down')}
            class="btn btn--alt3 btn--block border-box">Move Down</button>
        </div>
      </div>
    </div>
  `
}

export function renderInsertBar(index, direction='after') {
  const arrayIndex = direction === 'after' ? index + 1 : index;
  return html`
    <div class='insert-bar'>
      <div class='border-bottom-blue flex-grow'></div>
      <div class='u-space-mx'>
        <ucdlib-icon
          icon="ucd-public:fa-circle-plus"
          title="Add Item"
          @click=${() => this._onInsertItem(arrayIndex)}
          class="icon-hover primary pointer">
        </ucdlib-icon></div>
      <div class='border-bottom-blue flex-grow'></div>
    </div>
  `;
}

export function renderUploadPanel(){
  return html`
    <div class="panel panel--icon panel--icon-custom o-box category-brand--poppy">
      <h2 class="panel__title">
        <ucdlib-icon icon="ucd-public:fa-file-pdf" class="panel__custom-icon"></ucdlib-icon>
        <span>Rubric Document</span>
      </h2>
      <section>
        <div class='hint-text u-space-mb'>
          Upload a full rubric as a PDF or Word document for the reviewer to download and reference.
          Should be used in conjunction with the rubric items form when a rubric is complex.
        </div>
        <div ?hidden=${!this.uploadedFile}>
          <ul class="list--download u-space-mb">
          <li class='flex-center flex-space-between'>
            <a class="icon icon--link icon--download" href=${this.uploadedFile} target='_blank'>${this.uploadedFileName}</a>
            <div class='u-space-ml flex-center upload-action-icons'>
              <ucdlib-icon
                title='Remove'
                icon="ucd-public:fa-circle-minus"
                class="icon-hover double-decker pointer"
                @click=${this._onUploadFileRemove}>
              </ucdlib-icon>
              <ucdlib-icon
                title='Replace'
                icon="ucd-public:fa-upload"
                class="icon-hover primary pointer u-space-ml--small"
                @click=${() => this.hideFileUploadInput = !this.hideFileUploadInput}>
              </ucdlib-icon>
            </div>
          </li>
          </ul>
        </div>
        <input type="file" @change=${this._onUploadFileChange} ?hidden=${this.hideFileUploadInput}>
      </section>
    </div>
  `;
}

export function renderCalculationPanel(){
  return html`
    <div class="panel panel--icon panel--icon-custom o-box category-brand--sage">
      <h2 class="panel__title">
        <ucdlib-icon icon="ucd-public:fa-calculator" class="panel__custom-icon"></ucdlib-icon>
        <span>Scoring Calculation</span>
      </h2>
      <section>
        <div class='hint-text u-space-mb'>
          How should the overall rubric score be calculated?
        </div>
        <select @change=${this._onCalculationChange} .value=${this.scoringCalculation}>
          <option value='sum' ?selected=${this.scoringCalculation === 'sum'}>Sum</option>
          <option value='average' ?selected=${this.scoringCalculation === 'average'}>Average</option>
        </select>
      </section>
    </div>
  `;
}

export function renderCopyRubricForm() {
  return html`
    <div class='l-container'>
      <div class="panel o-box o-box--large gold-box l-shrink">
        <form @submit=${this._onCopyRubricSubmit}>
          <div class='field-container'>
            <label>Copy Rubric from a Previous Cycle</label>
            <select @change=${(e) => this.cycleToCopyId = e.target.value}>
              <option value='0' ?selected=${!this.cycleToCopyId} disabled>Select a cycle</option>
              ${this.cyclesWithRubric.map(cycle => html`
                <option value=${cycle.cycle_id} ?selected=${this.cycleToCopyId == cycle.cycle_id}>${cycle.title}</option>
              `)}
            </select>
          </div>
          <button ?disabled=${this.copyFormDisabled || !this.cycleToCopyId} type='submit' class="btn btn--primary border-box">Copy</button>
        </form>
      </div>
    </div>

  `;
}
