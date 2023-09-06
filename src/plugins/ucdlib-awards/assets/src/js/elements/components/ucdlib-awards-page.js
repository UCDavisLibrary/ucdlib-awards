import { LitElement } from 'lit';
import {render, styles} from "./ucdlib-awards-page.tpl.js";

import { MutationObserverController } from '@ucd-lib/theme-elements/utils/controllers/index.js';

/**
 * @class UcdlibAwardsPage
 * @description Base element for all pages in the app. This class loads all the styles, and does some basic controller actions.
 */
export default class UcdlibAwardsPage extends LitElement {

  static get properties() {
    return {
      pageTitle: {type: String},
      siteLogo: {type: String},
      cycles: {type: Array},
      cyclesLink: {type: String},
      isAdminPage: {type: Boolean},
      notAuthorized: {state: true},
      propsParsed: {state: true},
      hideCycleNotification: {state: true},
      isCyclesAdminPage: {state: true}
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.pageTitle = '';
    this.siteLogo = '';
    this.cycles = [];
    this.propsParsed = false;
    this.isAdminPage = false;
    this.cyclesLink = '';
    this.isCyclesAdminPage = false;

    this.mutationObserver = new MutationObserverController(this);
    this.notAuthorized = false;
  }

  firstUpdated(){
    this._onChildListMutation();
  }

  willUpdate(){

    if ( !this.isAdminPage ){
      this.hideCycleNotification = true;
    } else if ( this.isCyclesAdminPage ){
      this.hideCycleNotification = true;
    } else if ( this.cycles.length) {
      this.hideCycleNotification = true;
    } else {
      this.hideCycleNotification = false;
    }
  }

  /**
   * @description Called when Light DOM children are added/removed from the element.
   */
  _onChildListMutation(){
    const content = this.renderRoot.querySelector('#content');
    if ( !content ) return;

    // move any children into the shadow dom
    Array.from(this.children).forEach(child => {

      if ( child.nodeName === 'SCRIPT' && child.type === 'application/json' ) {
        this._parsePropsScript(child);
        this.propsParsed = true;
        return;
      }

      if ( child.nodeName === 'UCDLIB-AWARDS-ADMIN-CYCLES' ) {
        this.isCyclesAdminPage = true;
      }

      content.appendChild(child);
      if ( child.nodeName === 'UCDLIB-AWARDS-FORBIDDEN' ) {
        this.notAuthorized = true;
      } else {
        child.style.display = 'none';
      }
    });

    // Show content if authorized and if cycles exist
    if ( this.isAdminPage ){
      if ( !this.notAuthorized && (this.cycles.length > 0 || this.isCyclesAdminPage)){
        Array.from(content.children).forEach(child => {
          child.style.display = 'block';
        });
      }
    } else {
      if ( !this.notAuthorized ){
        Array.from(content.children).forEach(child => {
          child.style.display = 'block';
        });
      }
    }

  }

  _parsePropsScript(script){
    let data = {};
    try {
      data = JSON.parse(script.text);
    } catch(e) {
      console.error('Error parsing JSON script', e);
    }
    if ( data.pageTitle ) this.pageTitle = data.pageTitle;
    if ( data.siteLogo ) this.siteLogo = data.siteLogo;
    if ( data.cycles ) this.cycles = data.cycles;
    if ( data.isAdminPage ) this.isAdminPage = data.isAdminPage;
    if ( data.cyclesLink ) this.cyclesLink = data.cyclesLink;
  }

}

customElements.define('ucdlib-awards-page', UcdlibAwardsPage);
