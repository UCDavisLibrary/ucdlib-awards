import { LitElement } from 'lit';
import {render, styles} from "./ucdlib-awards-modal.tpl.js";

export default class UcdlibAwardsModal extends LitElement {

  static get properties() {
    return {
      visible: {type: Boolean},
      contentTitle: {type: String, attribute: "content-title"},
      dismissText: {type: String, attribute: 'dismiss-text'},
      autoWidth: {type: Boolean, attribute: 'auto-width'},
      hideFooter: {type: Boolean, attribute: 'hide-footer'},
      contentWidth: {state: true},
      closeOnConfirm : {type: Boolean}
    };
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.visible = false;
    this.contentTitle = "";
    this.dismissText = "Cancel";
    this.closeOnConfirm = true;
    this.autoWidth = false;
    this.hideFooter = false;
  }

  /**
   * @description Lit lifecycle method. Called when element is going to update
   * @param {Object} props - properties that are changing
   */
  willUpdate(props) {
    if ( props.has('autoWidth') ) {
      if ( this.autoWidth ) {
        this.contentWidth = 'auto';
      } else {
        this.contentWidth = '85%';
      }
    }
  }

  /**
   * @method show
   * @description Shows the modal.
   */
  show() {
    this.visible = true;
  }

  /**
   * @method hide
   * @description Hides the modal.
   */
  hide() {
    this.visible = false;
  }

  /**
   * @method toggle
   * @description Shows/hides the modal.
   */
  toggle() {
    this.visible = !this.visible;
  }

  /**
   * @method _onConfirmClicked
   * @description bound to click event on confirm slot.  Close modal
   * if this.closeOnConfirm is set to true.
   *
   */
  _onConfirmClicked() {
    if( this.closeOnConfirm ) {
      this.hide();
    }
  }

}

customElements.define('ucdlib-awards-modal', UcdlibAwardsModal);
