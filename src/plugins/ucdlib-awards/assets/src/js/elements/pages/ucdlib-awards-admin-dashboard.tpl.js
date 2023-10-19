import { html } from 'lit';
import datetimeUtils from "../../utils/datetime.js"


export function render() {
  if ( !this.hasRequestedCycle ) return html``;
  return html`
    <div class="l-2col l-2col--67-33">
      <div class="l-first panel o-box">
        ${this.renderLogsPanel()}
      </div>
      <div class="l-second panel o-box">
        ${this.renderCycleDatesPanel()}
        ${this.renderRubricPanel()}
        ${this.renderApplicationPanel()}
      </div>
    </div>
  `;}

export function renderCycleDatesPanel(){
  const cycle = this.requestedCycle;
  const hasSupport = parseInt(cycle.has_support);
  let supportStart = 'NA';
  let supportEnd = 'NA';
  if ( hasSupport ) {
    supportStart = datetimeUtils.mysqlToDateString(cycle.support_start);
    supportEnd = datetimeUtils.mysqlToDateString(cycle.support_end);
  }
  return html`
    <div class="panel panel--icon panel--icon-custom o-box category-brand--gunrock">
      <h2 class="panel__title">
        <ucdlib-icon icon="ucd-public:fa-calendar-week" class="panel__custom-icon"></ucdlib-icon>
        <span>Cycle Dates</span>
      </h2>
      <section>
        <div class='u-space-mb--small'>
          <label>Application Submission</label>
          <div class='flex-center'>
            <div class='dates-label'>Start: </div>${datetimeUtils.mysqlToDateString(cycle.application_start)}
          </div>
          <div class='flex-center'>
            <div class='dates-label'>End: </div>${datetimeUtils.mysqlToDateString(cycle.application_end)}
          </div>
        </div>
        <div class='u-space-mb--small'>
          <label>Letters of Support</label>
          <div class='flex-center'><div class='dates-label'>Start: </div>${supportStart}</div>
          <div class='flex-center'><div class='dates-label'>End: </div>${supportEnd}</div>
        </div>
        <div class='u-space-mb--small'>
          <label>Evaluation Period</label>
          <div class='flex-center'><div class='dates-label'>Start: </div>${datetimeUtils.mysqlToDateString(cycle.evaluation_start)}</div>
          <div class='flex-center'><div class='dates-label'>End: </div>${datetimeUtils.mysqlToDateString(cycle.evaluation_end)}</div>
        </div>
        <a class="icon-ucdlib" href=${this.cyclesLink}>
          <ucdlib-icon class="" icon="ucd-public:fa-circle-chevron-right"></ucdlib-icon>
          <span>View Cycle</span>
        </a>
      </section>
    </div>
  `;
}

export function renderApplicationPanel(){
  if ( !this.applicationSummary || !this.applicationSummary.length ) return html``;
  const hasCategories = this.applicationSummary.length > 1;

  const renderCategory = (category) => {
    const title = hasCategories ? category?.category?.label || 'Total' : '';
    return html`
      <div class='u-space-mb'>
        <label ?hidden=${!title}>${title}</label>
        <div>
          <div class='status-row primary bold'>
            <div>Status</div>
            <div>Count</div>
          </div>
          <div>
            ${(category?.statusCtRows || []).map(status => html`
              <div class='status-row'>
                <div>${status.label}</div>
                <div>${status.ct}</div>
              </div>
            `)}
          </div>
        </div>
      </div>
    `;
  }
  return html`
    <div class="panel panel--icon panel--icon-custom o-box category-brand--pinot">
      <h2 class="panel__title">
        <ucdlib-icon icon="ucd-public:fa-square-pen" class="panel__custom-icon"></ucdlib-icon>
        <span>Applications</span>
      </h2>
      <section>
        ${this.applicationSummary.map(category => renderCategory(category))}
      </section>
    </div>
  `;
}

export function renderRubricPanel(){
  const actionText = this.hasRubric ? 'Edit Rubric' : 'Create a Rubric';
  return html`
    <div class="panel panel--icon panel--icon-custom o-box category-brand--redwood">
      <h2 class="panel__title">
        <ucdlib-icon icon="ucd-public:fa-list-check" class="panel__custom-icon"></ucdlib-icon>
        <span>Evaluation Rubric</span>
      </h2>
      <section>
        ${this.hasRubric ? html`
          <ul class='list--arrow'>
            ${this.rubricItemTitles.map(title => html`<li>${title}</li>`)}
          </ul>
        ` : html`
          <p>No rubric has been created for this cycle.</p>
        `}
        <a class="icon-ucdlib" href=${this.rubricLink}>
          <ucdlib-icon class="" icon="ucd-public:fa-circle-chevron-right"></ucdlib-icon>
          <span>${actionText}</span>
        </a>
      </section>
    </div>
  `;
}

export function renderLogsPanel(){
  if (
    !this.logsPropsJson ||
    !Object.keys(this.logsProps).length) {
      return html``;
    }
  return html`
    <div class="panel panel--icon panel--icon-custom o-box category-brand--rose">
      <h2 class="panel__title">
        <ucdlib-icon icon="ucd-public:fa-timeline" class="panel__custom-icon"></ucdlib-icon>
        <span>Recent Activity</span>
      </h2>
      <section>
        <ucdlib-awards-logs>
          <script type="application/json">${this.logsPropsJson}</script>
        </ucdlib-awards-logs>
        <a class="icon-ucdlib" href=${this.logsLink}>
          <ucdlib-icon class="" icon="ucd-public:fa-circle-chevron-right"></ucdlib-icon>
          <span>View All</span>
        </a>
      </section>
    </div>
  `;
}
