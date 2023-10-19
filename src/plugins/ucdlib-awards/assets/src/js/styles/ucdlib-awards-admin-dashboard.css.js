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
  ucdlib-awards-admin-dashboard .status-row {
    display: flex;
    align-items: center;
  }
  ucdlib-awards-admin-dashboard .status-row div:first-child {
    margin-right: 1rem;
    width: 110px;
    min-width: 110px;
  }

`;

export default customStyles;
