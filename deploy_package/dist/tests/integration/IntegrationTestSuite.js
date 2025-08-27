"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationTestSuite = void 0;
const AppStore_1 = require("../../store/AppStore");
const apiService_1 = require("../../services/apiService");
const AIService_1 = require("../../services/ai/AIService");
const SecurityService_1 = require("../../security/SecurityService");
class IntegrationTestSuite {
    constructor() {
        this.timestamp = '2025-08-27 13:09:59';
        this.user = 'prxiio';
        this.store = new AppStore_1.AppStore();
        this.api = new apiService_1.APIService();
        this.ai = new AIService_1.AIService();
        this.security = new SecurityService_1.SecurityService();
    }
    async runAllTests() {
        console.log(`Starting Integration Tests - ${this.timestamp}`);
        try {
            await this.testAuthFlow();
            await this.testPatientWorkflow();
            await this.testAIIntegration();
            await this.testDataSynchronization();
            await this.testSecurityFeatures();
            console.log('All integration tests passed successfully');
        }
        catch (error) {
            console.error('Integration tests failed:', error);
            throw error;
        }
    }
    async testAuthFlow() {
        // Test complete authentication flow
        const credentials = {
            username: 'test_user',
            password: 'test_password'
        };
        const authResult = await this.security.authenticate(credentials);
        assert(authResult.token, 'Authentication should return a token');
        // Test token validation
        const validationResult = await this.api.request('/auth/validate');
        assert(validationResult.valid, 'Token should be valid');
        // Test permission checks
        const hasPermission = this.security.verifyPermissions(['READ_PATIENTS']);
        assert(hasPermission, 'User should have READ_PATIENTS permission');
    }
    async testPatientWorkflow() {
        // Test patient creation
        const patientData = {
            name: 'Test Patient',
            dateOfBirth: '1990-01-01',
            insurance: 'Test Insurance',
            createdBy: this.user,
            timestamp: this.timestamp
        };
        const patient = await this.api.createPatient(patientData);
        assert(patient.id, 'Patient should be created with an ID');
        // Test appointment scheduling
        const appointmentData = {
            patientId: patient.id,
            date: '2025-09-01',
            type: 'Initial Consultation',
            scheduledBy: this.user
        };
        const appointment = await this.api.scheduleAppointment(appointmentData);
        assert(appointment.id, 'Appointment should be created');
        // Test medical record creation
        const recordData = {
            patientId: patient.id,
            notes: 'Initial consultation notes',
            diagnosis: 'Test diagnosis',
            createdBy: this.user
        };
        const record = await this.api.createMedicalRecord(recordData);
        assert(record.id, 'Medical record should be created');
    }
    async testAIIntegration() {
        // Test AI documentation generation
        const context = {
            patientId: 'TEST001',
            visitType: 'Follow-up',
            symptoms: ['headache', 'fever'],
            timestamp: this.timestamp
        };
        const documentation = await this.ai.generateDocumentation(context);
        assert(documentation.content, 'AI should generate documentation');
        // Test medical analysis
        const analysisResult = await this.ai.analyzeMedicalData('TEST001');
        assert(analysisResult.insights, 'AI should provide medical insights');
        // Test prediction accuracy
        const prediction = await this.ai.predictReadmissionRisk({
            patientId: 'TEST001',
            age: 65,
            conditions: ['diabetes', 'hypertension']
        });
        assert(prediction >= 0 && prediction <= 1, 'Risk prediction should be between 0 and 1');
    }
    async testDataSynchronization() {
        // Test real-time updates
        const updates = [];
        const unsubscribe = this.store.subscribe(state => {
            updates.push(state);
        });
        await this.store.dispatch({
            type: 'UPDATE_PATIENT',
            payload: {
                id: 'TEST001',
                status: 'UPDATED',
                timestamp: this.timestamp
            }
        });
        assert(updates.length > 0, 'Store should emit updates');
        unsubscribe();
        // Test offline data persistence
        localStorage.setItem('cached_data', JSON.stringify({
            timestamp: this.timestamp,
            data: { key: 'value' }
        }));
        const cached = JSON.parse(localStorage.getItem('cached_data'));
        assert(cached.timestamp === this.timestamp, 'Data should be cached with timestamp');
    }
    async testSecurityFeatures() {
        // Test data encryption
        const sensitiveData = {
            patientId: 'TEST001',
            ssn: '123-45-6789'
        };
        const encrypted = this.security.encryptData(sensitiveData);
        assert(encrypted !== JSON.stringify(sensitiveData), 'Data should be encrypted');
        const decrypted = this.security.decryptData(encrypted);
        assert(decrypted.patientId === sensitiveData.patientId, 'Data should be correctly decrypted');
        // Test XSS prevention
        const userInput = '<script>alert("xss")</script>';
        const sanitized = this.security.sanitizeInput(userInput);
        assert(!sanitized.includes('<script>'), 'Input should be sanitized');
    }
}
exports.IntegrationTestSuite = IntegrationTestSuite;
function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}
