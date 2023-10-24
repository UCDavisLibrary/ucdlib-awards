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

`;}
