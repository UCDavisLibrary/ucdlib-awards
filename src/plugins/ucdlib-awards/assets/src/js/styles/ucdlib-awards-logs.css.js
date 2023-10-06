import { css } from 'lit';

const customStyles = css`

  #logs-loading > div {
    display: flex;
    justify-content: center;
  }
  #logs-loading ucdlib-icon {
    animation: spin 2s linear infinite, opacity-pulse 2s linear infinite;
    width: calc(3vw);
    height: calc(3vw);
    max-width: 50px;
    max-height: 50px;
    color: #022851;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(359deg); }
  }
  @keyframes opacity-pulse {
    0% { opacity: 0.4; }
    25% { opacity: 0.5; }
    50% { opacity: 1; }
    75% { opacity: 0.5; }
    100% { opacity: 0.4; }
  }
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
      margin-right: 1rem;
    }
  }
`;

export default customStyles;
