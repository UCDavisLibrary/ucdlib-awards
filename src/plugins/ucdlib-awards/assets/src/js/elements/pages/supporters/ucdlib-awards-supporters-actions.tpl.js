import { html } from 'lit';

export function render() {
return html`
  ${ renderActionPanel.call(this) }
`;}

function renderActionPanel(){
  return html`
    <div class="panel panel--icon panel--icon-custom o-box category-brand--redwood">
      <h2 class="panel__title">
        <ucdlib-icon icon="ucd-public:fa-wrench" class="panel__custom-icon"></ucdlib-icon>
        <span>Actions</span>
      </h2>
      <section>
        <form @submit=${this._onActionSubmit}>
          <div ?hidden=${this.selectedSupporters.length} class='u-space-mb hint-text'>
            Select at least one supporter to perform an action
          </div>
          <div class="field-container">
            <select
              @change=${(e) => this.selectedAction = e.target.value}
              .value=${this.selectedAction}
            >
              ${this._actions.map(action => html`
                <option
                  value=${action.slug}
                  ?selected=${action.slug === this.selectedAction}
                  ?disabled=${action.disabled}
                >${action.label}
                </option>
              `)}
            </select>
          </div>
          <button ?disabled=${this.disableActionSubmit || this.doingAction} type="submit" class="btn marketing-highlight__cta border-box category-brand--redwood width-100">Apply</button>
        </form>
      </section>
    </div>
  `;
}
