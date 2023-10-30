import dateTimeUtils from "../utils/datetime.js";

/**
 * @description Controller for altering a forminator form DOM element in a public page.
 */
export default class AwardsForm {
  constructor(){
    if ( window.awardFormConfig ){
      this.config = window.awardFormConfig;
      this.form = document.querySelector(`#forminator-module-${this.config.formId}`);
      if ( this.form ){
        this.init();
      } else {
        console.warn(`Could not find form with id ${this.config.formId}. Cannot initialize awards form.`);
      }

    } else {
      console.warn('awardFormConfig not defined. Cannot initialize awards form.');
    }
  }

  init(){
    console.log(this.config);
    if ( this.config.formWindowStatus !== 'active' ){
      this.disableSubmitButton();
      this.displayWindowClosedMessage();
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
    const submitButton = this.form.querySelector('button.forminator-button-submit');
    if ( !submitButton ) {
      console.warn('Could not find submit button. Cannot disable submit button.');
      return;
    }
    submitButton.disabled = true;
  }

  displayWindowClosedMessage(){
    if ( this.config.formWindowStatus === 'upcoming' ){
      const date = dateTimeUtils.mysqlToLocaleString(this.config.formWindowStart);
      this.displayError(`Sorry, the application${this.config.isSupportForm ? ' support ' : ' '}window is currently closed. It will open on ${date}.`);
    } else if ( this.config.formWindowStatus === 'past' ){
      const date = dateTimeUtils.mysqlToLocaleString(this.config.formWindowEnd);
      this.displayError(`Sorry, the application${this.config.isSupportForm ? ' support ' : ' '}window is currently closed. It closed on ${date}.`);
    } else {
      this.displayError('This form is currently disabled.');
      console.warn('Could not determine form window status.  Cannot display window closed message.');
    }
  }

  displayError( message, disableSubmitButton ){
    const errorContainer = this.form.querySelector('.forminator-response-message.forminator-error');
    if ( !errorContainer ) {
      console.warn('Could not find error container. Cannot display error.');
      return;
    }
    errorContainer.innerHTML = message;
    if ( disableSubmitButton ){
      this.disableSubmitButton();
    }
  }

}
