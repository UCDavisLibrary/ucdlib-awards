import { html } from 'lit';
import datetimeUtils from "../../utils/datetime.js"

export function render() {
return html`
  <h3 class='page-subtitle'>Application Cycles</h3>
  <div class="l-2col l-2col--67-33">
    <div class="l-second panel o-box">
      <a
        @click=${this._onEditFormClick}
        ?hidden=${!this.hasRequestedCycle}
        class="focal-link category-brand--putah-creek pointer u-space-mb ${this.page == 'edit' ? 'pressed' : ''}">
        <div class="focal-link__figure focal-link__icon">
          <ucdlib-icon icon="ucd-public:fa-pen"></ucdlib-icon>
        </div>
        <div class="focal-link__body"><strong>Edit Cycle</strong></div>
      </a>
      <a
        class="focal-link category-brand--sage pointer u-space-mb ${this.page == 'add' ? 'pressed' : ''}"
        @click=${this._onAddFormClick}
        >
        <div class="focal-link__figure focal-link__icon">
          <ucdlib-icon icon="ucd-public:fa-plus"></ucdlib-icon>
        </div>
        <div class="focal-link__body"><strong>Add a New Cycle</strong></div>
      </a>
      <a
        class="focal-link category-brand--double-decker pointer u-space-mb ${this.page == 'delete' ? 'pressed' : ''}"
        ?hidden=${!this.hasRequestedCycle}
        @click=${this._onDeleteFormClick}
        >
        <div class="focal-link__figure focal-link__icon">
          <ucdlib-icon icon="ucd-public:fa-trash"></ucdlib-icon>
        </div>
        <div class="focal-link__body"><strong>Delete Cycle</strong></div>
      </a>
    </div>
    <div class="l-first panel o-box">
      <div ?hidden=${this.page != 'edit'}>${this.renderEditForm()}</div>
      <div ?hidden=${this.page != 'view'}>${this.renderOverview()}</div>
      <div ?hidden=${this.page != 'add'}>${this.renderEditForm()}</div>
      <div ?hidden=${this.page != 'delete'}>${this.renderDeleteForm()}</div>
    </div>
  </div>

`;}

