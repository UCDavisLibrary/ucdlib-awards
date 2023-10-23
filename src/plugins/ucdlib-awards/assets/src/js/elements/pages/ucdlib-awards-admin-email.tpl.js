import { html } from 'lit';

export function render() {
return html`
  <h3 class='page-subtitle'>Cycle Email Settings</h3>
  <div class="l-2col l-2col--67-33">
    <div class="l-first panel o-box">
      <div class="brand-textbox category-brand__background category-brand--double-decker u-space-mb" ?hidden=${!this.errorMessages.length}>
        Error Updating Settings:
        <ul class='u-space-mt--flush'>
          ${this.errorMessages.map(message => html`
            <li>${message}</li>
          `)}
        </ul>
      </div>
      <ucdlib-pages selected=${'email-' + this.page}>
        ${ renderPageGeneral.call(this) }
        <div id='email-admin'>
          <h4>Admin Notifications</h4>
        </div>
        <div id='email-judge'>
          <h4>Judge Notifications</h4>
        </div>
        <div id='email-applicant'>
          <h4>Applicant Notifications</h4>
        </div>
      </ucdlib-pages>
    </div>
    <div class="l-second panel o-box">
      <ucd-theme-subnav @item-click=${this._onNavClick}>
        ${this.pages.map(page => html`
          <a>${page.label}</a>
        `)}
      </ucd-theme-subnav>
    </div>
  </div>
`;}

export function renderPageGeneral() {
  const pageSlug = 'general';
  const data = this.formGeneral || {};
  const senderAddress = data.emailSenderAddress || '';
  const senderName = data.emailSenderName || '';
  const disableEmails = data.emailDisableEmails || false;
  const disableAutomatedEmails = data.emailDisableAutomatedEmails || false;

  return html`
    <div id='email-${pageSlug}'>
      <form @submit=${this._onFormSubmit}>
        <h4 class='u-space-mb'>General Settings</h4>
        <div class='field-container'>
          <label>Sender Email Address</label>
          <input type='email' value=${senderAddress} @input=${e => this._onFormInput(pageSlug, 'emailSenderAddress', e.target.value)} />
        </div>
        <div class='field-container'>
          <label>Sender Name</label>
          <input type='text' value=${senderName} @input=${e => this._onFormInput(pageSlug, 'emailSenderName', e.target.value)} />
        </div>
        <div class='field-container'>
          <ul class="list--reset checkbox">
            <li>
              <input id="input-emailDisableEmails" name="checkbox" type="checkbox" .checked=${disableEmails} @input=${() => this._onFormInput(pageSlug, 'emailDisableEmails', !disableEmails)}>
              <label for="input-emailDisableEmails">Disable All System Emails</label>
            </li>
            <li>
              <input id="input-emailDisableAutomatedEmails" name="checkbox" type="checkbox" .checked=${disableAutomatedEmails} @input=${() => this._onFormInput(pageSlug, 'emailDisableAutomatedEmails', !disableAutomatedEmails)}>
              <label for="input-emailDisableAutomatedEmails">Disable All Automated Emails</label>
            </li>
          </ul>
        </div>
        <button type='submit' class='btn btn btn--primary border-box'>Save</button>
      </form>
    </div>
  `;
}
