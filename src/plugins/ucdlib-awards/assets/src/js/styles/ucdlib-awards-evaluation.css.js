import { css } from 'lit';

const customStyles = css`
  ucdlib-awards-evaluation .rubric-panel ul {
    padding-left: 1rem;
  }
  ucdlib-awards-evaluation .rubric-panel .list--arrow li::marker {
  color: var(--category-brand);
  }
  ucdlib-awards-evaluation .expand-icon.expanded {
    transform: rotate(180deg);
  }
  ucdlib-awards-evaluation .expand-icon {
    transition: transform 0.2s;
  }
  ucdlib-awards-evaluation .applicant-list-row {
    padding: .5rem;
  }
  ucdlib-awards-evaluation .applicant-list-row--body:hover {
    background-color: #dbeaf7;
  }
  ucdlib-awards-evaluation .applicant-list-row--body {
    cursor: pointer;
    border-bottom: 1px solid #dbeaf7;
  }
  ucdlib-awards-evaluation .applicant-list-row--head {
    font-weight: 700;
    display: none;
    color: #022851;
  }
  ucdlib-awards-evaluation .applicant-list-cell__name {
    margin-right: 1rem;
  }
  ucdlib-awards-evaluation .applicant-list-cell__status {
    font-weight: 700;
  }
  @media (min-width: 992px) {
  ucdlib-awards-evaluation .applicant-list-row--head {
    display: grid;
  }
}


`;

export default customStyles;
