import { css } from 'lit';

const customStyles = css`

ucdlib-awards-admin-rubric .insert-bar {
  opacity: 0;
  padding: .5rem;
  display: flex;
  align-items: center;
  transition: opacity .2s ease-in-out;
}
ucdlib-awards-admin-rubric .insert-bar:hover {
  opacity: 1;
}
ucdlib-awards-admin-rubric input[type="file"] {
  border: none;
  box-shadow: none;
}
ucdlib-awards-admin-rubric .upload-action-icons ucdlib-icon {
  width: 18px;
  height: 18px;
  min-width: 18px;
  min-height: 18px;
}

`;

export default customStyles;