// form for adding/editing a cycle
export function renderEditForm() {
  const isNew = this.page === 'add';

  let disableAppFormSelect = false;
  if ( !this.siteForms.length ) disableAppFormSelect = true;
  if ( this.requestedCycle?.applicantCount ) disableAppFormSelect = true;

  let disableSupportFormSelect = false;
  if ( !this.siteForms.length ) disableSupportFormSelect = true;

  let showActiveCycleNotification = false;
  if (
    this.activeCycle &&
    this.editFormData?.is_active &&
    this.activeCycle.cycle_id != this.editFormData.cycle_id ) {
    showActiveCycleNotification = true;
  }

  let supporterFields = this.editFormData?.cycle_meta?.supporterFields || [];
  supporterFields = supporterFields.length ? supporterFields : [{firstName: '', lastName: '', email: ''}];
  let showSupporterFields = this.editFormData?.has_support && this.editFormData?.application_form_id;
  const supportFormLink = this.editFormData?.cycle_meta?.supportFormLink || '';

  return html`
    <form @submit=${this._onEditFormSubmit}>
      ${this.renderFormErrorMessages()}
      <div>
        <div class="field-container ${this.formErrors?.title ? 'error' : ''}">
          <label>Cycle Title <abbr title="Required">*</abbr></label>
          <input
            type="text"
            placeholder="e.g. Fall 2023"
            maxlength="200"
            @input=${e => this._onEditFormInput('title', e.target.value)}
            .value=${this.editFormData?.title || ''}>
        </div>
        <div class='field-container checkbox'>
          <ul class="list--reset">
            <li>
              <input
                id="cycle-input-active"
                type="checkbox"
                @input=${() => this._onEditFormInput('is_active', !this.editFormData?.is_active ? 1 : 0)}
                .checked=${this.editFormData?.is_active}>
              <label for="cycle-input-active">Active Cycle</label>
            </li>
          </ul>
          ${this.renderBasicNotification(html`<span>Only one cycle may be active at a time. "${this.activeCycle.title}" will no longer be active.</span>`, !showActiveCycleNotification)}
        </div>
      </div>
      <fieldset>
        <legend>Application Period</legend>
        <div class="l-2col">
          <div class="l-first field-container ${this.formErrors.application_start ? 'error' : ''}">
            <label>Start Date <abbr title="Required">*</abbr></label>
            <input
              type="date"
              @input=${e => this._onEditFormInput('application_start', e.target.value)}
              .value=${this.editFormData?.application_start || ''}>
          </div>
          <div class="l-second field-container ${this.formErrors.application_end ? 'error' : ''}">
            <label>End Date <abbr title="Required">*</abbr></label>
            <input
              type="date"
              @input=${e => this._onEditFormInput('application_end', e.target.value)}
              .value=${this.editFormData?.application_end || ''}>
          </div>
        </div>
        <div class="field-container ${this.formErrors.application_form_id ? 'error' : ''}">
          <label>Application Form</label>
          <select
            ?disabled=${disableAppFormSelect}
            @input=${e => this._onEditFormInput('application_form_id', e.target.value)}
            .value=${this.editFormData?.application_form_id || ''}>
            <option value="" >Select a form</option>
            ${this.siteForms.map(form => html`
              <option value=${form.id} ?selected=${this.editFormData?.application_form_id == form.id}>${form.title}</option>
            `)}
          </select>
          ${this.renderBasicNotification(html`<span>No forms have been created yet! <a href=${this.formsLink}>Make one with the form builder.</a></span>`, this.siteForms.length)}
          ${this.renderBasicNotification(html`<span>There is at least 1 applicant - cannot change form!</span>`, !this.editFormData?.applicantCount)}
        </div>
        <div class='field-container checkbox'>
          <ul class="list--reset">
            <li>
              <input
                id="cycle-input-categories"
                type="checkbox"
                @input=${() => this._onEditFormInput('has_categories', !this.editFormData?.has_categories ? 1 : 0)}
                .checked=${this.editFormData?.has_categories}>
              <label for="cycle-input-categories">Enable Application Categories</label>
            </li>
          </ul>
        </div>
        <div ?hidden=${!this.editFormData?.has_categories}>
          <div class="field-container ${this.formErrors.category_form_slug ? 'error' : ''}">
            <label>Category Options</label>
            <select
              @input=${e => this._onEditFormInput('category_form_slug', e.target.value)}
              .value=${this.editFormData?.category_form_slug || ''}>
              <option value="" >Select a field from the application form</option>
              ${this.applicationFormOptionFields.map(field => html`
                <option value=${field.id} ?selected=${this.editFormData?.category_form_slug == field.id}>${field.label}</option>
              `)}
            </select>
          </div>
        </div>
      </fieldset>
      <fieldset>
        <legend>Evaluation Period</legend>
        <div class="l-2col">
          <div class="l-first field-container ${this.formErrors.evaluation_start ? 'error' : ''}">
            <label>Start Date <abbr title="Required">*</abbr></label>
            <input
              type="date"
              @input=${e => this._onEditFormInput('evaluation_start', e.target.value)}
              .value=${this.editFormData?.evaluation_start || ''}>
          </div>
          <div class="l-second field-container ${this.formErrors.evaluation_end ? 'error' : ''}">
            <label>End Date <abbr title="Required">*</abbr></label>
            <input
              type="date"
              @input=${e => this._onEditFormInput('evaluation_end', e.target.value)}
              .value=${this.editFormData?.evaluation_end || ''}>
          </div>
        </div>
      </fieldset>
      <fieldset>
        <legend>Letters of Support</legend>
        <div class='field-container checkbox'>
          <ul class="list--reset">
            <li>
              <input
                id="cycle-input-support"
                type="checkbox"
                @input=${() => this._onEditFormInput('has_support', !this.editFormData?.has_support ? 1 : 0)}
                .checked=${this.editFormData?.has_support}>
              <label for="cycle-input-support">Enable Letters of Support Functionality</label>
            </li>
          </ul>
        </div>
        <div ?hidden=${!this.editFormData?.has_support}>
          <div class="l-2col">
            <div class="l-first field-container ${this.formErrors.support_start ? 'error' : ''}">
              <label>Start Date <abbr title="Required">*</abbr></label>
              <input
                type="date"
                @input=${e => this._onEditFormInput('support_start', e.target.value)}
                .value=${this.editFormData?.support_start || ''}>
            </div>
            <div class="l-second field-container ${this.formErrors.support_end ? 'error' : ''}">
              <label>End Date <abbr title="Required">*</abbr></label>
              <input
                type="date"
                @input=${e => this._onEditFormInput('support_end', e.target.value)}
                .value=${this.editFormData?.support_end || ''}>
            </div>
          </div>
          <div class="field-container ${this.formErrors.support_form_id ? 'error' : ''}">
            <label>Support Form</label>
            <select
              ?disabled=${disableSupportFormSelect}
              @input=${e => this._onEditFormInput('support_form_id', e.target.value)}
              .value=${this.editFormData?.support_form_id || ''}>
              <option value="" >Select a form</option>
              ${this.siteForms.map(form => html`
                <option value=${form.id} ?selected=${this.editFormData?.support_form_id == form.id}>${form.title}</option>
              `)}
            </select>
            ${this.renderBasicNotification(html`<span>No forms have been created yet! <a href=${this.formsLink}>Make one with the form builder.</a></span>`, this.siteForms.length)}
          </div>
          <div class='field-container'>
            <label>Support Form Link</label>
            <div class='hint-text'>
              The url that will be shared with supporters to submit their letters of support.
            </div>
            <input
             type="text"
              @input=${e => this._onSupportFormLinkInput(e.target.value)}
              .value=${supportFormLink}>
          </div>
          <div class="field-container ${this.formErrors.supporterFields ? 'error' : ''}" ?hidden=${!showSupporterFields}>
            <label>Supporter Identifier Fields</label>
            <div class='hint-text'>
              Select the fields in the application form that the applicant will use to identify their supporters.
            </div>
            <div>
              ${supporterFields.map((field, index) => html`
                <div class='l-3col o-box'>
                  <div class="l-first field-container">
                    <label>First Name</label>
                    <select
                      @input=${e => this._onSupporterInput('firstName', e.target.value, index)}
                      .value=${field.firstName || ''}>
                      <option value="" >Select a field</option>
                      ${this.applicationTextFields.map(appField => html`
                        <option value=${appField.id} ?selected=${appField.id == field.firstName}>${appField.label}</option>
                      `)}
                    </select>
                  </div>
                  <div class="l-second field-container">
                    <label>Last Name</label>
                    <select
                      @input=${e => this._onSupporterInput('lastName', e.target.value, index)}
                      .value=${field.lastName || ''}>
                      <option value="" >Select a field</option>
                      ${this.applicationTextFields.map(appField => html`
                        <option value=${appField.id} ?selected=${appField.id == field.lastName}>${appField.label}</option>
                      `)}
                    </select>
                  </div>
                  <div class="l-third field-container">
                    <label>Email</label>
                    <select
                      @input=${e => this._onSupporterInput('email', e.target.value, index)}
                      .value=${field.email || ''}>
                      <option value="" >Select a field</option>
                      ${this.applicationEmailFields.map(appField => html`
                        <option value=${appField.id} ?selected=${appField.id == field.email}>${appField.label}</option>
                      `)}
                    </select>
                  </div>
                </div>
              `)}
            </div>
            <div class='button-row'>
              <button type="button" class="btn marketing-highlight__cta border-box category-brand--farmers-market" @click=${this._onSupporterAdd}>Add Supporter</button>
              <button type="button" class="btn marketing-highlight__cta border-box category-brand--double-decker" @click=${this._onSupporterRemove}>Remove Last Supporter</button>
            </div>
          </div>
        </div>

      </fieldset>
      <div class="button-row">
        <button type="submit" class="btn--primary border-box">${isNew ? 'Create' : 'Update'}</button>
        <button
          ?hidden=${!this.hasActiveCycle}
          type="button" @click=${this._onEditFormCancel}
          class="btn border-box">Cancel</button>
      </div>
    </form>
  `;
}

