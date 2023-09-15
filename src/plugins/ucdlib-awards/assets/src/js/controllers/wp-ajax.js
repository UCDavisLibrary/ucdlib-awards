/**
 * @description Lit element controller for interacting with the wp-ajax endpoint.
 */
export default class wpAjax {
  constructor(host){
    (this.host = host).addController(this);
    this.nonce = '';
    this.url = '';
    this.action = '';
    this.responseTemplate = {};
    this.requestInProgress = {};
  }

  hostUpdated(){
    if ( this.nonce ) return;
    const script = this.host.querySelector('script[type="application/json"]');
    if ( !script ) return;
    let hostProps = {};
    try {
      hostProps = JSON.parse(script.text);
    } catch (error) {
      console.error('Error parsing JSON script', error);
    }
    if ( !hostProps.wpAjax ){
      console.error('Missing wpAjax props');
      return;
    }
    this.nonce = hostProps.wpAjax.nonce;
    this.url = hostProps.wpAjax.url;
    this.action = hostProps.wpAjax.action;
    this.responseTemplate = hostProps.wpAjax.responseTemplate;
  }

  async request(subAction, data){
    if ( !this.nonce || !subAction || this.requestInProgress[subAction] ) return;
    this.requestInProgress[subAction] = true;
    const body = {
      action: this.action,
      subAction,
      data: JSON.stringify(data),
      _ajax_nonce: this.nonce
    }

    let responseData;
    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(body).toString(),
      });

      if ( !response.ok ) {
        throw new Error(response.statusText);
      }

      responseData = await response.json();
    } catch (error) {
      console.error('Error fetching data', error);
      const template = {...this.responseTemplate};
      template.messages = ['An unknown error occurred. Please try again.'];
      responseData = template;
    }

    this.requestInProgress[subAction] = false;
    return responseData;
  }
}
