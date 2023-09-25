import { css } from 'lit';

const customStyles = css`
  ucdlib-awards-applicants-display .row {
    display: flex;
    align-items: center;
  }
  ucdlib-awards-applicants-display .table-head .select-box {
    align-items: center;
    padding-top: 0;
  }
  ucdlib-awards-applicants-display .select-box {
    width: 40px;
    min-width: 40px;
    justify-content: center;
    display: flex;
    padding-top: 6px;
  }
  ucdlib-awards-applicants-display .select-box input {
    width: 20px;
    min-width: 20px;
    height: 20px;
    min-height: 20px;
    margin-right: 0;
  }
  ucdlib-awards-applicants-display .lg-screen-block {
    display: none !important;
  }
  ucdlib-awards-applicants-display .lg-screen-flex {
    display: none !important;
  }
  ucdlib-awards-applicants-display .mb-screen-flex {
    display: flex !important;
  }
  ucdlib-awards-applicants-display .table-body .row:nth-child(2n) {
    background-color: #ebf3fa;
  }
  ucdlib-awards-applicants-display .table-body .row {
    padding: 1rem 0;
  }
  ucdlib-awards-applicants-display .sort-icon {
    margin-left: .25rem;
  }
  ucdlib-awards-applicants-display .sort-icon ucdlib-icon {
    min-height: 20px;
    height: 20px;
    min-width: 20px;
    width: 20px;
    position: relative;
    color: #cce0f3;
    cursor: pointer;
  }
  ucdlib-awards-applicants-display .sort-icon ucdlib-icon.active {
    color: #022851;
  }
  ucdlib-awards-applicants-display .sort-icon ucdlib-icon:hover {
    color: #022851;
  }
  ucdlib-awards-applicants-display .sort-icon ucdlib-icon.sort-icon__up {
    top: 5px;
  }
  ucdlib-awards-applicants-display .sort-icon ucdlib-icon.sort-icon__down {
    bottom: 5px;
  }
  ucdlib-awards-applicants-display .view-toggle-icon {
    width: 40px;
    min-width: 40px;
    height: 40px;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #022851;
    cursor: pointer;
  }
  ucdlib-awards-applicants-display .mb-details {
    display: block;
    margin-top: .5rem;
  }
  ucdlib-awards-applicants-display .has-mb-details {
      align-items: flex-start;
    }
  @media (min-width: 1200px) {
    ucdlib-awards-applicants-display .row {
    display: grid;
    gap: 1rem;
    grid-template-columns: 40px 2fr 1fr 1fr;
    }
    ucdlib-awards-applicants-display .row.with-categories {
      grid-template-columns:  40px 2fr 1fr 1fr 1fr;
    }
    ucdlib-awards-applicants-display .lg-screen-block {
      display: block !important;
    }
    ucdlib-awards-applicants-display .lg-screen-flex {
      display: flex !important;
    }
    ucdlib-awards-applicants-display .mb-screen-flex {
      display: none !important;
    }
    ucdlib-awards-applicants-display .table-head {
      font-weight: 700;
      color: #022851;
    }
    ucdlib-awards-applicants-display .mb-details {
      display: none !important;
    }
    ucdlib-awards-applicants-display .has-mb-details {
      align-items: center;
    }
  }
`;

export default customStyles;
