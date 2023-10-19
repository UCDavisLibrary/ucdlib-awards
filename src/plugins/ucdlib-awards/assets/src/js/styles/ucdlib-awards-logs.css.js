import { css } from 'lit';

const customStyles = css`

  ucdlib-awards-logs .log {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
  }
  ucdlib-awards-logs .log .icon-container {
    width: 50px;
    height: 50px;
    min-width: 50px;
    min-height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    margin-right: 1rem;
    background-color: var(--category-brand, #022851);
    color: var(--category-brand-contrast-color, #fff);
  }
  ucdlib-awards-logs .log .log-content .log-date {
    font-size: .9rem;
    color: #424242;
  }
  ucdlib-awards-logs .log-person {
    font-style: italic;
    color: #022851;
  }
  @media screen and (min-width: 768px) {
    ucdlib-awards-logs .log .log-content {
      flex: 1;
      display: flex;
      align-items: center;
    }
    ucdlib-awards-logs .log .log-content .log-text {
      flex: 1;
      margin-right: 1.5rem;
    }
  }
`;

export default customStyles;
