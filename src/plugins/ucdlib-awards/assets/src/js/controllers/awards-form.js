import dateTimeUtils from "../utils/datetime.js";
import { getLogger } from '@ucd-lib/cork-app-utils';

/**
 * @description Controller for altering a forminator form DOM element in a public page.
 */
export default class AwardsForm {
  constructor(){
    this.logger = getLogger('awards-form');
    if ( window.awardFormConfig ){
      this.config = window.awardFormConfig;
      if ( this.config.isPastForm ){
        this.form = document.querySelector(`form.forminator-custom-form`);
        if ( this.form ){
          this.initPastForm();
        } else {
          this.logger.error(`Could not find past form. Cannot initialize awards form.`);
        }
      } else {
        this.form = document.querySelector(`#forminator-module-${this.config.formId}`);
        if ( this.form ){
          this.init();
        } else {
          this.logger.error(`Could not find form with id ${this.config.formId}. Cannot initialize awards form.`);
        }
      }

    } else {
      this.logger.error('awardFormConfig not defined. Cannot initialize awards form.');
    }
  }

  initPastForm(){
    this.logger.warn('This form is from a non-active cycle. It will not be displayed. The page should be updated to display the current cycle form instead.');
    this.hideAllFormFields();
    this.displayError('The form is no longer active.', true);

  }

  init(){
    if ( this.config.formWindowStatus !== 'active' ){
      this.disableSubmitButton();
      this.displayWindowClosedMessage();

      this.hideAllFormFields()

      // try hide again in case forminator js re-displays fields
      setTimeout(() => this.hideAllFormFields(), 100);
      return;
    }

    if ( this.config.previousEntry?.entry_id && this.config.isApplicationForm ) {
      this.displayError('You may only submit a single application!', true);
      return;
    }

    if ( this.config.isSupportForm ){
      this.addApplicantsSelect();
    }
  }

  /**
   * @description Adds a select element to the form for selecting an applicant if user is a registered supporter.
   */
  addApplicantsSelect(){
    if ( !this.config.isSupportForm ) return;
    const applicants = this.config.supporterApplicants;
    if ( !applicants || !applicants.length ) {
      this.displayError('You are not a registered supporter for any applicants!', true);
      return;
    }
    const html = `
      <div class="forminator-col forminator-col-12 ">
        <div class="forminator-field">
          <label for="ucdlib-awards--supporter-applicant" class="forminator-label">Applicant</label>
          <select id="ucdlib-awards--supporter-applicant" class="forminator-select--field forminator-select2" name="ucdlib-awards--supporter-applicant">
            ${applicants.map( applicant => `<option value="${applicant.id}">${applicant.name}</option>` ).join('')}
          </select>
        </div>
      </div>
    `;
    const select = document.createElement('div');
    select.innerHTML = html;
    select.classList.add('forminator-row');
    this.form.insertBefore(select, this.form.querySelector('.forminator-row'));
  }

  disableSubmitButton(){
    setTimeout(() => {
      const submitButton = this.form.querySelector('button.forminator-button-submit');
      const nextButton = this.form.querySelector('button.forminator-button-next');
      if ( !submitButton && !nextButton ) {
        console.warn('Could not find submit or next button. Cannot disable.');
        return;
      }
      let button = submitButton;
      if ( nextButton ) {
        button = nextButton;
      }
      button.disabled = true;
      button.style.opacity = '0.5';
      button.style.pointerEvents = 'none';
    }, 200);

  }

  hideAllFormFields(){
    const fieldRows = this.form.querySelectorAll('.forminator-row');
    if ( !fieldRows.length ){
      console.warn('Could not find any form fields. Cannot hide form fields.');
      return;
    }
    fieldRows.forEach(fieldRow => fieldRow.style.display = 'none');

    const pagination = this.form.querySelector('.forminator-pagination-steps');
    if ( pagination ) pagination.style.display = 'none';

    const paginationFooter = this.form.querySelector('.forminator-pagination-footer');
    if ( paginationFooter ) paginationFooter.style.display = 'none';
  }

  displayWindowClosedMessage(){
    if ( this.config.formWindowStatus === 'upcoming' ){
      const date = dateTimeUtils.mysqlToDateString(this.config.formWindowStart, true);
      this.displayError(`Sorry, the application${this.config.isSupportForm ? ' support ' : ' '}window is currently closed. It will open on ${date}.`);
    } else if ( this.config.formWindowStatus === 'past' ){
      const date = dateTimeUtils.mysqlToDateString(this.config.formWindowEnd, true);
      this.displayError(`Sorry, the application${this.config.isSupportForm ? ' support ' : ' '}window is currently closed. It closed on ${date}.`);
    } else {
      this.displayError('This form is currently disabled.');
      this.logger.error('Could not determine form window status.  Cannot display window closed message.');
    }
  }

  displayError( message, disableSubmitButton ){
    const errorContainer = this.form.querySelector('.forminator-response-message.forminator-error');
    if ( !errorContainer ) {
      this.logger.error('Could not find error container. Cannot display error.');
      return;
    }
    errorContainer.innerHTML = message;
    if ( disableSubmitButton ){
      this.disableSubmitButton();
    }
  }

}
