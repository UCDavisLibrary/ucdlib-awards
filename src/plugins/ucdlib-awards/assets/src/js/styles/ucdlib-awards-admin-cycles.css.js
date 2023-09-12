import { css } from 'lit';

const customStyles = css`

ucdlib-awards-admin-cycles .dates-column-labels {
  display: none;
}
ucdlib-awards-admin-cycles .dates-label {
  width: 45px;
}
ucdlib-awards-admin-cycles .dates-row > div {
  display: flex;
  align-items: center;
}
ucdlib-awards-admin-cycles .dates-row > div:first-child {
  font-weight: 700;
}
ucdlib-awards-admin-cycles .dates-row {
  margin-bottom: 1rem;
}
ucdlib-awards-admin-cycles .form-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
ucdlib-awards-admin-cycles .form-row ucdlib-icon {
  width: 15px;
  min-width: 15px;
}

@media (min-width: 768px) {
  ucdlib-awards-admin-cycles .dates-column-labels {
    border-bottom: 2px dotted #ffbf00;
    margin-bottom: .5rem !important;
  }

  ucdlib-awards-admin-cycles .dates-row {
  display: flex;
  align-items: center;
  margin-bottom: .5rem
  }
  ucdlib-awards-admin-cycles .dates-row > div {
    width: 100px;
    min-width: 100px;
  }
  ucdlib-awards-admin-cycles .dates-row > div:nth-child(2) {
    margin-left: 1rem;
    margin-right: 1rem;
  }
  ucdlib-awards-admin-cycles .dates-row > div:first-child {
    width: 250px;
    min-width: 250px;
    font-weight: 500;
  }
  ucdlib-awards-admin-cycles .dates-label {
    display: none;
  }
}
`;

export default customStyles;
