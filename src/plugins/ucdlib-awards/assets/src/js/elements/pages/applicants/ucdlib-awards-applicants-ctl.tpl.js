import { html } from 'lit';


export function render() {
return html`
  <h3 class="page-subtitle">Applicants</h3>
  <div class="l-2col l-2col--67-33">
    <div class="l-second panel o-box">
      <ucdlib-awards-applicants-actions></ucdlib-awards-applicants-actions>
    </div>
    <div class="l-first panel o-box">
      <ucdlib-awards-applicants-display></ucdlib-awards-applicants-display>
    </div>
  </div>
`;}