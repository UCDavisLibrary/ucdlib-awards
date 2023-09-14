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
`;

export default customStyles;
