import { css } from 'lit';

const customStyles = css`
  ucdlib-awards-judges-display .row {
    display: flex;
    align-items: center;
  }
  ucdlib-awards-judges-display .table-head .select-box {
    align-items: center;
    padding-top: 0;
  }
  ucdlib-awards-judges-display .select-box {
    width: 40px;
    min-width: 40px;
    justify-content: center;
    display: flex;
    padding-top: 6px;
  }
  ucdlib-awards-judges-display .select-box input {
    width: 20px;
    min-width: 20px;
    height: 20px;
    min-height: 20px;
    margin-right: 0;
  }
  ucdlib-awards-judges-display .lg-screen-block {
    display: none !important;
  }
  ucdlib-awards-judges-display .lg-screen-flex {
    display: none !important;
  }
  ucdlib-awards-judges-display .mb-screen-flex {
    display: flex !important;
  }
  ucdlib-awards-judges-display .table-body .row:nth-child(2n) {
    background-color: #ebf3fa;
  }
  ucdlib-awards-judges-display .table-body .row {
    padding: 1rem 0;
  }
  ucdlib-awards-judges-display .view-toggle-icon {
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
  ucdlib-awards-judges-display .mb-details {
    display: block;
    margin-top: .5rem;
  }
  ucdlib-awards-judges-display .has-mb-details {
      align-items: flex-start;
  }
  ucdlib-awards-judges-actions .add-judge-buttons {
    display: flex;
    flex-direction: column;
    gap: .5rem;
  }
  ucdlib-awards-judges-actions .add-judge-buttons .or-divider {
    text-align: center;
    color: #022851;
  }
  ucdlib-awards-judges-actions .judge-copy-row {
    display: grid;
    grid-template-columns: 15px 1fr;
    gap: 1rem;
    padding: .5rem .25rem;
  }
  ucdlib-awards-judges-actions .judge-copy-row.judge-copy-row--header {
    font-weight: 700;
    color: #022851;
  }
  ucdlib-awards-judges-actions .judge-copy-has-categories .judge-copy-row {
    grid-template-columns: 15px 1fr 1fr;
  }
  ucdlib-awards-judges-actions .judge-copy-has-categories .category-column select {
    max-width: 300px;
  }
  ucdlib-awards-judges-actions .judge-copy-no-categories .category-column, ucdlib-awards-judges-actions .judge-copy-no-categories .category-column-mobile {
    display: none !important;
  }
  ucdlib-awards-judges-actions .category-column-mobile {
    display: none;
  }
  ucdlib-awards-judges-actions .judge-copy-row:nth-child(2n of .judge-copy-row:not([hidden])) {
    background-color: #ebf3fa;
  }
  @media (max-width: 1000px) {
    ucdlib-awards-judges-actions .judge-copy-has-categories .judge-copy-row {
      grid-template-columns: 15px 1fr;
    }
    ucdlib-awards-judges-actions .judge-copy-has-categories .category-column {
      display: none !important;
    }
    ucdlib-awards-judges-actions .category-column-mobile {
      display: block !important;
      margin-top: .5rem;
    }
  }
  @media (min-width: 1200px) {
    ucdlib-awards-judges-display .row {
    display: grid;
    gap: 1rem;
    grid-template-columns: 40px 2fr 1fr 1fr;
    }
    ucdlib-awards-judges-display .row.with-categories {
      grid-template-columns:  40px 2fr 1.3fr 1fr 1fr;
    }
    ucdlib-awards-judges-display .lg-screen-block {
      display: block !important;
    }
    ucdlib-awards-judges-display .lg-screen-flex {
      display: flex !important;
    }
    ucdlib-awards-judges-display .mb-screen-flex {
      display: none !important;
    }
    ucdlib-awards-judges-display .table-head {
      font-weight: 700;
      color: #022851;
    }
    ucdlib-awards-judges-display .mb-details {
      display: none !important;
    }
    ucdlib-awards-judges-display .has-mb-details {
      align-items: center;
    }
    ucdlib-awards-judges-assignments .judge-name {
      font-weight: 400;
    }
  }
`;

export default customStyles;
