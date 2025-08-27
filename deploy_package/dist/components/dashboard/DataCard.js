"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataCard = void 0;
const PraxiioComponent_js_1 = require("../base/PraxiioComponent.js");
class DataCard extends PraxiioComponent_js_1.PraxiioComponent {
    static get observedAttributes() {
        return ['title', 'value', 'trend', 'icon'];
    }
    constructor() {
        super();
        this._state = {
            title: '',
            value: '',
            trend: '',
            icon: ''
        };
    }
    render() {
        const { title, value, trend, icon } = this._state;
        this.shadowRoot.innerHTML = `
            <style>
                ${this.addBaseStyles()}
                .card {
                    background-color: #374151;
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 1.5rem;
                    transition: transform 0.2s ease;
                }
                .card:hover {
                    transform: translateY(-2px);
                }
                .title {
                    color: var(--text-light);
                    font-size: 0.875rem;
                    margin-bottom: 0.5rem;
                }
                .value {
                    color: white;
                    font-size: 1.875rem;
                    font-weight: bold;
                    margin-bottom: 0.25rem;
                }
                .trend {
                    font-size: 0.75rem;
                }
                .trend.positive { color: #10B981; }
                .trend.negative { color: #EF4444; }
            </style>
            
            <div class="card">
                <div class="title">${title}</div>
                <div class="value">${value}</div>
                <div class="trend ${trend.startsWith('+') ? 'positive' : 'negative'}">
                    ${trend}
                </div>
            </div>
        `;
    }
    attributeChangedCallback(name, oldValue, newValue) {
        this._state[name] = newValue;
        this.render();
    }
}
exports.DataCard = DataCard;
customElements.define('praxiio-data-card', DataCard);
