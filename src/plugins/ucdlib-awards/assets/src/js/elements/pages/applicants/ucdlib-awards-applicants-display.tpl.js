import { html } from 'lit';
import datetimeUtils from "../../../utils/datetime.js";

export function render() {
return html`
  <div>
    <div class='row border-bottom-gold u-space-pb table-head ${this.showCategories ? 'with-categories' : ''}'>
      <div class='select-box'>
        <input type="checkbox" @input=${() => this.toggleApplicantSelect('all')} .checked=${this._allSelected}>
      </div>
      <div class='applicant-name flex-center'>
        <div>Name</div>
        ${this.renderSortIcon('name', this.sortDirection?.name)}

      </div>
      ${this.showCategories ? html`
        <div class='lg-screen-flex flex-center'>
          <div>Category</div>
          ${this.renderSortIcon('category', this.sortDirection?.category)}
        </div>` : html``}
      <div class='lg-screen-flex flex-center'>
        <div>Status</div>
        ${this.renderSortIcon('applicationStatusLabel', this.sortDirection?.applicationStatusLabel)}
      </div>
      <div class='lg-screen-flex flex-center'>
        <div>Submitted</div>
        ${this.renderSortIcon('submitted', this.sortDirection?.submitted)}
      </div>
    </div>
    <div class='table-body'>
      ${this._applicants.map(this.renderApplicantRow)}
    </div>
    <ucdlib-awards-modal id='assignment-modal' dismiss-text='Close'>
      ${this.renderAssignmentModalContent()}
    </ucdlib-awards-modal>
    <ucdlib-awards-modal id='upload-modal' dismiss-text='Cancel' content-title='Update Upload' .closeOnConfirm=${false}>
      ${this.renderUploadModalContent()}
    </ucdlib-awards-modal>
  </div>
`;}

export function renderApplicantRow(applicant){
  const expanded = applicant.expanded;
  const status = applicant.applicationStatusLabel;
  const assignmentStatuses = ['assigned', 'evaluated'];
  const hasAssignments = assignmentStatuses.includes(applicant.applicationStatus?.value);
  const category = applicant.category;
  const dateSubmitted = datetimeUtils.mysqlToLocaleString(applicant.applicationEntry?.date_created_sql, {keepTimezone: true});
  const timeSubmitted = datetimeUtils.mysqlToLocaleStringTime(applicant.applicationEntry?.date_created_sql, {keepTimezone: true});

  return html`
  <div class='row ${this.showCategories ? 'with-categories' : ''} ${expanded ? 'has-mb-details' : ''}'>
    <div class='select-box'>
      <input type="checkbox" @input=${() => this.toggleApplicantSelect(applicant.user_id)} .checked=${applicant.selected}>
    </div>
    <div class='flex-grow'>
      <div>
        <div>${applicant.name}</div>
        <div ?hidden=${!applicant.hasConflictOfInterest} class='double-decker bold small-text'>Conflict of Interest</div>
        <div ?hidden=${!this.isActiveCycle || !applicant.uploadedFieldIds?.length}>
          <a class='pointer' @click=${() => this._onManageUploadsClick(applicant.user_id)}>Replace Submitted Document(s)</a>
        </div>
      </div>
      <div class='${expanded ? 'mb-details' : 'hidden'}'>
        <div class='flex-center' ?hidden=${!this.showCategories}>
          <div class='u-space-mr--small primary bold'>Category:</div>
          <div>${category}</div>
        </div>
        <div class='flex-center'>
          <div class='u-space-mr--small primary bold'>Status:</div>
          <div>
            ${hasAssignments ? html`
              <a class='pointer' @click=${() => this._onAssignmentView(applicant.user_id)}>${status}</a>
            ` : html`
              <span>${status}</span>
            `}
          </div>
        </div>
        <div class='flex-center'>
          <div class='u-space-mr--small primary bold'>Submitted:</div>
          <div class='flex-center flex-wrap'>
            <div class='no-wrap u-space-mr--small'>${dateSubmitted}</div>
            <div class='no-wrap u-space-mr--small'>${timeSubmitted}</div>
          </div>
        </div>
      </div>
    </div>
    ${this.showCategories ? html`<div class='lg-screen-block'>${category}</div>` : html``}
    <div class='lg-screen-block applicant-status'>
      ${hasAssignments ? html`
        <a class='pointer' @click=${() => this._onAssignmentView(applicant.user_id)}>${status}</a>
      ` : html`
        <span>${status}</span>
      `}
    </div>
    <div class='lg-screen-flex flex-wrap'>
      <div class='no-wrap u-space-mr--small'>${dateSubmitted}</div>
      <div class='no-wrap u-space-mr--small'>${timeSubmitted}</div>
    </div>
    <div class='mb-screen-flex'>
      <div class='view-toggle-icon'>
        ${ expanded ? html`
        <ucdlib-icon
          @click=${() => this.toggleApplicantExpand(applicant.user_id)}
          icon="ucd-public:fa-caret-up">
        </ucdlib-icon>
        ` : html`
        <ucdlib-icon
          @click=${() => this.toggleApplicantExpand(applicant.user_id)}
          icon="ucd-public:fa-caret-down">
        </ucdlib-icon>
        `}
      </div>
    </div>
  </div>
  `;
}

