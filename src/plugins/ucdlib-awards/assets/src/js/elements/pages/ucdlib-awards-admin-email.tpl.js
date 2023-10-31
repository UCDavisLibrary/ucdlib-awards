import { html } from 'lit';

export function render() {
return html`
  <h3 class='page-subtitle'>Cycle Email Settings</h3>
  <div ?hidden=${this.emailingEnabled} class='brand-textbox category-brand__background category-brand--redbud u-space-mb'>
    Emailing is currently disabled. To enable, set the 'UCDLIB_AWARDS_EMAILING_ENABLED' environment variable to 'true'.
  </div>
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
        ${ renderPageAdmin.call(this) }
        ${ renderPageJudge.call(this) }
        ${ renderPageApplicant.call(this)}
        ${ renderPageSupporter.call(this)}
      </ucdlib-pages>
    </div>
    <div class="l-second panel o-box">
      <ucd-theme-subnav @item-click=${this._onNavClick}>
        ${this.pages.map(page => html`
          ${page.hidden ? html`` : html`
          <a>${page.label}</a>
        `}
        `)}
      </ucd-theme-subnav>
    </div>
  </div>
`;}

function renderPageSupporter() {
  const pageSlug = 'supporter';
  const data = this.formSupporter || {};
  const emails = [
    this.makeEmailObject({label: 'Supporter Registered by Applicant', emailPrefix: 'emailSupporterRegistered', data}),
    this.makeEmailObject({label: 'Submission Reminder', emailPrefix: 'emailSupporterNudge', data, notAnAutomatedEmail: true}),
  ];
  return html`
  <div id='email-${pageSlug}'>
    <form @submit=${this._onFormSubmit}>
      <h4 class='u-space-mb'>Judge Notifications</h4>
      <ucd-theme-list-accordion>
        ${emails.map(email => html`
          <li>${email.label}</li>
          <li>
            <ucdlib-awards-email-template
              class='u-space-mt u-block'
              @email-update=${this._onEmailUpdate}
              .emailPrefix=${email.emailPrefix}
              .bodyTemplate=${email.body.value}
              .defaultBodyTemplate=${email.body.default}
              .defaultSubjectTemplate=${email.subject.default}
              .subjectTemplate=${email.subject.value}
              .disableNotification=${email.disable.value}
              .notAnAutomatedEmail=${email.notAnAutomatedEmail}
              .templateVariables=${email.body.templateVariables}>
            </ucdlib-awards-email-template>
          </li>
        `)}
      </ucd-theme-list-accordion>
      <button type='submit' class='btn btn btn--primary border-box u-space-mt'>Save</button>
    </form>
  </div>
`;
}

export function renderPageJudge() {
  const pageSlug = 'judge';
  const data = this.formJudge || {};
  const emails = [
    this.makeEmailObject({label: 'Application Assigned', emailPrefix: 'emailJudgeApplicantAssigned', data}),
    this.makeEmailObject({label: 'Evaluation Reminder', emailPrefix: 'emailJudgeEvaluationNudge', data, notAnAutomatedEmail: true}),
  ];
  return html`
    <div id='email-${pageSlug}'>
      <form @submit=${this._onFormSubmit}>
        <h4 class='u-space-mb'>Judge Notifications</h4>
        <ucd-theme-list-accordion>
          ${emails.map(email => html`
            <li>${email.label}</li>
            <li>
              <ucdlib-awards-email-template
                class='u-space-mt u-block'
                @email-update=${this._onEmailUpdate}
                .emailPrefix=${email.emailPrefix}
                .bodyTemplate=${email.body.value}
                .defaultBodyTemplate=${email.body.default}
                .defaultSubjectTemplate=${email.subject.default}
                .subjectTemplate=${email.subject.value}
                .disableNotification=${email.disable.value}
                .notAnAutomatedEmail=${email.notAnAutomatedEmail}
                .templateVariables=${email.body.templateVariables}>
              </ucdlib-awards-email-template>
            </li>
          `)}
        </ucd-theme-list-accordion>
        <button type='submit' class='btn btn btn--primary border-box u-space-mt'>Save</button>
      </form>
    </div>
  `;
}

