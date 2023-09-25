import { html } from 'lit';

export function render() {
return html`
  <ucdlib-pages selected='rubric--${this.page}'>
    <div id='rubric--no-rubric'>${this.renderNoRubric()}</div>
    <div id='rubric--main'>lets add a rubric</div>
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
