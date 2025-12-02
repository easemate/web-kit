export class RadioOption extends HTMLElement {
  connectedCallback(): void {
    this.hidden = true;
    if (!this.hasAttribute('slot')) {
      this.setAttribute('slot', 'option');
    }
  }
}

if (!customElements.get('radio-option')) {
  customElements.define('radio-option', RadioOption);
}
