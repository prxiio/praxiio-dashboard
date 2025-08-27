import { APIService } from '../../services/apiService.js';
import { EventBus } from '../../utils/eventBus.js';
import { Store } from '../../store/store.js';

export class LabIntegrationService {
    constructor() {
        this.api = new APIService();
        this.eventBus = new EventBus();
        this.store = new Store();
        this.lastSync = null;
    }

    async orderLabTest(testData) {
        try {
            const order = await this.api.orderLabTest({
                ...testData,
                orderedBy: 'prxiio',
                orderTimestamp: '2025-08-27 13:00:24'
            });

            this.eventBus.emit('lab:order:created', order);
            return order;
        } catch (error) {
            this.eventBus.emit('lab:order:error', error);
            throw error;
        }
    }

    async getResults(patientId) {
        try {
            const results = await this.api.getLabResults(patientId);
            this.eventBus.emit('lab:results:received', results);
            return results;
        } catch (error) {
            this.eventBus.emit('lab:results:error', error);
            throw error;
        }
    }

    async trackSpecimen(specimenId) {
        try {
            const status = await this.api.request(`/lab/specimens/${specimenId}/track`);
            this.eventBus.emit('specimen:tracked', status);
            return status;
        } catch (error) {
            this.eventBus.emit('specimen:track:error', error);
            throw error;
        }
    }

    setupRealTimeUpdates() {
        // WebSocket connection for real-time lab results
        const ws = new WebSocket('wss://api.praxiio.com/lab/ws');
        
        ws.onmessage = (event) => {
            const update = JSON.parse(event.data);
            switch(update.type) {
                case 'RESULT_READY':
                    this.handleNewResult(update.data);
                    break;
                case 'SPECIMEN_UPDATE':
                    this.handleSpecimenUpdate(update.data);
                    break;
                case 'CRITICAL_VALUE':
                    this.handleCriticalValue(update.data);
                    break;
            }
        };
    }

    handleNewResult(result) {
        this.eventBus.emit('lab:result:new', result);
        if (result.isCritical) {
            this.notifyCriticalResult(result);
        }
    }

    handleSpecimenUpdate(update) {
        this.eventBus.emit('specimen:updated', update);
    }

    handleCriticalValue(value) {
        this.eventBus.emit('lab:critical:value', value);
        this.notifyCriticalResult(value);
    }

    notifyCriticalResult(result) {
        this.store.addNotification({
            type: 'critical',
            title: 'Critical Lab Result',
            message: `Critical value detected for patient ${result.patientId}`,
            timestamp: '2025-08-27 13:00:24'
        });
    }
}