export function renderBasicNotification(content, hidden){
  if ( hidden ) return html``;
  if ( !content ) return html``;
  return html`
    <div  class="basic-notification">
      <ucdlib-icon class='double-decker u-space-mr' icon="ucd-public:fa-circle-exclamation"></ucdlib-icon>
      <div class='notification-text'>${content}</div>
    </div>
  `;

}

export function renderOverview(){
  if ( !this.hasRequestedCycle ) return html``;
  const cycle = this.requestedCycle;
  const hasSupport = parseInt(cycle.has_support);
  let supportStart = 'NA';
  let supportEnd = 'NA';
  if ( hasSupport ) {
    supportStart = datetimeUtils.mysqlToDateString(cycle.support_start);
    supportEnd = datetimeUtils.mysqlToDateString(cycle.support_end);
  }

  const applicationForm = this.siteForms.find(form => form.id == cycle.application_form_id);
  const supportForm = this.siteForms.find(form => form.id == cycle.support_form_id);

  return html`
    <div class='u-space-mb'>
      <h4 class='u-space-mb'>Dates</h4>
      <div>
        <div class='dates-row dates-column-labels'>
          <div><label>Window</label></div>
          <div><label>Start</label></div>
          <div><label>End</label></div>
        </div>
        <div class='dates-row'>
          <div>Application Submission</div>
          <div><div class='dates-label'>Start: </div>${datetimeUtils.mysqlToDateString(cycle.application_start)}</div>
          <div><div class='dates-label'>End: </div>${datetimeUtils.mysqlToDateString(cycle.application_end)}</div>
        </div>
        <div class='dates-row'>
          <div>Letters of Support</div>
          <div><div class='dates-label'>Start: </div>${supportStart}</div>
          <div><div class='dates-label'>End: </div>${supportEnd}</div>
        </div>
        <div class='dates-row'>
          <div>Evaluation Period</div>
          <div><div class='dates-label'>Start: </div>${datetimeUtils.mysqlToDateString(cycle.evaluation_start)}</div>
          <div><div class='dates-label'>End: </div>${datetimeUtils.mysqlToDateString(cycle.evaluation_end)}</div>
        </div>
      </div>
    </div>
    <div>
      <h4 class='u-space-mb'>Forms</h4>
      <div class='u-space-mb'>
        <label>Application Form</label>
        <div class='form-row'>
          <div>${applicationForm.title}</div>
          <div class='u-space-ml--small'>
            <a href=${this.formsLink + '-wizard&id=' + applicationForm.id} target='_blank'><ucdlib-icon icon='ucd-public:fa-pen-to-square'></ucdlib-icon></a>
          </div>
        </div>
      </div>
      <div class='u-space-mb'>
        <label>Letters of Support Form</label>
        ${hasSupport ? html`
          <div class='form-row'>
            <div>${supportForm.title}</div>
            <div class='u-space-ml--small'>
              <a href=${this.formsLink + '-wizard&id=' + supportForm.id} target='_blank'><ucdlib-icon icon='ucd-public:fa-pen-to-square'></ucdlib-icon></a>
            </div>
          </div>
        ` : html`
          <div>Not Enabled</div>
        `}
      </div>
    </div>

  `;
}

