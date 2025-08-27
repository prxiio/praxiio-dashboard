"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const AppStore_1 = require("../store/AppStore");
const MonitoringService_1 = require("../monitoring/MonitoringService");
class ErrorHandler {
    constructor() {
        this.timestamp = '2025-08-27 13:07:01';
        this.user = 'prxiio';
        this.store = new AppStore_1.AppStore();
        this.monitoring = new MonitoringService_1.MonitoringService();
        this.initializeHandlers();
    }
    static getInstance() {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }
    initializeHandlers() {
        window.onerror = (msg, url, line, col, error) => {
            this.handleError({
                type: 'runtime',
                message: msg,
                source: url,
                line,
                column: col,
                error,
                timestamp: this.timestamp,
                user: this.user
            });
            return false;
        };
        window.onunhandledrejection = (event) => {
            this.handleError({
                type: 'promise',
                message: event.reason,
                timestamp: this.timestamp,
                user: this.user
            });
        };
    }
    async handleError(error) {
        const errorDetails = {
            ...error,
            browserInfo: this.getBrowserInfo(),
            sessionInfo: this.getSessionInfo(),
            timestamp: this.timestamp,
            user: this.user
        };
        // Log to monitoring service
        await this.monitoring.recordError(errorDetails);
        // Update application state
        this.store.dispatch({
            type: 'ERROR_OCCURRED',
            payload: errorDetails
        });
        // Show user notification if appropriate
        if (this.shouldNotifyUser(error)) {
            this.notifyUser(error);
        }
        // Attempt recovery if possible
        await this.attemptRecovery(error);
    }
    getBrowserInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookiesEnabled: navigator.cookieEnabled
        };
    }
    getSessionInfo() {
        return {
            sessionId: sessionStorage.getItem('sessionId'),
            lastActivity: localStorage.getItem('lastActivity'),
            currentRoute: window.location.pathname
        };
    }
    shouldNotifyUser(error) {
        // Determine if error should be shown to user
        const criticalErrors = [
            'AuthenticationError',
            'NetworkError',
            'DatabaseError'
        ];
        return criticalErrors.includes(error.type);
    }
    notifyUser(error) {
        this.store.dispatch({
            type: 'SHOW_NOTIFICATION',
            payload: {
                type: 'error',
                message: this.getUserFriendlyMessage(error),
                timestamp: this.timestamp
            }
        });
    }
    getUserFriendlyMessage(error) {
        const errorMessages = {
            AuthenticationError: 'Your session has expired. Please log in again.',
            NetworkError: 'Connection lost. Please check your internet connection.',
            DatabaseError: 'Unable to access data. Please try again later.',
            default: 'An unexpected error occurred. Please try again.'
        };
        return errorMessages[error.type] || errorMessages.default;
    }
    async attemptRecovery(error) {
        switch (error.type) {
            case 'AuthenticationError':
                await this.handleAuthError();
                break;
            case 'NetworkError':
                await this.handleNetworkError();
                break;
            case 'DatabaseError':
                await this.handleDatabaseError();
                break;
            default:
                console.warn('No recovery strategy for:', error.type);
        }
    }
    async handleAuthError() {
        // Clear credentials and redirect to login
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
    }
    async handleNetworkError() {
        // Implement retry logic with exponential backoff
        let retryCount = 0;
        const maxRetries = 3;
        const retry = async () => {
            if (retryCount < maxRetries) {
                retryCount++;
                const delay = Math.pow(2, retryCount) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                // Retry failed operation
                return true;
            }
            return false;
        };
        return retry();
    }
    async handleDatabaseError() {
        // Attempt to reconnect or use cached data
        try {
            await this.store.dispatch({
                type: 'USE_CACHED_DATA',
                payload: { timestamp: this.timestamp }
            });
        }
        catch (error) {
            console.error('Cache recovery failed:', error);
        }
    }
}
exports.ErrorHandler = ErrorHandler;
