import { html } from 'lit';

export function render() {
return html`
  <div class="l-2col l-2col--67-33">
    <div class="l-first panel o-box">
      <ucdlib-pages selected="eval-${this.page}">
        <div id='eval-loading'>
          <div class='loading-icon'>
            <ucdlib-icon icon="ucd-public:fa-circle-notch"></ucdlib-icon>
          </div>
        </div>
        <div id='eval-error'>
          <div>
            <div class="brand-textbox category-brand__background category-brand--double-decker u-space-mb">
              <p>${this.errorMessage}</p>
            </div>
          </div>
        </div>
        <div id='eval-applicant-select'>${this.renderApplicantList()}</div>
        <div id='eval-judge-select'>${this.renderAdminJudgeSelect()}</div>
        <div id='eval-applicant'>${this.renderApplicantEvaluationForm()}</div>
      </ucdlib-pages>
    </div>
    <div class="l-second panel o-box">
      ${this.renderEvaluationStatusPanel()}
      ${this.renderRubricPanel()}
    </div>

  </div>

`;}

export function renderApplicantEvaluationForm(){
  if ( !this.selectedApplicant || !this.selectedApplicant.applicationEntry?.entry_id ) return html``;

  const applicant = this.selectedApplicant;
  const applicationEntry = this.applicationEntryCache[applicant.applicationEntry.entry_id];
  if ( !applicationEntry || !applicationEntry.success ) return html``;

  const applicationHtml = applicationEntry.data.htmlDoc;
  const blob = new Blob([applicationHtml], {type: 'text/html'});
  const applicationDl = URL.createObjectURL(blob);

  let showCOI = ['new', 'conflict-of-interest'].includes(applicant.applicationStatus.slug) ? true : false;
  if ( showCOI && this.coiCheck === 'no' ) showCOI = false;

  return html`
    <div>
      <ol class="breadcrumbs u-space-pl--flush">
        <li><a class='pointer' @click=${() => this.page = 'applicant-select'}>Your Assigned Applicants</a></li>
        <li>${applicant.name}</li>
      </ol>
      <div class='flex-center flex-space-between flex-wrap u-space-mb'>
        <h3 class='u-space-mr'>${applicant.name}</h3>
        <ul class="list--download" style='margin-bottom:.25em;'>
          <li><a class="icon icon--link icon--download pointer" href=${applicationDl} target='_blank'>Download Application</a></li>
        </ul>
      </div>
      <div ?hidden=${!showCOI} class='coi'>
        ${applicant.applicationStatus.slug == 'new' ? html`
          <div>
            <div>
              <label>Do you have a potential conflict of interest that could prevent you from impartially evaluating this applicant?</label>
              <div class="radio">
                <ul class="list--reset">
                  <li>
                    <input
                      id="coi-check-yes"
                      name='coi'
                      type="radio"
                      value='yes'
                      class="radio"
                      @input=${this._onCoiCheck}
                      .checked=${this.coiCheck === 'yes'}>
                      <label for="coi-check-yes">Yes</label>
                  </li>
                  <li>
                    <input
                      id="coi-check-no"
                      name='coi'
                      type="radio"
                      value='no'
                      class="radio"
                      @input=${this._onCoiCheck}
                      .checked=${this.coiCheck === 'no'}>
                      <label for="coi-check-no">No</label>
                  </li>
                </ul>
              </div>
            </div>
            <div ?hidden=${this.coiCheck !== 'yes'} class='u-space-mt'>
              <p>Thank you for your response. Click the button below to notify a ${this.awardsTitle} administrator who will then reassign this applicant.</p>
              <form @submit=${this._onCoiYesSubmit}>
                <div class="field-container">
                  <label>Details</label>
                  <textarea
                    rows="3"
                    placeholder="Please provide any details you would like to share with the administrator."
                    @input=${e => this.coiDetails = e.target.value}
                    .value=${this.coiDetails}>
                  </textarea>
                </div>
               <button type='submit' class="btn btn--alt3 border-box">Notify administrator</button>
              </form>
            </div>
          </div>
        ` : html`
          <div>
            You indicated that you have a potential conflict of interest with this applicant.
            A ${this.awardsTitle} administrator will reassign this applicant to another judge.
          </div>
        `}
      </div>

    </div>
  `
}

