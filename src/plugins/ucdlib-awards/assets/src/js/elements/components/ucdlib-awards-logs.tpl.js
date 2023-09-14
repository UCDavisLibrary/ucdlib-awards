import { html } from 'lit';

export function render() {
return html`
  <ucdlib-pages selected=${this.page}>
    <div id='logs-loading'>
      <div>
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
        Here are some logs
    </div>
  </ucdlib-pages>
`;}
