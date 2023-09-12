import { LitElement } from 'lit';
import {render, styles} from "./ucdlib-awards-page.tpl.js";
import wpAjaxController from "../../controllers/wp-ajax.js";

import { MutationObserverController, WaitController } from '@ucd-lib/theme-elements/utils/controllers/index.js';

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
      isCyclesAdminPage: {state: true},
      selectedCycle: {state: true},
      activeCycle: {state: true},
      toastState: {state: true}
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
    this.selectedCycle = {};
    this.activeCycle = {};
    this.toastState = {};

    this.mutationObserver = new MutationObserverController(this);
    this.wait = new WaitController(this);
    this.wpAjax = new wpAjaxController(this);
    this.notAuthorized = false;
  }

  firstUpdated(){
    this._onChildListMutation();
  }

  willUpdate(props){

    if ( !this.isAdminPage ){
      this.hideCycleNotification = true;
    } else if ( this.isCyclesAdminPage ){
      this.hideCycleNotification = true;
    } else if ( this.cycles.length) {
      this.hideCycleNotification = true;
    } else {
      this.hideCycleNotification = false;
    }

    if ( props.has('cycles') ){
      this.hasCycles = this.cycles.length > 0;

      let selectedCycleSet = false;
      this.cycles.forEach(cycle => {
        if ( cycle.is_active && parseInt(cycle.is_active) ) {
          this.activeCycle = cycle;
        }

        if ( this.previousSelectedCycleId ){
          if ( this.previousSelectedCycleId === cycle.cycle_id ) {
            this.selectedCycle = cycle;
            selectedCycleSet = true;
          }
        } else {
          const cycleId = this.getUrlParam('cycle');
          if ( cycleId && cycleId === cycle.cycle_id ) {
            this.selectedCycle = cycle;
            selectedCycleSet = true;
          }
        }

      });
      if ( !selectedCycleSet ) this.selectedCycle = {...this.activeCycle};
      this.updateAdminLinks();
      this.previousSelectedCycleId = null;
    }
  }

  /**
   * @description Updates the admin links in the wp sidebar to include the selected cycle (if specified)
   * @returns
   */
  updateAdminLinks(){
    if ( !this.isAdminPage ) return;
    const cycleId = this.getUrlParam('cycle') || this.previousSelectedCycleId;
    if ( !cycleId ) return;
    const menuParent = document.querySelector('.wp-has-current-submenu');
    if ( !menuParent ) return;
    const links = menuParent.querySelectorAll('a');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if ( !href ) return;
      const path = href.split('?')[0];
      const searchParams = new URLSearchParams(href.split('?')[1]);
      searchParams.set('cycle', cycleId);
      link.setAttribute('href', `${path}?${searchParams.toString()}`);
    }
    );
  }

  /**
   * @description Shows then hides app toast message at bottom of page
   * @returns
   */
  async showToast(){
    if ( !this.toastState.message ) return;
    if ( this.toastState.timeout ) return;
    if ( this.toastState.scrollToTop ) {
      window.scrollTo({top: 0, behavior: 'smooth'})
    };
    await this.wait.wait(250);
    const eleRect = this.getBoundingClientRect();
    const maxWidth = eleRect.width < 500 ? `calc(${eleRect.width}px - 6rem)` : '500px';
    const initialStyle = {
      display: 'flex',
      maxWidth,
      left: `calc(${eleRect.left}px + 1rem)`,
      opacity: 0,
      bottom: '-500px'
    }

    this.toastState.style = initialStyle;
    await this.wait.waitForUpdate();
    await this.wait.waitForFrames(3);
    let bottom;
    if ( eleRect.bottom < window.innerHeight ) {
      bottom = `calc(${window.innerHeight - eleRect.bottom}px + 1rem)`;
    } else {
      bottom = '1rem';
    }
    this.toastState.style = {
      ...initialStyle,
      opacity: 1,
      bottom
    }
    await this.wait.waitForUpdate();
    this.toastState.timeout = setTimeout(() => {
      this.hideToast();
    }, 5000);

  }

  /**
   * @description Hides the toast message
   */
  async hideToast(){
    this.toastState.style = {
      ...this.toastState.style,
      opacity: 0,
      bottom: '-500px'
    }
    await this.wait.waitForUpdate();
    await this.wait.wait(500);
    this.toastState = {};
    await this.wait.waitForUpdate();
  }

  /**
   * @description Attached to toast-request listener on main content element
   * @param {*} e
   */
  _onToastRequest(e){
    const message = e.detail.message || '';
    const scrollToTop = e.detail.scrollToTop || false;
    this.toastState = {
      message,
      scrollToTop
    }
    const type = e.detail.type || 'info';
    if ( type === 'info' ){
      this.toastState.icon = 'ucd-public:fa-circle-info';
      this.toastState.color = 'secondary';
    } else if ( type === 'success' ) {
      this.toastState.icon = 'ucd-public:fa-circle-check';
      this.toastState.color = 'farmers-market';
    } else if ( type === 'error' ) {
      this.toastState.icon = 'ucd-public:fa-circle-exclamation';
      this.toastState.color = 'double-decker';
    }

    this.showToast();

  }

  async refreshCyclesArray(){
    this.previousSelectedCycleId = this.selectedCycle.cycle_id;
    const response = await this.wpAjax.request('getCycles');
    if ( !response.success ) {
      console.error('Error fetching cycles', response);
      return;
    }
    this.cycles = response.data.cycles;
  }

  _onCycleUpdate(){
    this.refreshCyclesArray();
  }

  _onCycleSelect(e){
    console.log('cycle select', e.target.value);
    const cycleId = e.target.value;
    if ( !cycleId || cycleId == this.selectedCycle.cycle_id ) return;
    const params = new URLSearchParams(window.location.search);
    params.set('cycle', cycleId);
    window.location.href = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
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

  getUrlParam(param){
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
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
