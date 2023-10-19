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
      return;
    }
    this.nonce = hostProps.wpAjax.nonce;
    this.url = hostProps.wpAjax.url;
    this.action = hostProps.wpAjax.action;
    this.responseTemplate = hostProps.wpAjax.responseTemplate;
  }

  async request(subAction, data){
    if ( !this.nonce || !subAction || this.requestInProgress[subAction] ) {
      return;
    }
    this.requestInProgress[subAction] = true;

    const body = {};
    if ( data instanceof FormData ) {
      data.append('action', this.action);
      data.append('subAction', subAction);
      data.append('_ajax_nonce', this.nonce);
    } else {
      body.action = this.action;
      body.subAction = subAction;
      body.data = JSON.stringify(data);
      body._ajax_nonce = this.nonce;
    }

    let responseData;
    let response;
    try {
      const args = {
        method: 'POST'
      };
      if ( Object.keys(body).length ) {
        args.headers = {
          'Content-Type': 'application/x-www-form-urlencoded'
        };
        args.body = new URLSearchParams(body).toString();
      } else {
        args.body = data;
      }

      response = await fetch(this.url, args);

      if ( !response.ok ) {
        throw new Error(response.statusText);
      }

      responseData = await response.json();
    } catch (error) {
      console.error('Error fetching data', error);
      const template = {...this.responseTemplate};
      if ( response?.status == 403 ) {
        template.messages = ['You either do not have permission to perform this action, or your session has expired. Please refresh the page and try again.'];
      } else {
        template.messages = ['An unknown error occurred. Please try again.'];
      }
      responseData = template;
    }

    this.requestInProgress[subAction] = false;
    return responseData;
  }
}
