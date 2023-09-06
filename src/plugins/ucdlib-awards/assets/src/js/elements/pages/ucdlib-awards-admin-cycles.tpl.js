import { html } from 'lit';

export function render() {
return html`
  <h3 class='page-subtitle'>Application Cycles</h3>
  <div class="l-2col l-2col--67-33">
    <div class="l-first panel o-box">
      <div ?hidden=${this.page != 'edit'}>Edit</div>
      <div ?hidden=${this.page != 'view'}>View</div>
      <div ?hidden=${this.page != 'add'}>Add</div>
    </div>
    <div class="l-second panel o-box">
      <a ?hidden=${!this.hasRequestedCycle} class="focal-link category-brand--putah-creek pointer u-space-mb ${this.page == 'edit' ? 'pressed' : ''}">
        <div class="focal-link__figure focal-link__icon">
          <ucdlib-icon icon="ucd-public:fa-pen"></ucdlib-icon>
        </div>
        <div class="focal-link__body"><strong>Edit Cycle</strong></div>
      </a>
      <a class="focal-link category-brand--sage pointer u-space-mb ${this.page == 'add' ? 'pressed' : ''}">
        <div class="focal-link__figure focal-link__icon">
          <ucdlib-icon icon="ucd-public:fa-plus"></ucdlib-icon>
        </div>
        <div class="focal-link__body"><strong>Add a Cycle</strong></div>
      </a>
    </div>
  </div>

`;}
