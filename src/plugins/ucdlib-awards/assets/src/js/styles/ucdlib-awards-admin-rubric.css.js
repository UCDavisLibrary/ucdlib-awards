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

`;

export default customStyles;
