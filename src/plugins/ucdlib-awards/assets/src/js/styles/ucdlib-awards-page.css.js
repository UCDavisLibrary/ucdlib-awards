import { css } from 'lit';

const customStyles = css`
:host {
  display: block;
  background-color: #fff;
  color: #000;
  margin-right: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  line-height: 1.618;
  font-size: 1rem;
  font-family: "proxima-nova", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
}
#page-title {
  display: flex;
  align-items: center;
}
#page-title img {
  margin-right: 1rem;
  height: 4rem;
  width: auto;
}
.page-title-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}
.page-cycle-select {
  padding: 1.5rem;
  background-color: #fff9e6;
  width: 100%;
  margin-bottom: 1rem;
  margin-top: .5rem;
}
@media (min-width: 768px) {
  .page-cycle-select {
    width: auto;
    margin-bottom: 0;
    margin-top: 0;
    max-width: 300px;
  }
}

[hidden] {
  display: none !important;
}
.hidden {
  display: none !important;
}
.basic-notification {
  display: flex;
  align-items: center;
  padding: 1rem;
  font-weight: 700;
}
.focal-link__icon ucdlib-icon {
  width: 35px;
  min-width: 35px;
  height: 35px;
  min-height: 35px;
}
.focal-link.pressed {
  background-color: rgba(var(--category-brand-rgb, var(--focal-link-background)), 0.2);
}
.pointer {
  cursor: pointer;
}
.pointer.pressed {
  cursor: default;
}
.focal-link.pressed {
  color: rgb(0, 17, 36);
  text-decoration: none;
}
.page-subtitle {
  margin: .5rem 0px 1rem 1rem;
}
input[type="text"] {
  box-sizing: border-box;
}
input[type="date"] {
  box-sizing: border-box;
}
input[type="number"] {
  box-sizing: border-box;
}
input[type="file"] {
  box-sizing: border-box;
}
input[type="email"] {
  box-sizing: border-box;
}
select {
  box-sizing: border-box;
}
textarea {
  box-sizing: border-box;
}
select[disabled] {
  opacity: 0.7;
}
.checkbox.no-label label::before {
  top: auto;
  bottom: 0px;
}
.checkbox.no-label label::after {
  top: auto;
  bottom: .4em;
}
.error > label {
  color: #c10230;
}
.error > input {
  border-color: #c10230;
  background-color: #c102300d;
}
.error > select {
  border-color: #c10230;
  background-color: #c102300d;
}
.button-row {
  display: flex;
}
.button-row > button {
  margin-right: 1rem;
}
#toast {
  position: fixed;
  z-index: 1000;
  display: none;
  transition: all .5s ease-out;
  align-items: center;
}
a.icon-ucdlib, span.icon-ucdlib {
  display: flex;
  align-items: center;
}
.panel a.icon-ucdlib ucdlib-icon {
  color: var(--category-brand, #73abdd);
  margin-right: .5rem;
  min-width: .9rem;
  min-height: .9rem;
  width: .9rem;
  height: .9rem;
}
.panel__title ucdlib-icon {
  width: 1.6055rem;
  height: 1.6055rem;
  margin-right: .5rem;
  min-width: 1.6055rem;
}
@media (min-width: 768px) {
  .panel__title ucdlib-icon {
    width: 2.47rem;
    height: 2.47rem;
    margin-right: 1rem;
    min-width: 2.47rem;
  }
}
ucdlib-icon.panel__custom-icon {
  color: var(--category-brand, #022851);
}
.panel--icon .panel__title {
  align-items: center;
  margin-bottom: 1rem;
  color: #022851;
}
.panel--icon .panel__title {
  display: flex;
  margin-left: calc(-1*var(--o-box-spacer, 0));
}
.flex-center {
  display: flex;
  align-items: center;
}
.border-box {
  box-sizing: border-box !important;
}
.no-wrap {
  white-space: nowrap;
}
.flex-wrap {
  flex-wrap: wrap;
}
.flex-grow {
  flex-grow: 1;
}
.flex-space-between {
  justify-content: space-between;
}
.border-bottom-gold {
  border-bottom: 2px dotted #ffbf00;
}
.border-bottom-blue {
  border-bottom: 1px solid #022851;
}
.gold-box {
  border: 1px solid #ffbf00;
}
.bold {
  font-weight: 700;
}
.vertical-link--circle ucdlib-icon.vertical-link__image {
  height: 50%;
}
.hint-text {
  font-size: .9rem;
  color: #13639e;
}
.hint-text--grey {
  color: #3c3c3c;
}
.overflow-elipsis {
  overflow-y: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.width-100 {
  width: 100%;
}
.marketing-highlight__cta:hover, .marketing-highlight__cta:focus {
  color: var(--category-brand-contrast-color, #022851);
  text-decoration: none;
}
.icon-hover:hover, .icon-hover:focus {
  color: #008eaa;
}
.sort-icon {
  margin-left: .25rem;
}
.sort-icon ucdlib-icon {
  min-height: 20px;
  height: 20px;
  min-width: 20px;
  width: 20px;
  position: relative;
  color: #cce0f3;
  cursor: pointer;
}
.sort-icon ucdlib-icon.active {
  color: #022851;
}
.sort-icon ucdlib-icon:hover {
  color: #022851;
}
.sort-icon ucdlib-icon.sort-icon__up {
  top: 5px;
}
.sort-icon ucdlib-icon.sort-icon__down {
  bottom: 5px;
}
.small-text {
  font-size: .9rem;
}
.overflow-anywhere {
  overflow-wrap: anywhere;
}

.loading-icon {
    display: flex;
    justify-content: center;
}
.loading-icon ucdlib-icon {
  animation: spin 2s linear infinite, opacity-pulse 2s linear infinite;
  width: calc(3vw);
  height: calc(3vw);
  max-width: 50px;
  max-height: 50px;
  color: #022851;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(359deg); }
}
@keyframes opacity-pulse {
  0% { opacity: 0.4; }
  25% { opacity: 0.5; }
  50% { opacity: 1; }
  75% { opacity: 0.5; }
  100% { opacity: 0.4; }
}
.input-max-width {
  max-width: 300px;
}
`;

export default customStyles;
