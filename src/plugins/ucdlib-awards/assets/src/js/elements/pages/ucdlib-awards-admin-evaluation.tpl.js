import { html } from 'lit';

export function render() {
return html`
  <div class="l-2col l-2col--67-33">
    <div class="l-first">
      <h3 class='page-subtitle'>Evaluation Scores</h3>
    </div>
    <div class="l-second" ?hidden=${!this.scores.length}>
      <a class="focal-link category-brand--primary pointer u-space-mb" @click=${this._onDownloadClick}>
        <div class="focal-link__figure focal-link__icon">
          <ucdlib-icon icon="ucd-public:fa-file-csv"></ucdlib-icon>
        </div>
        <div class="focal-link__body"><strong>Download All Scores</strong></div>
      </a>
    </div>
  </div>

  <div class='l-container'>
    ${this.scores.length ? html`
      ${this.categories.length ? html`
        ${this.categories.map(category => html`
          <div class='u-space-mb--large'>
            <h4 class='u-space-mb'>${category.label}</h4>
            ${this.renderScoresTable(category.value)}
          </div>
        `)}
      ` : html`
        ${this.renderScoresTable()}
      `}
    ` : html`
      <div class='brand-textbox'>
        <p>There are no submitted application evaluations.</p>
      </div>
    `}
  </div>
`;}

export function renderScoresTable(category) {
  const scores = category ? this.scores.filter(score => score?.category?.value === category) : [...this.scores];
  let applicants = {};
  for (const score of scores) {
    const applicantId = score.applicant?.id;
    if ( !applicantId ) continue;
    if ( !applicants[applicantId] ) {
      applicants[applicantId] = {
        data: [],
        scores: []
      };
    }
    applicants[applicantId].data.push(score);
  }

  for (const applicantId in applicants) {
    const applicant = applicants[applicantId];
    applicant.scores = this.rubricItems.map(item => {
      const entries = applicant.data.filter(score => score.rubricItem?.id === item.id);
      if ( !entries.length ) return 0;
      let score = entries.reduce((acc, entry) => acc + parseInt(entry.score.score), 0) / entries.length;
      return score;

    });

    if ( this.scoringCalculation === 'sum' ) {
      applicant.total = applicant.scores.reduce((acc, score) => acc + score, 0);
    } else if ( this.scoringCalculation === 'average' ) {
      let total = 0;
      let weight = 0;
      for (const [index, score] of applicant.scores.entries()) {
        const item = this.rubricItems[index];
        total += score * parseInt(item.weight);
        weight += parseInt(item.weight);
      }
      applicant.total = total / weight;
    }

    applicant.name = applicant.data[0].applicant?.name;
  }
  applicants = Object.values(applicants);
  applicants.sort((a, b) => b.total - a.total);

  return html`
    <div class="responsive-table" role="region">
      <table>
        <thead>
          <tr>
            <th rowspan='2' class='applicant' scope="col">Applicant</th>
            <th rowspan='2' class='total' scope="col">Total</th>
            <th colspan='${this.rubricItems.length}' class='rubric-items' scope="col">Rubric Items</th>
          </tr>
          <tr>
            ${this.rubricItems.map(item => html`
              <th class='rubric-item' scope="col">${item.title}</th>
            `)}
          </tr>
        </thead>
        <tbody>
          ${applicants.map(applicant => html`
            <tr>
              <th scope="row">${applicant.name}</th>
              <td>${applicant.total.toFixed(2)}</td>
              ${applicant.scores.map(score => html`
                <td>${score.toFixed(2)}</td>
              `)}
            </tr>
          `)}
        </tbody>
      </table>
    </div>
  `;
}