export function renderAssignmentModalContent() {
  if ( !this.assignmentStatusApplicant ) return html``;
  const applicant = this.applicants.find(a => a.user_id === this.assignmentStatusApplicant);
  if ( !applicant ) return html``;

  const assignedJudgeIds = applicant.applicationStatus?.assignedJudgeIds || [];
  const evaluatedJudgeIds = applicant.applicationStatus?.evaluatedJudgeIds || [];
  const conflictOfInterestJudgeIds = applicant.applicationStatus?.conflictOfInterestJudgeIds || [];

  const judgeIds = [
    ...assignedJudgeIds,
    ...evaluatedJudgeIds
  ];
  const judges = this.judges.filter(j => judgeIds.includes(j.id));
  judges.sort((a, b) => {
    if ( a.name < b.name ) return -1;
    if ( a.name > b.name ) return 1;
    return 0;
  });

  const name = applicant.name;
  return html`
  <div dismiss-text='Close'>
      <h4>Reviewer Assignments for ${name}</h4>
      <ul class='list--arrow'>
        ${judges.map(judge => html`
          <li>${judge.name}
            <span ?hidden=${!evaluatedJudgeIds.includes(judge.id)}> - Evaluation Completed</span>
            <span ?hidden=${!conflictOfInterestJudgeIds.includes(judge.id)}> - <span class='double-decker'>Conflict of Interest</span></span>
          </li>
        `)}
      </ul>
</div>`
}

export function renderUploadModalContent() {
  if ( !this.manageUploadApplicantId ) return html``;
  const applicant = this.applicants.find(a => a.user_id === this.manageUploadApplicantId);
  if ( !applicant ) return html``;

  const availableFields = (this.uploadFields || []).filter(field => (applicant.uploadedFieldIds || []).includes(field.id));

  return html`
    <div>
      <p>Replace an uploaded file for <strong>${applicant.name}</strong>.</p>
      <div class='alert alert--warning'>This will permanently replace the applicant's existing file. This action cannot be undone.</div>
      <div class='field-container'>
        <label>Upload Field</label>
        <select @change=${e => this._onUploadFieldSelect(e.target.value)} .value=${this._selectedUploadFieldId}>
          <option value=''>Select a field</option>
          ${availableFields.map(field => html`
            <option value=${field.id} ?selected=${this._selectedUploadFieldId === field.id}>${field.label}</option>
          `)}
        </select>
      </div>
      <div class='field-container'>
        <label>Replacement File</label>
        <input type='file' @change=${e => this._onUploadFileChange(e)}>
      </div>
    </div>
    <button
      slot='confirmButton'
      class='btn btn--primary'
      ?disabled=${!this._selectedUploadFieldId || !this._selectedUploadFile || this.uploadSubmitting}
      @click=${() => this._onUploadConfirm()}>
      ${this.uploadSubmitting ? 'Uploading...' : 'Replace File'}
    </button>
  `;
}

export function renderSortIcon(field, sortDirection){
  let asc = false;
  let desc = false;
  if ( typeof sortDirection === 'string' ) {
    asc = sortDirection.toLowerCase().startsWith('a');
    desc = sortDirection.toLowerCase().startsWith('d');
  }
  return html`
    <div class='sort-icon'>
      <ucdlib-icon
        icon="ucd-public:fa-caret-up"
        @click=${() => this.sortApplicants(field, 'asc')}
        class="sort-icon__up ${asc ? 'active' : ''}">
      </ucdlib-icon>
      <ucdlib-icon
      icon="ucd-public:fa-caret-down"
      @click=${() => this.sortApplicants(field, 'desc')}
      class="sort-icon__down ${desc ? 'active' : ''}">
      </ucdlib-icon>
    </div>
  `;
}
