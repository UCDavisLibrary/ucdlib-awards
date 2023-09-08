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
[hidden] {
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
select {
  box-sizing: border-box;
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
`;

export default customStyles;
