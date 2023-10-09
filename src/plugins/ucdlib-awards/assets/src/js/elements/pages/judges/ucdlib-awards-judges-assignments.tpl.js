import { html } from 'lit';


export function render() {
return html`
  <ucdlib-awards-modal dismiss-text='Close'>
    <div>
      <h3>Assignments</h3>
      <div class="responsive-table" role="region" aria-label="Table of assignments" tabindex="0">
        <table class='table--hover'>
          <thead>
            <tr>
              <th rowspan="2">Applicant</th>
              <th colspan=${this._judges.length} style='text-align:${this._judges.length > 1 ? 'center' : 'left'};'>Judge</th>
            </tr>
            <tr>
              ${this._judges.map(judge => html`
                <th class='judge-name'>${judge.name}<sup ?hidden=${!this.categories.length}>${judge.categorySuperscript || ''}</sup></th>
              `)}
            </tr>
          </thead>
          <tbody>
            ${this._applicants.map(applicant => html`
              <tr>
                <td>${applicant.name}<sup ?hidden=${!this.categories.length}>${applicant.categorySuperscript || ''}</sup></td>
                ${this._judges.map(judge => html`
                  <td>
                    ${applicant.byJudgeStatus.find(s => s.judgeId == judge.id) ? html`
                      <span>${applicant.byJudgeStatus.find(s => s.judgeId == judge.id).status.label}</span>
                    ` : ''}
                  </td>
                `)}
              </tr>
            `)}
          </tbody>
        </table>
      </div>
      <div ?hidden=${!this.categories.length}>
        <div class='primary bold'>Categories</div>
        ${this.categories.map((category, i) => html`
          <div><sup>${i + 1}</sup> ${category.label}</div>
        `)}
      </div>
    </div>
  </ucdlib-awards-modal>

`;}
