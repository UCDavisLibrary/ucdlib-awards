import { css } from 'lit';

const customStyles = css`
  ucdlib-awards-admin-dashboard .dates-label {
    width: 45px;
    font-weight: 700;
  }
  ucdlib-awards-admin-dashboard ul.list--arrow {
    padding-left: 1rem;
  }
  ucdlib-awards-admin-dashboard .list--arrow li::marker {
    color: var(--category-brand);
  }

`;

export default customStyles;
