"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIDocumentationService = void 0;
const apiService_js_1 = require("../../services/apiService.js");
const eventBus_js_1 = require("../../utils/eventBus.js");
class AIDocumentationService {
    constructor() {
        this.api = new apiService_js_1.APIService();
        this.eventBus = new eventBus_js_1.EventBus();
    }
    async generateDocumentation(context) {
        try {
            const documentation = await this.api.generateDocumentation(context);
            this.eventBus.emit('documentation:generated', documentation);
            return documentation;
        }
        catch (error) {
            this.eventBus.emit('documentation:error', error);
            throw error;
        }
    }
    async analyzeMedicalRecord(recordId) {
        try {
            const analysis = await this.api.analyzePatientData(recordId);
            this.eventBus.emit('record:analyzed', analysis);
            return analysis;
        }
        catch (error) {
            this.eventBus.emit('record:analysis:error', error);
            throw error;
        }
    }
    async generateSummary(patientId) {
        try {
            const summary = await this.api.generatePatientSummary(patientId);
            this.eventBus.emit('summary:generated', summary);
            return summary;
        }
        catch (error) {
            this.eventBus.emit('summary:error', error);
            throw error;
        }
    }
}
exports.AIDocumentationService = AIDocumentationService;
