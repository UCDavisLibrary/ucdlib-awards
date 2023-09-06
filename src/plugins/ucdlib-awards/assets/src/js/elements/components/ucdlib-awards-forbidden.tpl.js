import { html } from 'lit';

export function render() {
return html`
  <div>
    <ucdlib-icon class='double-decker u-space-mr' icon="ucd-public:fa-circle-exclamation"></ucdlib-icon>
    <div class='forbidden-text'>You are not authorized to view this resource. Contact the site administrator for access.</div>
  </div>
`;}
