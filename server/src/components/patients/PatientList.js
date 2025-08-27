import { PraxiioComponent } from '../base/PraxiioComponent.js';

export class PatientList extends PraxiioComponent {
    constructor() {
        super();
        this._state = {
            patients: [],
            loading: false,
            error: null
        };
    }

    render() {
        const { patients, loading, error } = this._state;

        this.shadowRoot.innerHTML = `
            <style>
                ${this.addBaseStyles()}
                .patient-list {
                    border-radius: 8px;
                    overflow: hidden;
                }
                .patient-row {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1fr auto;
                    padding: 1rem;
                    border-bottom: 1px solid var(--border-color);
                    background: #374151;
                }
                .patient-row:hover {
                    background: #4B5563;
                }
                .status-badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                .status-active { background: #065F46; color: #10B981; }
                .status-pending { background: #92400E; color: #F59E0B; }
            </style>
            
            ${loading ? '<div class="loading">Loading...</div>' : ''}
            ${error ? `<div class="error">${error}</div>` : ''}
            
            <div class="patient-list">
                ${patients.map(patient => `
                    <div class="patient-row">
                        <div class="patient-name">${patient.name}</div>
                        <div class="patient-id">${patient.id}</div>
                        <div class="patient-contact">${patient.phone}</div>
                        <div class="patient-department">${patient.department}</div>
                        <div class="status-badge status-${patient.status.toLowerCase()}">
                            ${patient.status}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        this.addEventListeners();
    }

    addEventListeners() {
        this.shadowRoot.querySelectorAll('.patient-row').forEach((row, index) => {
            row.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('patient-selected', {
                    detail: this._state.patients[index]
                }));
            });
        });
    }

    setPatients(patients) {
        this.setState({ patients, loading: false });
    }

    setLoading(loading) {
        this.setState({ loading });
    }

    setError(error) {
        this.setState({ error, loading: false });
    }
}

customElements.define('praxiio-patient-list', PatientList);