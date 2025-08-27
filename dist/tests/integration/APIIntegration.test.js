"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apiService_1 = require("../../services/apiService");
const setup_1 = require("../setup");
describe('API Integration', () => {
    const api = new apiService_1.APIService();
    test('complete patient workflow', async () => {
        // Create patient
        const patient = await api.createPatient({
            name: 'Test Patient',
            dateOfBirth: '1990-01-01',
            createdBy: 'prxiio',
            timestamp: '2025-08-27 13:04:33'
        });
        expect(patient.id).toBeDefined();
        // Schedule appointment
        const appointment = await api.scheduleAppointment({
            patientId: patient.id,
            date: '2025-09-01',
            type: 'Initial Consultation'
        });
        expect(appointment.id).toBeDefined();
        // Generate AI insights
        const insights = await setup_1.testSetup.ai.analyzeMedicalData(patient.id);
        expect(insights.results).toBeDefined();
    });
});