export function renderDeleteForm(){
  return html`
  <form @submit=${this._onDeleteFormSubmit}>
    ${this.renderFormErrorMessages()}
    <div class='delete-confirm'>
      <div class="panel panel--icon panel--icon-custom o-box category-brand--double-decker u-space-mb--flush">
        <h2 class="panel__title">
          <ucdlib-icon icon="ucd-public:fa-circle-exclamation" class="panel__custom-icon"></ucdlib-icon>
          <span style='color:#022851;'>Confirm Deletion</span>
        </h2>
      </div>
      <p>Are you sure you want to delete this cycle and its associated data?
        In the box below, type the cycle title:</p>
      <div style='font-weight:700;'>${this.deleteFormData.title}</div>
      <div class="field-container ${this.formErrors.title_confirm ? 'error' : ''}">
        <input
            type="text"
            @input=${e => this._onDeleteFormInput('title_confirm', e.target.value)}
            .value=${this.deleteFormData?.title_confirm || ''}>
      </div>
      </div>
    </div>
    <div class="button-row">
      <button type="submit" class="btn--primary">Delete</button>
      <button
        type="button" @click=${this._onEditFormCancel}
        class="btn">Cancel</button>
    </div>

  </form>`;
}

export function renderFormErrorMessages(){
  return html`
    <div
      ?hidden=${!this.formErrorMessages.length}
      class="brand-textbox category-brand__background category-brand--double-decker u-space-mb">
      <ul class='u-space-mt--flush list--flush'>
        ${this.formErrorMessages.map(msg => html`<li>${msg}</li>`)}
      </ul>
    </div>
  `
}
