export class Tab extends HTMLElement {
  connectedCallback() {
    this.hidden = true;
  }
}

if (!customElements.get('tab-item')) {
  customElements.define('tab-item', Tab);
}
