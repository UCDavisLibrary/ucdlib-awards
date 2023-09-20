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
        <div class="brand-textbox category-brand--pinot category-brand__background u-space-mb">Applications</div>
        <div class="brand-textbox category-brand--cabernet category-brand__background u-space-mb">Evaluation</div>
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