export function renderPageApplicant() {
  const pageSlug = 'applicant';
  const data = this.formApplicant || {};
  const emails = [
    this.makeEmailObject({label: 'Applicant Submission Confirmation', emailPrefix: 'emailApplicantConfirmation', data}),
  ];
  return html`
    <div id='email-${pageSlug}'>
      <form @submit=${this._onFormSubmit}>
        <h4 class='u-space-mb'>Applicant Notifications</h4>
        <ucd-theme-list-accordion>
          ${emails.map(email => html`
            <li>${email.label}</li>
            <li>
              <ucdlib-awards-email-template
                class='u-space-mt u-block'
                @email-update=${this._onEmailUpdate}
                .emailPrefix=${email.emailPrefix}
                .bodyTemplate=${email.body.value}
                .defaultBodyTemplate=${email.body.default}
                .defaultSubjectTemplate=${email.subject.default}
                .subjectTemplate=${email.subject.value}
                .disableNotification=${email.disable.value}
                .templateVariables=${email.body.templateVariables}>
              </ucdlib-awards-email-template>
            </li>
          `)}
        </ucd-theme-list-accordion>
        <button type='submit' class='btn btn btn--primary border-box u-space-mt'>Save</button>
      </form>
    </div>
  `;
}

export function renderPageAdmin(){
  const pageSlug = 'admin';
  const data = this.formAdmin || {};
  const adminAddresses = (data.emailAdminAddresses || []).join('\n');
  const disableEmails = [
    { label: 'Application Submitted', prop: 'emailAdminApplicationSubmittedDisable', value: data.emailAdminApplicationSubmittedDisable },
    { label: 'Conflict of Interest', prop: 'emailAdminConflictOfInterestDisable', value: data.emailAdminConflictOfInterestDisable },
    { label: 'Evaluation Submitted', prop: 'emailAdminEvaluationSubmittedDisable', value: data.emailAdminEvaluationSubmittedDisable }
  ];
  if ( this.supportEnabled ) {
    disableEmails.push({ label: 'Letter of Support Submitted', prop: 'emailAdminSupportSubmittedDisable', value: data.emailAdminSupportSubmittedDisable });
  }

  const onAddressChange = (e) => {
    const addresses = e.target.value.split('\n').map(address => address.trim()).filter(address => address);
    this._onFormInput(pageSlug, 'emailAdminAddresses', addresses);
  }
  return html`
    <div id='email-${pageSlug}'>
      <form @submit=${this._onFormSubmit}>
        <h4 class='u-space-mb'>Admin Notifications</h4>
        <div class='field-container ${this.errorFields?.emailAdminAddresses ? 'error' : ''}'>
          <label>Admin Email Addresses</label>
          <textarea
            @input=${onAddressChange}
            placeholder='Enter one email address per line'
            rows='5'
            .value=${adminAddresses}></textarea>
        </div>
        <fieldset class="checkbox">
          <legend>Disable Email Notifications</legend>
          <ul class="list--reset">
            ${disableEmails.map(email => html`
              <li>
                <input id="input-${email.prop}" type="checkbox" .checked=${email.value} @input=${() => this._onFormInput(pageSlug, email.prop, !email.value)}>
                <label for="input-${email.prop}">${email.label}</label>
              </li>
            `)}
          </ul>
        </fieldset>
        <button type='submit' class='btn btn btn--primary border-box u-space-mt'>Save</button>
      </form>
    </div>
  `;
}

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
        <div class='field-container ${this.errorFields?.emailSenderAddress ? 'error' : ''}'>
          <label>Sender Email Address</label>
          <input type='email' value=${senderAddress} @input=${e => this._onFormInput(pageSlug, 'emailSenderAddress', e.target.value)} />
        </div>
        <div class='field-container ${this.errorFields?.emailSenderName ? 'error' : ''}'>
          <label>Sender Name</label>
          <input type='text' value=${senderName} @input=${e => this._onFormInput(pageSlug, 'emailSenderName', e.target.value)} />
        </div>
        <div class='field-container'>
          <ul class="list--reset checkbox">
            <li>
              <input id="input-emailDisableEmails" type="checkbox" .checked=${disableEmails} @input=${() => this._onFormInput(pageSlug, 'emailDisableEmails', !disableEmails)}>
              <label for="input-emailDisableEmails">Disable All System Emails</label>
            </li>
            <li>
              <input id="input-emailDisableAutomatedEmails" type="checkbox" .checked=${disableAutomatedEmails} @input=${() => this._onFormInput(pageSlug, 'emailDisableAutomatedEmails', !disableAutomatedEmails)}>
              <label for="input-emailDisableAutomatedEmails">Disable All Automated Emails</label>
            </li>
          </ul>
        </div>
        <button type='submit' class='btn btn btn--primary border-box u-space-mt'>Save</button>
      </form>
    </div>
  `;
}
