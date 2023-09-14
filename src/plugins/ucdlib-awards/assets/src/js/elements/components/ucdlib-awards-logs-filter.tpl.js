import { html } from 'lit';

export function render() {
return html`
  <div class="panel panel--icon panel--icon-custom o-box category-brand--primary">
    <h2 class="panel__title">
      <ucdlib-icon icon="ucd-public:fa-filter" class="panel__custom-icon"></ucdlib-icon>
      <span class='primary'>Log Filters</span>
    </h2>
    <form @submit=${this._onSubmit}>
      ${this.filters.map(filter => this.renderFilter(filter))}
      <button type="submit" class="btn btn--primary btn--block border-box u-space-mt--large">Apply Filters</button>
    </form>
  </div>
`;}

export function renderFilter(filter){
  if ( filter?.type === 'multiSelect' ){
    const selected = this.selectedFilters[filter.queryVar] || [];
    return html`
      <div class='field-container'>
        <label>${filter.label}</label>
        <ucd-theme-slim-select @change=${e => this._onFilterChange(filter.queryVar, e.detail.map(ee => {return ee.value}))}>
          <select multiple>
            ${filter.options.map(option => html`
              <option ?selected=${selected.includes(option.value)} value="${option.value}">${option.label}</option>
            `)}
          </select>
        </ucd-theme-slim-select>
      </div>
    `;
  }
  return html``;
}
