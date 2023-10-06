import { html } from 'lit';


export function render() {
return html`
  <ucdlib-awards-modal>
    <div>
      <div class="responsive-table" role="region" aria-label="Table of assignments" tabindex="0">
        <table>
          <thead>
            <tr>
              <th></th>
              ${this._judges.map(judge => html`
                <th>${judge.name}<sup>${judge.categorySuperscript}</sup></th>
              `)}
            </tr>
          </thead>
        </table>
      </div>
    </div>
  </ucdlib-awards-modal>

`;}
