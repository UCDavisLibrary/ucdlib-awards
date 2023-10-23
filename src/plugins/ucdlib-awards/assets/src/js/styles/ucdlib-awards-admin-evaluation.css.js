import { css } from 'lit';

const customStyles = css`
  ucdlib-awards-admin-evaluation th.applicant {
    vertical-align: middle;
    min-width: 150px;
  }
  ucdlib-awards-admin-evaluation th.total {
    vertical-align: middle;
  }
  ucdlib-awards-admin-evaluation th.rubric-items {
    text-align: center;
  }
  ucdlib-awards-admin-evaluation thead {
    background-color: #dbeaf7;
  }
  ucdlib-awards-admin-evaluation tbody tr:first-child td {
    border-top: none;
  }

`;

export default customStyles;
