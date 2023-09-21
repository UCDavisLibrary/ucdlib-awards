import { css } from 'lit';

const customStyles = css`
  ucdlib-awards-applicants-display .row {
    display: flex;
    align-items: center;
    margin: 1rem 0;
  }
  ucdlib-awards-applicants-display .select-box {
    width: 40px;
    min-width: 40px;
    align-items: center;
    display: flex;
    justify-content: center;
    height: 40px;
    min-height: 40px;
    margin-right: .5rem;
  }
  ucdlib-awards-applicants-display .select-box input {
    width: 20px;
    min-width: 20px;
    height: 20px;
    min-height: 20px;
    margin-right: 0;
  }
  ucdlib-awards-applicants-display .applicant-name {
    flex: 1;
  }
  ucdlib-awards-applicants-display .lg-screen-block {
    display: none !important;
  }
  @media (min-width: 1200px) {
    ucdlib-awards-applicants-display .lg-screen-block {
      display: block !important;
    }
  }
`;

export default customStyles;
