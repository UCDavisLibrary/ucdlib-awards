import { html } from 'lit';

export function render() {
return html`
  <div>
    <div class='row border-bottom-gold u-space-pb table-head'>
      <div class='select-box'>
        <input type="checkbox" @input=${() => this.toggleSupporterSelect('all')} .checked=${this._allSelected}>
      </div>
      <div class='supporter-name flex-center'>
        <div>Supporter</div>
        ${renderSortIcon.call(this, 'supporterName', this.sortDirection?.supporterName)}
      </div>
      <div class='lg-screen-flex flex-center'>
        <div>Applicant</div>
        ${renderSortIcon.call(this, 'applicantName', this.sortDirection?.applicantName)}
      </div>
      <div class='lg-screen-flex flex-center'>
        <div>Letter Submitted</div>
        ${renderSortIcon.call(this, 'dateSubmitted', this.sortDirection?.dateSubmitted)}
      </div>
    </div>
    <div class='table-body'>
      ${this._supporters.map(supporter => renderSupporterRow.call(this, supporter))}
    </div>
  </div>
`;}

function renderSupporterRow(supporter){
  const expanded = supporter.expanded;
  const rowId = supporter.id;

  const supporterEmail = supporter.supporterEmail || '';
  const applicantEmail = supporter.applicantEmail || '';

  const submitted = supporter.submitted;
  const dateSubmitted = supporter.dateSubmitted;
  const timeSubmitted = supporter.timeSubmitted;

  return html`
  <div class='row ${expanded ? 'has-mb-details' : ''}'>
    <div class='select-box'>
      <input type="checkbox" @input=${() => this.toggleSupporterSelect(rowId)} .checked=${supporter.selected}>
    </div>
    <div class='flex-grow'>
      <div>
        <div>${supporter.supporterName}</div>
        <div ?hidden=${!supporterEmail} class='small-text overflow-anywhere'><a href='mailto:${supporterEmail}'>${supporterEmail}</a></div>
      </div>
      <div class='${expanded ? 'mb-details' : 'hidden'}'>
        <div class='flex-center'>
          <div class='u-space-mr--small primary bold'>Applicant Name:</div>
          <div>${supporter.applicantName}</div>
        </div>
        <div class='flex-center'>
          <div class='u-space-mr--small primary bold'>Applicant Email:</div>
          <div ?hidden=${!applicantEmail} class='small-text overflow-anywhere'><a href='mailto:${applicantEmail}'>${applicantEmail}</a></div>
        </div>
        <div class='flex-center'>
          <div class='u-space-mr--small primary bold'>Submitted:</div>
          ${submitted ? html`
            <div class='flex-center flex-wrap'>
              <div class='no-wrap u-space-mr--small'>${dateSubmitted}</div>
              <div class='no-wrap u-space-mr--small'>${timeSubmitted}</div>
            </div>
          ` : html`<div class='u-space-mr--small double-decker'>Not Submitted</div>`}
        </div>
      </div>
    </div>
    <div class='lg-screen-block'>
        <div>${supporter.applicantName}</div>
        <div ?hidden=${!applicantEmail} class='small-text overflow-anywhere'><a href='mailto:${applicantEmail}'>${applicantEmail}</a></div>
    </div>
    <div class='lg-screen-flex flex-wrap'>
      ${submitted ? html`
        <div class='no-wrap u-space-mr--small'>${dateSubmitted}</div>
        <div class='no-wrap u-space-mr--small'>${timeSubmitted}</div>
      ` : html`<div class='u-space-mr--small double-decker'>Not Submitted</div>`}
    </div>
    <div class='mb-screen-flex'>
      <div class='view-toggle-icon'>
        ${ expanded ? html`
        <ucdlib-icon
          @click=${() => this.toggleSupporterExpand(rowId)}
          icon="ucd-public:fa-caret-up">
        </ucdlib-icon>
        ` : html`
        <ucdlib-icon
          @click=${() => this.toggleSupporterExpand(rowId)}
          icon="ucd-public:fa-caret-down">
        </ucdlib-icon>
        `}
      </div>
    </div>
  </div>
  `;
}


function renderSortIcon(field, sortDirection){
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
        @click=${() => this.sortSupporters(field, 'asc')}
        class="sort-icon__up ${asc ? 'active' : ''}">
      </ucdlib-icon>
      <ucdlib-icon
      icon="ucd-public:fa-caret-down"
      @click=${() => this.sortSupporters(field, 'desc')}
      class="sort-icon__down ${desc ? 'active' : ''}">
      </ucdlib-icon>
    </div>
  `;
}
