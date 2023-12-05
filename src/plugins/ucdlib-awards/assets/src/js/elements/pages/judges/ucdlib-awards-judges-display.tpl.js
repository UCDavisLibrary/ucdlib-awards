import { html } from 'lit';

export function render() {
  if ( !this._judges.length ) return html`
    <div class='brand-textbox'>
      No reviewers found!
    </div>
  `;
  return html`
    <div>
      <div class='row border-bottom-gold u-space-pb table-head ${this.showCategories ? 'with-categories' : ''}'>
        <div class='select-box'>
          <input type="checkbox" @input=${() => this.toggleJudgeSelect('all')} .checked=${this._allSelected}>
        </div>
        <div class='judge-name flex-center'>
          <div>Name</div>
          ${this.renderSortIcon('name', this.sortDirection?.name)}
        </div>
        ${this.showCategories ? html`
          <div class='lg-screen-flex flex-center'>
            <div>Category</div>
            ${this.renderSortIcon('categoryLabel', this.sortDirection?.categoryLabel)}
          </div>` : html``}
        <div class='lg-screen-flex flex-center'>
          <div class='overflow-anywhere'>Assigned</div>
          ${this.renderSortIcon('assignedCt', this.sortDirection?.assignedCt)}
        </div>
        <div class='lg-screen-flex flex-center'>
          <div class='overflow-anywhere'>Evaluated</div>
          ${this.renderSortIcon('evaluatedCt', this.sortDirection?.evaluatedCt)}
        </div>
      </div>
      <div class='table-body'>
        ${this._judges.map(this.renderJudgeRow)}
      </div>
    </div>
  `;}

  export function renderJudgeRow(judge){
    const expanded = judge.expanded;
    const category = judge.categoryLabel;
    const email = judge.email || '';
    const assigned = judge.assignedCt;
    const evaluated = judge.evaluatedCt;

    return html`
    <div class='row ${this.showCategories ? 'with-categories' : ''} ${expanded ? 'has-mb-details' : ''}'>
      <div class='select-box'>
        <input type="checkbox" @input=${() => this.toggleJudgeSelect(judge.id)} .checked=${judge.selected}>
      </div>
      <div class='flex-grow'>
        <div>
          <div>${judge.name}</div>
          <div ?hidden=${!email} class='small-text overflow-anywhere'><a href='mailto:${email}'>${email}</a></div>
          <div ?hidden=${!judge.hasConflictOfInterest} class='small-text double-decker bold'>Conflict of Interest</div>
        </div>
        <div class='${expanded ? 'mb-details' : 'hidden'}'>
          <div class='flex-center' ?hidden=${!this.showCategories}>
            <div class='u-space-mr--small primary bold'>Category:</div>
            <div>${category}</div>
          </div>
          <div class='flex-center'><div class='u-space-mr--small primary bold'>Assigned:</div><div>${assigned}</div></div>
          <div class='flex-center'><div class='u-space-mr--small primary bold'>Evaluated:</div><div>${evaluated}</div></div>
        </div>
      </div>
      ${this.showCategories ? html`<div class='lg-screen-block'>${category}</div>` : html``}
      <div class='lg-screen-block'>${assigned}</div>
      <div class='lg-screen-block'>${evaluated}</div>
      <div class='mb-screen-flex'>
        <div class='view-toggle-icon'>
          ${ expanded ? html`
          <ucdlib-icon
            @click=${() => this.toggleJudgeExpand(judge.id)}
            icon="ucd-public:fa-caret-up">
          </ucdlib-icon>
          ` : html`
          <ucdlib-icon
            @click=${() => this.toggleJudgeExpand(judge.id)}
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
          @click=${() => this.sortJudges(field, 'asc')}
          class="sort-icon__up ${asc ? 'active' : ''}">
        </ucdlib-icon>
        <ucdlib-icon
        icon="ucd-public:fa-caret-down"
        @click=${() => this.sortJudges(field, 'desc')}
        class="sort-icon__down ${desc ? 'active' : ''}">
        </ucdlib-icon>
      </div>
    `;
  }
