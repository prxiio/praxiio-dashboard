import { APIService } from '../../services/apiService.js';
import { EventBus } from '../../utils/eventBus.js';
import { Store } from '../../store/store.js';

export class PharmacyService {
    constructor() {
        this.api = new APIService();
        this.eventBus = new EventBus();
        this.store = new Store();
        this.drugInteractionCache = new Map();
    }

    async prescribeMedication(prescriptionData) {
        try {
            // Check for drug interactions first
            const interactions = await this.checkDrugInteractions(prescriptionData.medication);
            if (interactions.length > 0) {
                this.eventBus.emit('prescription:interaction:warning', interactions);
            }

            const prescription = await this.api.request('/pharmacy/prescribe', {
                method: 'POST',
                body: JSON.stringify({
                    ...prescriptionData,
                    prescribedBy: 'prxiio',
                    prescriptionTimestamp: '2025-08-27 13:00:24'
                })
            });

            this.eventBus.emit('prescription:created', prescription);
            return prescription;
        } catch (error) {
            this.eventBus.emit('prescription:error', error);
            throw error;
        }
    }

    async checkDrugInteractions(medication) {
        if (this.drugInteractionCache.has(medication.id)) {
            return this.drugInteractionCache.get(medication.id);
        }

        try {
            const interactions = await this.api.request('/pharmacy/interactions', {
                method: 'POST',
                body: JSON.stringify({ medication })
            });

            this.drugInteractionCache.set(medication.id, interactions);
            return interactions;
        } catch (error) {
            this.eventBus.emit('interaction:check:error', error);
            throw error;
        }
    }

    async refillPrescription(prescriptionId) {
        try {
            const refill = await this.api.request(`/pharmacy/prescriptions/${prescriptionId}/refill`, {
                method: 'POST',
                body: JSON.stringify({
                    requestedBy: 'prxiio',
                    requestTimestamp: '2025-08-27 13:00:24'
                })
            });

            this.eventBus.emit('prescription:refilled', refill);
            return refill;
        } catch (error) {
            this.eventBus.emit('prescription:refill:error', error);
            throw error;
        }
    }

    async checkInventory(medicationId) {
        try {
            const inventory = await this.api.request(`/pharmacy/inventory/${medicationId}`);
            return inventory;
        } catch (error) {
            this.eventBus.emit('inventory:check:error', error);
            throw error;
        }
    }

    setupAutomatedRefillChecks() {
        setInterval(async () => {
            try {
                const refillsNeeded = await this.api.request('/pharmacy/refills/check');
                if (refillsNeeded.length > 0) {
                    this.eventBus.emit('refills:needed', refillsNeeded);
                }
            } catch (error) {
                console.error('Automated refill check failed:', error);
            }
        }, 86400000); // Check once per day
    }
}