import { css } from 'lit';

const customStyles = css`
  ucdlib-awards-supporters-display .row {
    display: flex;
    align-items: center;
  }
  ucdlib-awards-supporters-display .table-head .select-box {
    align-items: center;
    padding-top: 0;
  }
  ucdlib-awards-supporters-display .select-box {
    width: 40px;
    min-width: 40px;
    justify-content: center;
    display: flex;
    padding-top: 6px;
  }
  ucdlib-awards-supporters-display .select-box input {
    width: 20px;
    min-width: 20px;
    height: 20px;
    min-height: 20px;
    margin-right: 0;
  }
  ucdlib-awards-supporters-display .lg-screen-block {
    display: none !important;
  }
  ucdlib-awards-supporters-display .lg-screen-flex {
    display: none !important;
  }
  ucdlib-awards-supporters-display .mb-screen-flex {
    display: flex !important;
  }
  ucdlib-awards-supporters-display .table-body .row:nth-child(2n) {
    background-color: #ebf3fa;
  }
  ucdlib-awards-supporters-display .table-body .row {
    padding: 1rem 0;
  }
  ucdlib-awards-supporters-display .view-toggle-icon {
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
  ucdlib-awards-supporters-display .mb-details {
    display: block;
    margin-top: .5rem;
  }
  ucdlib-awards-supporters-display .has-mb-details {
      align-items: flex-start;
    }
  @media (min-width: 1200px) {
    ucdlib-awards-supporters-display .row {
      display: grid;
      gap: 1rem;
      grid-template-columns: 40px 2fr 2fr 1fr;
    }
    ucdlib-awards-supporters-display .lg-screen-block {
      display: block !important;
    }
    ucdlib-awards-supporters-display .lg-screen-flex {
      display: flex !important;
    }
    ucdlib-awards-supporters-display .mb-screen-flex {
      display: none !important;
    }
    ucdlib-awards-supporters-display .table-head {
      font-weight: 700;
      color: #022851;
    }
    ucdlib-awards-supporters-display .mb-details {
      display: none !important;
    }
    ucdlib-awards-supporters-display .has-mb-details {
      align-items: center;
    }
  }
`;

export default customStyles;
