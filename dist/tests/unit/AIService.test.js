"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AIService_1 = require("../../services/ai/AIService");
describe('AIService', () => {
    let aiService;
    beforeEach(() => {
        aiService = new AIService_1.AIService();
    });
    test('analyzeMedicalData returns valid analysis', async () => {
        const analysis = await aiService.analyzeMedicalData('P001');
        expect(analysis).toHaveProperty('patientId', 'P001');
        expect(analysis).toHaveProperty('timestamp', '2025-08-27 13:04:33');
        expect(analysis).toHaveProperty('analyst', 'prxiio');
        expect(analysis.results).toBeDefined();
    });
    test('predictReadmissionRisk returns valid probability', async () => {
        const risk = await aiService.predictReadmissionRisk({
            age: 65,
            previousAdmissions: 2,
            chronicConditions: ['diabetes', 'hypertension']
        });
        expect(risk).toBeGreaterThanOrEqual(0);
        expect(risk).toBeLessThanOrEqual(1);
    });
});
