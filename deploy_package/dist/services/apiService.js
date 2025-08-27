"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIService = void 0;
// Core API service for handling all backend communications
const config_js_1 = require("../config/config.js");
class APIService {
    constructor() {
        this.baseURL = '/api/v1';
        this.headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'X-User-Login': 'prxiio',
            'X-Client-Timestamp': '2025-08-27 12:59:40'
        };
    }
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers: { ...this.headers, ...options.headers }
            });
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('API Request Failed:', error);
            throw error;
        }
    }
    // Patient endpoints
    async getPatients(filters = {}) {
        const queryString = new URLSearchParams(filters).toString();
        return this.request(`/patients?${queryString}`);
    }
    async getPatientById(id) {
        return this.request(`/patients/${id}`);
    }
    async createPatient(patientData) {
        return this.request('/patients', {
            method: 'POST',
            body: JSON.stringify(patientData)
        });
    }
    // Appointment endpoints
    async getAppointments(filters = {}) {
        const queryString = new URLSearchParams(filters).toString();
        return this.request(`/appointments?${queryString}`);
    }
    async scheduleAppointment(appointmentData) {
        return this.request('/appointments', {
            method: 'POST',
            body: JSON.stringify(appointmentData)
        });
    }
    // AI Documentation endpoints
    async generateDocumentation(context) {
        return this.request('/ai/documentation', {
            method: 'POST',
            body: JSON.stringify(context)
        });
    }
    async analyzePatientData(patientId) {
        return this.request(`/ai/analyze/${patientId}`);
    }
    // Lab Integration endpoints
    async getLabResults(patientId) {
        return this.request(`/lab/results/${patientId}`);
    }
    async orderLabTest(testData) {
        return this.request('/lab/orders', {
            method: 'POST',
            body: JSON.stringify(testData)
        });
    }
    // Insurance verification endpoints
    async verifyInsurance(patientData) {
        return this.request('/insurance/verify', {
            method: 'POST',
            body: JSON.stringify(patientData)
        });
    }
    async submitClaim(claimData) {
        return this.request('/insurance/claims', {
            method: 'POST',
            body: JSON.stringify(claimData)
        });
    }
    // Telemedicine endpoints
    async initializeSession(appointmentId) {
        return this.request(`/telemedicine/sessions/${appointmentId}/initialize`);
    }
    async endSession(sessionId) {
        return this.request(`/telemedicine/sessions/${sessionId}/end`, {
            method: 'POST'
        });
    }
}
exports.APIService = APIService;
