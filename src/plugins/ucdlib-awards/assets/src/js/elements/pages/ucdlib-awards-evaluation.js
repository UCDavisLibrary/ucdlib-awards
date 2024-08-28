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
      selectedApplicant: { type: Object },
      applicationEntryCache: { state: true},
      scoreCache: { state: true},
      applicationFormId: { type: String },
      awardsTitle: { type: String },
      coiCheck: { type: String },
      coiDetails: {type: String},
      evaluationFormData: { type: Object },
      canSubmitEvaluation: { type: Boolean },
      evaluationFormErrorMessages: { type: Array },
      evaluationSubmissionDate: { type: String }
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
    this.renderEvaluationFormItem = templates.renderEvaluationFormItem.bind(this);

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
    this.applicationEntryCache = {};
    this.scoreCache = {};
    this.applicationFormId = '';
    this.awardsTitle = '';
    this.coiCheck = '';
    this.coiDetails = '';
    this.evaluationFormData = {};
    this.canSubmitEvaluation = false;
    this.evaluationFormErrorMessages = [];
    this.evaluationSubmissionDate = '';
  }

  willUpdate(props) {
    if ( props.has('rubricItems') ){
      this._rubricItems = this.rubricItems.map(item => {
        item = {...item};
        item.label = `${item.title} (${item.range_max})`;
        item.expanded = false;
        item.hasDetails = item.description ? true : false;
        return item;
      });
    }
    if ( props.has('selectedApplicant') || props.has('coiCheck') ){
      let canSubmitEvaluation = false;

      const statuses = ['new', 'in-progress'];
      const status = this.selectedApplicant.applicationStatus?.slug;
      if ( !statuses.includes(status) ) {
        canSubmitEvaluation = false;
      } else if ( status === 'in-progress' ){
        canSubmitEvaluation = true;
      } else if ( this.coiCheck === 'yes' ) {
        canSubmitEvaluation = false;
      } else if ( this.coiCheck === 'no' ) {
        canSubmitEvaluation = true;
      }

      this.canSubmitEvaluation = canSubmitEvaluation;
    }
  }

  _onRubricItemToggle(rubricItemId){
    const item = this._rubricItems.find(item => item.rubric_item_id === rubricItemId);
    item.expanded = !item.expanded;
    this._rubricItems = [...this._rubricItems];
  }

  async _onCoiYesSubmit(e){
    e.preventDefault();
    const payload = {"judge_id": this.judge.id, "applicant_id": this.selectedApplicant.user_id, "coi_details": this.coiDetails};
    const response = await this.wpAjax.request('setConflictOfInterest', payload);
    if ( response.success ) {
      this.dispatchEvent(new CustomEvent('toast-request', {
        bubbles: true,
        composed: true,
        detail: {
          message: 'The administrator has been notified.',
          type: 'success'
        }
      }));
      const entryId = this.selectedApplicant.applicationEntry?.entry_id;
      delete this.applicationEntryCache[entryId];
      await this.retrieveAndShowApplicants();
    } else {
      this.dispatchEvent(new CustomEvent('toast-request', {
        bubbles: true,
        composed: true,
        detail: {
          message: 'There was an error notifying the administrator. Please try again later.',
          type: 'error'
        }
      }));
    }

  }

  _onCoiCheck(e){
    this.coiCheck = e.target.value;
    if ( this.coiCheck == 'no') {
      this.dispatchEvent(new CustomEvent('toast-request', {
        bubbles: true,
        composed: true,
        detail: {
          message: 'Thank you for your response. You may now proceed with evaluating this applicant.',
          type: 'success'
        }
      }));
    }

  }

  async _onEvaluationSubmit(e){
    e.preventDefault();
    if ( !this.canSubmitEvaluation ) return;
    this.evaluationFormErrorMessages = [];
    const submitter = e.submitter;
    if ( !submitter ) {
      this.evaluationFormErrorMessages = ['Unable to submit/save evaluation. Please try using a different browser.'];
      return;
    }
    const submitAction = submitter.getAttribute('data-submit-action');
    const payload = {
      "judge_id": this.judge.id,
      "applicant_id": this.selectedApplicant.user_id,
      "scores": this.evaluationFormData,
      "submit_action": submitAction
    }
    this.canSubmitEvaluation = false;
    const response = await this.wpAjax.request('setScores', payload);
    this.canSubmitEvaluation = true;
    if ( response.success ){
      this.applicants = response.data.applicants.map(applicant => this.formatApplicant(applicant));
      response.data.scores.forEach(score => {
        if ( !score.score ) return;
        this.setEvaluationFormItem(score.rubric_item_id, 'score', score.score.score, false);
        this.setEvaluationFormItem(score.rubric_item_id, 'note', score.score.note, false);
      });

      if ( submitAction === 'save' ){
        this.dispatchEvent(new CustomEvent('toast-request', {
          bubbles: true,
          composed: true,
          detail: {
            message: 'Your evaluation has been saved.',
            type: 'success'
          }
        }));
      } else {
        this.dispatchEvent(new CustomEvent('toast-request', {
          bubbles: true,
          composed: true,
          detail: {
            message: 'Your evaluation has been submitted.',
            type: 'success'
          }
        }));
        this.page = 'applicant-select';
      }

      const cacheKey = `a${this.selectedApplicant.user_id}-j${this.judge.id}`;
      delete this.scoreCache[cacheKey];
    } else {
      this.evaluationFormErrorMessages = response.messages;
    }
  }

  async _onDownloadAllApplicationsClick(){
    if ( this.disableAllApplicationsDownload ) return;
    this.disableAllApplicationsDownload = true;
    console.log('Download all applications');
    const payload = {
      "judge_id": this.judge.id
    }
    const response = await this.wpAjax.request('getAllApplicationEntries', payload);
    if ( response.success ){
      const blob = new Blob([response.data.htmlDoc], {type: 'text/html'});
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');

    } else {
      console.error('Error getting applications', response);
      let msg = 'Unable to get applications';
      if ( response.messages.length) msg += `: ${response.messages?.[0] || ''}`;
      this.dispatchEvent(new CustomEvent('toast-request', {
        bubbles: true,
        composed: true,
        detail: {
          message: msg,
          type: 'error'
        }
      }));
    }
    this.disableAllApplicationsDownload = false;

  }

  resetApplicantData(){
    this.coiCheck = '';
    this.coiDetails = '';
    this.evaluationFormData = {};
    this.selectedApplicant = {};
    this.evaluationFormErrorMessages = [];
    this.evaluationSubmissionDate = '';
  }

  setEvaluationFormItem(rubricItemId, prop, value, noUpdate=false){
    rubricItemId = String(rubricItemId);
    if ( !prop || !rubricItemId ) return;
    this.evaluationFormData[rubricItemId] = this.evaluationFormData[rubricItemId] || {};
    this.evaluationFormData[rubricItemId][prop] = value;
    if ( noUpdate ) return;
    this.requestUpdate();
  }

  async _onApplicantSelect(applicant_id){
    const errorMessage = "There was an error retrieving the applicant. Please try again later."
    this.page = 'loading';
    this.resetApplicantData();
    const applicant = this.applicants.find(applicant => applicant.user_id === applicant_id);
    if ( !applicant ) {
      this.errorMessage = errorMessage;
      this.page = 'error';
      return;
    }

    const entryId = applicant.applicationEntry?.entry_id;
    const formId = applicant.applicationEntry?.form_id;
    const promises = [
      this.getApplicantEntry(entryId, formId),
      this.getScores(applicant_id)
    ];
    let scores = [];
    const responses = await Promise.allSettled(promises);
    responses.forEach((response, index) => {
      if ( response.status === 'fulfilled' ) {
        if ( !response.value.success ) {
          this.page = 'error';
          console.error('Error retrieving applicant entry', response.value);
          return;
        } else if ( index === 1 ) {
          scores = response.value.data.scores;
          this.evaluationSubmissionDate = response.value.data.submittedDate;
        }
      } else {
        this.page = 'error';
        console.error('Error retrieving applicant entry', response.reason);
      }
    });

    if ( this.page === 'error' ) {
      this.errorMessage = errorMessage;
      return;
    }
    this.selectedApplicant = {...applicant};
    scores.forEach(score => {
      if ( !score.score ) return;
      this.setEvaluationFormItem(score.rubric_item_id, 'score', score.score.score, false);
      this.setEvaluationFormItem(score.rubric_item_id, 'note', score.score.note, false);
    });
    this.page = 'applicant';
    this.requestUpdate();
  }

  async getScores(applicantId, judgeId){
    if ( !applicantId ) {
      applicantId = this.selectedApplicant.user_id;
    }
    if ( !judgeId ) {
      judgeId = this.judge.id;
    }
    const cacheKey = `a${applicantId}-j${judgeId}`;
    if ( this.scoreCache[cacheKey] ) {
      return this.scoreCache[cacheKey];
    }
    const payload = {"applicant_id": applicantId, "judge_id": judgeId};
    const response = await this.wpAjax.request('getScores', payload);
    this.scoreCache[cacheKey] = response;
    return response;
  }

  async getApplicantEntry(entryId, formId, judgeId){
    if ( this.applicationEntryCache[entryId] ) {
      return this.applicationEntryCache[entryId];
    }
    if ( !formId ) formId = this.applicationFormId;
    if ( !judgeId ) judgeId = this.judge?.id;
    const payload = {"entry_id": entryId, "form_id": formId, "judge_id": judgeId};
    const response = await this.wpAjax.request('getApplicationEntry', payload);
    this.applicationEntryCache[entryId] = response;
    return response;
  }

  async _onAdminJudgeSelect(e){
    this.adminSelectedJudgeId = e.target.value;
    this.judge = this.judges.find(judge => judge.id === this.adminSelectedJudgeId);
    this.retrieveAndShowApplicants();
  }

  async retrieveAndShowApplicants(){
    this.page = 'loading';
    const response = await this.getApplicantsByJudgeId();
    if ( !response ) return;
    if ( response.success ) {
      this.page = 'applicant-select';
      this.applicants = response.data.applicants
    } else {
      this.errorMessage = "There was an error retrieving your assigned applicants. Please try again later."
      this.page = 'error';
    }
  }

  formatApplicant(applicant, judgeId){
    if ( !judgeId ) judgeId = this.judge.id;
    // status label
    applicant.applicationStatus = {
      slug: 'unknown',
      label: 'Unknown',
      brand: 'double-decker'
    };
    if ( applicant.assignedJudgeIds?.conflictOfInterest?.includes?.(judgeId) ){
      applicant.applicationStatus = {
        slug: 'conflict-of-interest',
        label: 'Conflict of Interest',
        brand: 'double-decker'
      };
    } else if ( applicant.assignedJudgeIds?.evaluated?.includes?.(judgeId) ){
      applicant.applicationStatus = {
        slug: 'completed',
        label: 'Completed',
        brand: 'redwood'
      };
    } else if ( applicant.assignedJudgeIds?.evaluationInProgress?.includes?.(judgeId) ){
      applicant.applicationStatus = {
        slug: 'in-progress',
        label: 'In Progress',
        brand: 'admin-blue'
      };
    } else if ( applicant.assignedJudgeIds?.assigned?.includes?.(judgeId) ){
      applicant.applicationStatus = {
        slug: 'new',
        label: 'New',
        brand: 'admin-blue'
      };
    }

    // name
    applicant.name = `${applicant.first_name} ${applicant.last_name}`;

    return applicant;
  }

  async getApplicantsByJudgeId(judgeId){
    if ( !judgeId ) judgeId = this.judge.id;
    const response = await this.wpAjax.request('getApplicants', {"judge_id": judgeId});
    if ( !response ) return;
    if ( response.success ) {
      response.data.applicants = response.data.applicants.map(applicant => this.formatApplicant(applicant));
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
    if ( data.awardsTitle ) {
      this.awardsTitle = data.awardsTitle;
    }

    if ( !this.rubricItems.length ) {
      this.errorMessage = "There was an error retrieving the evaluation rubric. Please try again later."
      this.page = 'error';
    }

    if ( !this.judges.length && !this.applicants.length ){
      this.retrieveAndShowApplicants();
    }

  }

}

customElements.define('ucdlib-awards-evaluation', UcdlibAwardsEvaluation);
