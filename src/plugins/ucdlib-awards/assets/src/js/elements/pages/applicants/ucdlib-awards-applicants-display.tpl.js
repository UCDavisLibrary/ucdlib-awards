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
  </div>
`;}

export function renderApplicantRow(applicant){
  const expanded = applicant.expanded;
  const status = applicant.applicationStatusLabel;
  const category = applicant.category;
  const dateSubmitted = datetimeUtils.mysqlToLocaleString(applicant.applicationEntry?.date_created_sql);
  const timeSubmitted = datetimeUtils.mysqlToLocaleStringTime(applicant.applicationEntry?.date_created_sql);

  return html`
  <div class='row ${this.showCategories ? 'with-categories' : ''} ${expanded ? 'has-mb-details' : ''}'>
    <div class='select-box'>
      <input type="checkbox" @input=${() => this.toggleApplicantSelect(applicant.user_id)} .checked=${applicant.selected}>
    </div>
    <div class='flex-grow'>
      <div>${applicant.name}</div>
      <div class='${expanded ? 'mb-details' : 'hidden'}'>
        <div class='flex-center' ?hidden=${!this.showCategories}>
          <div class='u-space-mr--small primary bold'>Category:</div>
          <div>${category}</div>
        </div>
        <div class='flex-center'><div class='u-space-mr--small primary bold'>Status:</div><div>${status}</div></div>
        <div class='flex-center'>
          <div class='u-space-mr--small primary bold'>Submitted:</div>
          <div class='flex-center flex-wrap'>
            <div class='no-wrap u-space-mr--small'>${dateSubmitted}</div>
            <div class='no-wrap'>${timeSubmitted}</div>
          </div>
        </div>
      </div>
    </div>
    ${this.showCategories ? html`<div class='lg-screen-block'>${category}</div>` : html``}
    <div class='lg-screen-block applicant-status'>${status}</div>
    <div class='lg-screen-flex flex-wrap'>
      <div class='no-wrap u-space-mr--small'>${dateSubmitted}</div>
      <div class='no-wrap'>${timeSubmitted}</div>
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
