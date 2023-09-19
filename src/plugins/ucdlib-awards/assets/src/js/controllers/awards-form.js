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

    if ( this.config.previousEntry?.entry_id ) {
      if ( this.config.isApplicationForm ) {
        this.displayError('You may only submit a single application!', true);
        return;
      }
    }
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
