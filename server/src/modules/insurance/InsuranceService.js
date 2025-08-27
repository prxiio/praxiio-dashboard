import { APIService } from '../../services/apiService.js';
import { EventBus } from '../../utils/eventBus.js';

export class InsuranceService {
    constructor() {
        this.api = new APIService();
        this.eventBus = new EventBus();
        this.verificationCache = new Map();
    }

    async verifyInsurance(patientData) {
        const cacheKey = `${patientData.insuranceId}-${patientData.patientId}`;
        
        // Check cache first
        if (this.verificationCache.has(cacheKey)) {
            const cached = this.verificationCache.get(cacheKey);
            if (new Date(cached.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
                return cached.data;
            }
        }

        try {
            const verification = await this.api.verifyInsurance({
                ...patientData,
                verifiedBy: 'prxiio',
                verificationTimestamp: '2025-08-27 13:00:24'
            });

            // Cache the result
            this.verificationCache.set(cacheKey, {
                data: verification,
                timestamp: new Date().toISOString()
            });

            this.eventBus.emit('insurance:verified', verification);
            return verification;
        } catch (error) {
            this.eventBus.emit('insurance:verification:error', error);
            throw error;
        }
    }

    async submitClaim(claimData) {
        try {
            const claim = await this.api.submitClaim({
                ...claimData,
                submittedBy: 'prxiio',
                submissionTimestamp: '2025-08-27 13:00:24'
            });

            this.eventBus.emit('claim:submitted', claim);
            return claim;
        } catch (error) {
            this.eventBus.emit('claim:submission:error', error);
            throw error;
        }
    }

    async checkClaimStatus(claimId) {
        try {
            const status = await this.api.request(`/insurance/claims/${claimId}/status`);
            this.eventBus.emit('claim:status:updated', status);
            return status;
        } catch (error) {
            this.eventBus.emit('claim:status:error', error);
            throw error;
        }
    }

    async getPriorAuthorizations(patientId) {
        try {
            const authorizations = await this.api.request(`/insurance/prior-auth/${patientId}`);
            return authorizations;
        } catch (error) {
            this.eventBus.emit('prior-auth:error', error);
            throw error;
        }
    }

    async requestPriorAuthorization(authData) {
        try {
            const authorization = await this.api.request('/insurance/prior-auth', {
                method: 'POST',
                body: JSON.stringify({
                    ...authData,
                    requestedBy: 'prxiio',
                    requestTimestamp: '2025-08-27 13:00:24'
                })
            });

            this.eventBus.emit('prior-auth:requested', authorization);
            return authorization;
        } catch (error) {
            this.eventBus.emit('prior-auth:request:error', error);
            throw error;
        }
    }
}