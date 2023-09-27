import { html } from 'lit';

export function render() {
return html`
  <h3 class='page-subtitle'>Evaluation Rubric</h3>
  <ucdlib-pages selected='rubric--${this.page}'>
    <div id='rubric--no-rubric'>${this.renderNoRubric()}</div>
    <div id='rubric--main'>
      <div class="l-2col l-2col--67-33">
        <div class="l-first panel o-box">
          ${this.renderForm()}
        </div>
        <div class="l-second panel o-box">
          ${this.renderUploadPanel()}
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
    ` : html`
      <div class='hint-text u-space-mb'>
        Create rubric items for judges to use when evaluating applications.
        Scores for each item will be averaged to determine the overall score for an applicant.
      </div>
      <div class='hint-text u-space-mb'>
        Start by making a single item, click the "Create" button, then add more items as needed.
      </div>
      ${this.renderFormItem(this.editedRubricItems.length ? this.editedRubricItems[0] : {}, 0, {noActions: true})}
    `}
    <button type='submit' class="btn btn--primary border-box">${this.hasRubric ? 'Save' : 'Create'}</button>
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
        <div class='field-container'>
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
          <div class='l-first field-container'>
            <label class='overflow-elipsis'>Item Weight</label>
            <input type="number" min="1" max="100" .value=${weight} @input=${(e) => this._onFormInput(index, 'weight', e.target.value)}>
          </div>
          <div class='l-second field-container'>
            <label class='overflow-elipsis'>Range Min</label>
            <input type="number" min="1" max="100" .value=${rangeMin} @input=${(e) => this._onFormInput(index, 'range_min', e.target.value)}>
          </div>
          <div class='l-third field-container'>
            <label class='overflow-elipsis'>Range Max</label>
            <input type="number" min="1" max="100" .value=${rangeMax} @input=${(e) => this._onFormInput(index, 'range_max', e.target.value)}>
          </div>
          <div class='l-fourth field-container'>
            <label class='overflow-elipsis'>Range Interval</label>
            <input type="number" min="1" max="100" .value=${rangeStep} @input=${(e) => this._onFormInput(index, 'range_step', e.target.value)}>
          </div>
        </div>
      </fieldset>
      <div ?hidden=${noActions} class='l-3col'>
        <div class='l-first u-space-mb'>
          <span class="marketing-highlight__cta border-box category-brand--double-decker width-100">Delete</span>
        </div>
        <div class='l-second u-space-mb'>
          <button type='button' class="btn btn--alt3 btn--block border-box">Move Up</button>
        </div>
        <div class='l-third u-space-mb'>
          <button type='button' class="btn btn--alt3 btn--block border-box">Move Down</button>
        </div>
      </div>
    </div>
  `
}

export function renderUploadPanel(){
  return html`
    <div class="panel panel--icon panel--icon-custom o-box category-brand--poppy">
      <h2 class="panel__title">
        <ucdlib-icon icon="ucd-public:fa-file-pdf" class="panel__custom-icon"></ucdlib-icon>
        <span>Rubric Document</span>
      </h2>
      <section>
        <div class='hint-text'>
          Upload a full rubric as a PDF or Word document for the judge to download and reference.
        </div>
      </section>
    </div>
  `;
}
