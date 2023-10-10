import { html } from 'lit';

export function render() {
return html`
  <ucdlib-pages selected="eval-${this.page}">
    <div id='eval-loading'>
      <div class='loading-icon'>
        <ucdlib-icon icon="ucd-public:fa-circle-notch"></ucdlib-icon>
      </div>
    </div>
    <div id='eval-error'>
      <div class='l-container l-shrink'>
        <div class="brand-textbox category-brand__background category-brand--double-decker u-space-mb">
          <p>${this.errorMessage}</p>
        </div>
      </div>
    </div>
    <div id='eval-applicant-select'>applicant select</div>
    <div id='eval-judge-select'>${this.renderAdminJudgeSelect()}</div>
  </ucdlib-pages>

`;}

// admin can select a judge to view their assigned applicants
export function renderAdminJudgeSelect(){
return html`
  <div class='l-container l-shrink'>
    <div class='field-container'>
      <label>View evaluation form as a judge:</label>
      <select @change=${this._onAdminJudgeSelect}>
        <option value='' ?selected=${!this.adminSelectedJudgeId} disabled>Select a judge</option>
        ${this.judges.map(judge => html`
          <option value=${judge.id} ?selected=${this.adminSelectedJudgeId == judge.id}>${judge.name}</option>
        `)}
      </select>
    </div>
  </div>
  `;
}
