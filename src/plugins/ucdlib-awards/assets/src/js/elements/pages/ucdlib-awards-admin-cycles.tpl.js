import { html } from 'lit';

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
        <div class="focal-link__body"><strong>Add a Cycle</strong></div>
      </a>
      <a
        class="focal-link category-brand--double-decker pointer u-space-mb ${this.page == 'delete' ? 'pressed' : ''}"
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

  let disableSupportFormSelect = false;
  if ( !this.siteForms.length ) disableSupportFormSelect = true;

  let showActiveCycleNotification = false;
  if (
    this.activeCycle &&
    this.editFormData?.is_active &&
    this.activeCycle.cycle_id != this.editFormData.cycle_id ) {
    showActiveCycleNotification = true;
  }

  return html`
    <form @submit=${this._onEditFormSubmit}>
      <div
        ?hidden=${!this.editFormErrorMessages.length}
        class="brand-textbox category-brand__background category-brand--double-decker u-space-mb">
        <ul class='u-space-mt--flush list--flush'>
          ${this.editFormErrorMessages.map(msg => html`<li>${msg}</li>`)}
        </ul>
      </div>
      <div>
        <div class="field-container ${this.editFormErrors?.title ? 'error' : ''}">
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
          <div class="basic-notification" ?hidden=${!showActiveCycleNotification}>
            <ucdlib-icon class='double-decker u-space-mr' icon="ucd-public:fa-circle-exclamation"></ucdlib-icon>
            <div class='notification-text'>
              Only one cycle may be active at a time. "${this.activeCycle.title}" will no longer be active. </a>
            </div>
          </div>
        </div>
      </div>
      <fieldset>
        <legend>Application Period</legend>
        <div class="l-2col">
          <div class="l-first field-container ${this.editFormErrors.application_start ? 'error' : ''}">
            <label>Start Date <abbr title="Required">*</abbr></label>
            <input
              type="date"
              @input=${e => this._onEditFormInput('application_start', e.target.value)}
              .value=${this.editFormData?.application_start || ''}>
          </div>
          <div class="l-second field-container ${this.editFormErrors.application_end ? 'error' : ''}">
            <label>End Date <abbr title="Required">*</abbr></label>
            <input
              type="date"
              @input=${e => this._onEditFormInput('application_end', e.target.value)}
              .value=${this.editFormData?.application_end || ''}>
          </div>
        </div>
        <div class="field-container ${this.editFormErrors.application_form_id ? 'error' : ''}">
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
          <div ?hidden=${this.siteForms.length} class="basic-notification">
            <ucdlib-icon class='double-decker u-space-mr' icon="ucd-public:fa-circle-exclamation"></ucdlib-icon>
            <div class='notification-text'>
              No forms have been created yet! <a href=${this.formsLink}>Make one with the form builder.</a>
            </div>
          </div>
        </div>
      </fieldset>
      <fieldset>
        <legend>Evaluation Period</legend>
        <div class="l-2col">
          <div class="l-first field-container ${this.editFormErrors.evaluation_start ? 'error' : ''}">
            <label>Start Date <abbr title="Required">*</abbr></label>
            <input
              type="date"
              @input=${e => this._onEditFormInput('evaluation_start', e.target.value)}
              .value=${this.editFormData?.evaluation_start || ''}>
          </div>
          <div class="l-second field-container ${this.editFormErrors.evaluation_end ? 'error' : ''}">
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
            <div class="l-first field-container ${this.editFormErrors.support_start ? 'error' : ''}">
              <label>Start Date <abbr title="Required">*</abbr></label>
              <input
                type="date"
                @input=${e => this._onEditFormInput('support_start', e.target.value)}
                .value=${this.editFormData?.support_start || ''}>
            </div>
            <div class="l-second field-container ${this.editFormErrors.support_end ? 'error' : ''}">
              <label>End Date <abbr title="Required">*</abbr></label>
              <input
                type="date"
                @input=${e => this._onEditFormInput('support_end', e.target.value)}
                .value=${this.editFormData?.support_end || ''}>
            </div>
          </div>
          <div class="field-container ${this.editFormErrors.support_form_id ? 'error' : ''}">
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
            <div ?hidden=${this.siteForms.length} class="basic-notification">
              <ucdlib-icon class='double-decker u-space-mr' icon="ucd-public:fa-circle-exclamation"></ucdlib-icon>
              <div class='notification-text'>
                No forms have been created yet! <a href=${this.formsLink}>Make one with the form builder.</a>
              </div>
            </div>
          </div>
        </div>

      </fieldset>
      <div class="button-row">
        <button type="submit" class="btn--primary">${isNew ? 'Create' : 'Edit'}</button>
        <button
          ?hidden=${!this.hasActiveCycle}
          type="button" @click=${this._onEditFormCancel}
          class="btn">Cancel</button>
      </div>
    </form>
  `;
}

export function renderOverview(){
  if ( !this.hasRequestedCycle ) return html``;
  const cycle = this.requestedCycle;
  const hasSupport = parseInt(cycle.has_support);
  let supportStart = 'NA';
  let supportEnd = 'NA';
  if ( hasSupport ) {
    supportStart = this._fmtDate(cycle.support_start);
    supportEnd = this._fmtDate(cycle.support_end);
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
          <div><div class='dates-label'>Start: </div>${this._fmtDate(cycle.application_start)}</div>
          <div><div class='dates-label'>End: </div>${this._fmtDate(cycle.application_end)}</div>
        </div>
        <div class='dates-row'>
          <div>Letters of Support</div>
          <div><div class='dates-label'>Start: </div>${supportStart}</div>
          <div><div class='dates-label'>End: </div>${supportEnd}</div>
        </div>
        <div class='dates-row'>
          <div>Evaluation Period</div>
          <div><div class='dates-label'>Start: </div>${this._fmtDate(cycle.evaluation_start)}</div>
          <div><div class='dates-label'>End: </div>${this._fmtDate(cycle.evaluation_end)}</div>
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
  return html`<p>delete</p>`;
}
