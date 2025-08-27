// Base component class for all Praxiio UI components
export class PraxiioComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._state = {};
        this.timestamp = '2025-08-27 13:01:19';
        this.currentUser = 'prxiio';
    }

    setState(newState) {
        this._state = { ...this._state, ...newState };
        this.render();
    }

    getState() {
        return this._state;
    }

    connectedCallback() {
        this.render();
    }

    render() {
        // Implemented by child classes
    }

    addBaseStyles() {
        return `
            :host {
                --primary-color: #E87461;
                --secondary-color: #4B5563;
                --background-dark: #111827;
                --text-light: #E5E7EB;
                --border-color: #4B5563;
                font-family: 'Inter', sans-serif;
            }
        `;
    }
}