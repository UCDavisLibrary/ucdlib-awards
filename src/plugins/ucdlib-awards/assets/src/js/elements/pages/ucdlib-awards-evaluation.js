import { LitElement } from 'lit';
import * as templates from "./ucdlib-awards-evaluation.tpl.js";

import wpAjaxController from "../../controllers/wp-ajax.js";

import Mixin from "@ucd-lib/theme-elements/utils/mixins/mixin.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { MutationObserverController } from '@ucd-lib/theme-elements/utils/controllers/index.js';

export default class UcdlibAwardsEvaluation extends Mixin(LitElement)
  .with(MainDomElement) {

  static get properties() {
    return {
      judges: { type: Array },
      judge: { type: Object },
      page: { type: String },
      adminSelectedJudgeId: { type: String },
      rubricItems: { type: Array },
      _rubricItems: { type: Array },
      errorMessage: { type: String },
      rubricScoringCalculation: { type: String },
      rubricUploadedFile: { type: String },
      applicants: { type: Array },
      selectedApplicant: { type: Object }
    }
  }

  constructor() {
    super();
    this.render = templates.render.bind(this);
    this.renderAdminJudgeSelect = templates.renderAdminJudgeSelect.bind(this);
    this.renderRubricPanel = templates.renderRubricPanel.bind(this);
    this.renderEvaluationStatusPanel = templates.renderEvaluationStatusPanel.bind(this);
    this.renderApplicantList = templates.renderApplicantList.bind(this);
    this.renderApplicantEvaluationForm = templates.renderApplicantEvaluationForm.bind(this);

    this.mutationObserver = new MutationObserverController(this);
    this.wpAjax = new wpAjaxController(this);

    this.judges = [];
    this.page = 'loading';
    this.adminSelectedJudgeId = '';
    this.judge = {};
    this.errorMessage = '';
    this.rubricItems = [];
    this._rubricItems = [];
    this.rubricScoringCalculation = '';
    this.rubricUploadedFile = '';
    this.applicants = [];
    this.selectedApplicant = {};
  }

  willUpdate(props) {
    if ( props.has('rubricItems') ){
      this._rubricItems = this.rubricItems.map(item => {
        item = {...item};
        item.label = `${item.title} (${item.range_max})`;
        item.expanded = false;
        item.hasDetails = item.description ? true : false;
        return item;
      }
    );
    }
  }

  _onRubricItemToggle(rubricItemId){
    const item = this._rubricItems.find(item => item.rubric_item_id === rubricItemId);
    item.expanded = !item.expanded;
    this._rubricItems = [...this._rubricItems];
  }

  async _onApplicantSelect(applicant_id){
    const applicant = this.applicants.find(applicant => applicant.user_id === applicant_id);
    if ( !applicant ) {
      this.errorMessage = "There was an error retrieving the applicant. Please try again later."
      this.page = 'error';
      return;
    }
    this.selectedApplicant = {...applicant};
    this.page = 'applicant';
  }

  async _onAdminJudgeSelect(e){
    this.adminSelectedJudgeId = e.target.value;
    this.judge = this.judges.find(judge => judge.id === this.adminSelectedJudgeId);
    this.retrieveAndShowApplicants();
  }

  async retrieveAndShowApplicants(){
    this.page = 'loading';
    const response = await this.getApplicantsByJudgeId();
    if ( response.success ) {
      this.page = 'applicant-select';
      this.applicants = response.data.applicants
      console.log(this.applicants);
    } else {
      this.errorMessage = "There was an error retrieving your assigned applicants. Please try again later."
      this.page = 'error';
    }
  }

  async getApplicantsByJudgeId(judgeId){
    if ( !judgeId ) judgeId = this.judge.id;
    const response = await this.wpAjax.request('getApplicants', {"judge_id": judgeId});
    if ( response.success ) {
      response.data.applicants = response.data.applicants.map(applicant => {

        // status label
        applicant.applicationStatus = {
          label: 'Unknown',
          brand: 'double-decker'
        };
        if ( applicant.assignedJudgeIds?.conflictOfInterest?.includes?.(judgeId) ){
          applicant.applicationStatus = {
            label: 'Conflict of Interest',
            brand: 'double-decker'
          };
        } else if ( applicant.assignedJudgeIds?.evaluated?.includes?.(judgeId) ){
          applicant.applicationStatus = {
            label: 'Completed',
            brand: 'redwood'
          };
        } else if ( applicant.assignedJudgeIds?.evaluationInProgress?.includes?.(judgeId) ){
          applicant.applicationStatus = {
            label: 'In Progress',
            brand: 'admin-blue'
          };
        } else if ( applicant.assignedJudgeIds?.assigned?.includes?.(judgeId) ){
          applicant.applicationStatus = {
            label: 'New',
            brand: 'admin-blue'
          };
        }

        // name
        applicant.name = `${applicant.first_name} ${applicant.last_name}`;

        return applicant;
      });
    }
    return response;
  }

  hideWpMenus(){
    const selectorsToHide = [
      '#adminmenuwrap',
      '#adminmenuback',
      '#wpadminbar',
      '#wpfooter'
    ];
    selectorsToHide.forEach(selector => {
      const el = document.querySelector(selector);
      if ( el ) el.style.display = 'none';
    });

    const content = document.querySelector('#wpbody-content');
    Array.from(content.children).forEach(child => {
      if ( child.nodeName === 'UCDLIB-AWARDS-PAGE' ) return;
      child.style.display = 'none';
    });

    const applyStyles = [
      {'ele': '#wpcontent', 'styles': {'margin-left': '0px'}},
      {'ele': 'html.wp-toolbar', 'styles': {'padding-top': '0px', 'display': 'block'}},
      {'ele': '#wpbody', 'styles': {'padding-top': '0px'}}
    ];
    applyStyles.forEach(style => {
      const el = document.querySelector(style.ele);
      if ( el ) {
        Object.keys(style.styles).forEach(key => {
          el.style[key] = style.styles[key];
        });
      }
    });

  }

  /**
   * @description Callback for the mutation observer
   */
  _onChildListMutation(){
    Array.from(this.children).forEach(child => {
      if ( child.nodeName === 'SCRIPT' && child.type === 'application/json' ) {
        this._parsePropsScript(child);
        return;
      }
    });
  }

  /**
     * @description Parses the JSON script tag in the DOM and sets the element properties
     * @param {*} script - the JSON script tag DOM element
     * @returns
     */
  async _parsePropsScript(script){
    let data = {};
    try {
      data = JSON.parse(script.text);
      console.log('data', data);
    } catch(e) {
      console.error('Error parsing JSON script', e);
    }
    if ( !data ) return;
    if ( data.hideWpMenus ) {
      this.hideWpMenus();
    }
    if ( data.judges ) {
      this.judges = data.judges;
      this.page = 'judge-select';
    }
    if ( data.judge ) {
      this.judge = data.judge;
    }
    if ( data.rubricItems ) {
      this.rubricItems = data.rubricItems;
    }
    if ( data.rubricScoringCalculation ) {
      this.rubricScoringCalculation = data.rubricScoringCalculation;
    }
    if ( data.rubricUploadedFile ) {
      this.rubricUploadedFile = data.rubricUploadedFile;
    }

    if ( !this.rubricItems.length ) {
      this.errorMessage = "There was an error retrieving the evaluation rubric. Please try again later."
      this.page = 'error';
    }

    if ( !this.judges.length && !this.applicants.length ){
      await this.retrieveAndShowApplicants();
    }

  }

}

customElements.define('ucdlib-awards-evaluation', UcdlibAwardsEvaluation);
