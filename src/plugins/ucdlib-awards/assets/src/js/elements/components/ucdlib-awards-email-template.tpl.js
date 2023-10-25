import { html } from 'lit';

export function render() {
return html`
  <div ?hidden=${this.notAnAutomatedEmail}>
    <div class='field-container'>
      <ul class="list--reset checkbox">
        <li>
          <input id="input-${this.emailPrefix}Disable" type="checkbox" .checked=${this.disableNotification} @input=${this._onDisableToggle}>
          <label for="input-${this.emailPrefix}Disable">Disable Automatic Notification</label>
        </li>
      </ul>
    </div>
  </div>
  <fieldset>
    <legend>Email Content</legend>
    <div class="field-container" ?hidden=${!this.templateVariables.length}>
      <label>Dynamic Values</label>
      <select @change=${this._onVariableSelect}>
        <option value="">Select a value to insert</option>
        ${this.templateVariables.map(variable => html`
          <option value=${variable.key}>${variable.label}</option>
        `)}
      </select>
    </div>
    <div @focusin=${this._onTemplateFocus} @input=${this._onTemplateFocus}>
      <div class="field-container">
        <div class='flex-center flex-space-between flex-wrap'>
          <label class='u-space-mr'>Subject</label>
          <a
            ?hidden=${this.isDefaultSubjectTemplate}
            class='pointer u-space-mb--small'
            @click=${() => this._onTemplateRevert('subject')}
            >Revert to System Default</a>
        </div>
        <input
          type="text"
          .value=${this._subjectTemplate}
          email-template='subject'
          @click=${this._onTemplateFocus}
          @input=${e => this._onFormInput('_subjectTemplate', e.target.value)}>
      </div>
      <div class="field-container">
        <div class='flex-center flex-space-between flex-wrap'>
          <label class='u-space-mr'>Body</label>
          <a
            ?hidden=${this.isDefaultBodyTemplate}
            class='pointer u-space-mb--small'
            @click=${() => this._onTemplateRevert('body')}
            >Revert to System Default</a>
        </div>
        <textarea
          rows="10"
          .value=${this._bodyTemplate}
          email-template='body'
          @click=${this._onTemplateFocus}
          @input=${e => this._onFormInput('_bodyTemplate', e.target.value)}></textarea>
      </div>
    </div>
  </fieldset>

`;}
