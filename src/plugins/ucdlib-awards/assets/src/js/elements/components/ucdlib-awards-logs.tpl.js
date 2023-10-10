import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

export function render() {
return html`
  <ucdlib-pages selected=${this.page}>
    <div id='logs-loading'>
      <div class='loading-icon'>
        <ucdlib-icon icon="ucd-public:fa-circle-notch"></ucdlib-icon>
      </div>
    </div>
    <div id='logs-error'>
      <div class="brand-textbox category-brand__background category-brand--double-decker u-space-mb">
        <p>Something went wrong when getting the requested logs:</p>
        <ul class='u-space-mt--flush list--flush'>
          ${this.errorMessages.map(msg => html`<li>${msg}</li>`)}
        </ul>
      </div>
    </div>
    <div id='logs-success'>
        ${this.logs.length ? html`
          <div>
            ${this.logs.map(log => html`
              <div class='log'>
                <div
                  title="Log Type: ${log.log_type_label}"
                  class='icon-container category-brand__background category-brand--${log.iconColor}'>
                  <ucdlib-icon icon="${log.icon}"></ucdlib-icon>
                </div>
                <div class='log-content'>
                  <div class='log-text'>${unsafeHTML(log.displayText)}</div>
                  <div class='log-date'>${log.displayDate}</div>
                </div>
              </div>
            `)}
          </div>
          <ucd-theme-pagination
            class='u-space-mt--large'
            current-page=${this.logPage}
            max-pages=${this.totalPages}
            ellipses
            xs-screen
            @page-change=${e => this._onPageChange(e)}
            >
          </ucd-theme-pagination>
        ` : html`
          <div class="brand-textbox category-brand__background category-brand--admin-blue u-space-mb">
            <p>No logs found!</p>
          </div>
        `}
    </div>
  </ucdlib-pages>
`;}
