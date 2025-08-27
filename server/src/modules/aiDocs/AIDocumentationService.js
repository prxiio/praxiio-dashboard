import { APIService } from '../../services/apiService.js';
import { EventBus } from '../../utils/eventBus.js';

export class AIDocumentationService {
    constructor() {
        this.api = new APIService();
        this.eventBus = new EventBus();
    }

    async generateDocumentation(context) {
        try {
            const documentation = await this.api.generateDocumentation(context);
            this.eventBus.emit('documentation:generated', documentation);
            return documentation;
        } catch (error) {
            this.eventBus.emit('documentation:error', error);
            throw error;
        }
    }

    async analyzeMedicalRecord(recordId) {
        try {
            const analysis = await this.api.analyzePatientData(recordId);
            this.eventBus.emit('record:analyzed', analysis);
            return analysis;
        } catch (error) {
            this.eventBus.emit('record:analysis:error', error);
            throw error;
        }
    }

    async generateSummary(patientId) {
        try {
            const summary = await this.api.generatePatientSummary(patientId);
            this.eventBus.emit('summary:generated', summary);
            return summary;
        } catch (error) {
            this.eventBus.emit('summary:error', error);
            throw error;
        }
    }
}