// admin can select a judge to view their assigned applicants
export function renderAdminJudgeSelect(){
return html`
  <div>
    <div class='field-container'>
      <label>View evaluation form as a judge:</label>
      <select @change=${this._onAdminJudgeSelect} class='input-max-width'>
        <option value='' ?selected=${!this.adminSelectedJudgeId} disabled>Select a judge</option>
        ${this.judges.map(judge => html`
          <option value=${judge.id} ?selected=${this.adminSelectedJudgeId == judge.id}>${judge.name}</option>
        `)}
      </select>
    </div>
  </div>
  `;
}

export function renderApplicantList(){
  if ( !this.applicants || !this.applicants.length ) return html`
    <div class="brand-textbox category-brand__background u-space-mb">
      <p>You have no assigned applicants.</p>
    </div>
  `;
  return html`
    <h3>Your Assigned Applicants</h3>
    <div class='applicant-list'>
      <div class='applicant-list-row applicant-list-row--head l-2col l-2col--67-33'>
        <div class='l-first applicant-list-cell__name'>Name</div>
        <div class='l-second applicant-list-cell__status'>Status</div>
      </div>
      ${this.applicants.map(applicant => html`
        <div class='applicant-list-row applicant-list-row--body l-2col l-2col--67-33' @click=${() => this._onApplicantSelect(applicant.user_id)}>
          <div class='l-first applicant-list-cell__name'>${applicant.name}</div>
          <div class='l-second applicant-list-cell__status ${applicant.applicationStatus.brand}'>${applicant.applicationStatus.label}</div>
        </div>
      `)}
    </div>
  `;
}

export function renderEvaluationStatusPanel(){
  if ( !this.judge || !Object.keys(this.judge).length ) return html``;

  return html`
    <div class="panel panel--icon panel--icon-custom o-box category-brand--poppy">
      <h2 class="panel__title">
        <ucdlib-icon icon="ucd-public:fa-gavel" class="panel__custom-icon"></ucdlib-icon>
        <span>Evaluation Status</span>
      </h2>
      <section>
        <div>
          <label>Judge</label>
          <div>${this.judge.name}</div>
        </div>
        <div class='u-space-mt'>
          <a ?hidden=${!this.judges.length} class='pointer' @click=${() => this.page = 'judge-select'}>Select a different judge</a>
        </div>
      </section>
    </div>
  `;
}

export function renderRubricPanel(){
  if ( !this._rubricItems ) return html``;
  return html`
    <div class="panel panel--icon panel--icon-custom o-box category-brand--sage rubric-panel">
      <h2 class="panel__title">
        <ucdlib-icon icon="ucd-public:fa-list-check" class="panel__custom-icon"></ucdlib-icon>
        <span>Evaluation Rubric</span>
      </h2>
      <section>
        <ul class='list--arrow'>
          ${this._rubricItems.map(item => html`
            <li>
              <div class='flex-center'>
                <div>${item.label}</div>
                <div ?hidden=${!item.hasDetails} class='u-space-ml--small'>
                  <ucdlib-icon
                  icon="ucd-public:fa-caret-down"
                  class="expand-icon icon-hover pointer ${item.expanded ? 'expanded' : 'not-expanded'}"
                  @click=${() => this._onRubricItemToggle(item.rubric_item_id)}>
                </ucdlib-icon>
                </div>
              </div>
              <div .hidden=${!item.expanded} class='hint-text hint-text--grey'>${item.description}</div>
            </li>
          `)}
        </ul>
        <a class="icon-ucdlib" href=${this.rubricUploadedFile} ?hidden=${!this.rubricUploadedFile} target='_blank'>
          <ucdlib-icon class="" icon="ucd-public:fa-circle-chevron-right"></ucdlib-icon>
          <span>View Entire Rubric</span>
        </a>
      </section>
    </div>
  `;
}
