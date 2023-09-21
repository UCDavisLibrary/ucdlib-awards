import { html } from 'lit';

export function render() {
return html`
  <div>
    <div class='row'>
      <div class='select-box'>
        <input type="checkbox">
      </div>
      <div class='applicant-name u-space-ml'>Name</div>
      <div class='lg-screen-block applicant-category u-space-ml' ?hidden=${!this.showCategories}>Category</div>
      <div class='lg-screen-block applicant-status u-space-ml'>Status</div>
      <div class='lg-screen-block applicant-submission-date u-space-ml'>Submission Date</div>
    </div>
    <div>
      ${this._applicants.map(applicant => html`
      <div class='row'>
        <div class='select-box'>
          <input type="checkbox">
        </div>
        <div class='applicant-name u-space-ml'>${applicant.first_name + ' ' + applicant.last_name}</div>
        <div class='lg-screen-block applicant-category u-space-ml' ?hidden=${!this.showCategories}>${applicant.applicationCategory?.label || ''}</div>
        <div class='lg-screen-block applicant-status u-space-ml'>Status</div>
        <div class='lg-screen-block applicant-submission-date u-space-ml'>Submission Date</div>
      </div>
    `)}
    </div>
  </div>

`;}
