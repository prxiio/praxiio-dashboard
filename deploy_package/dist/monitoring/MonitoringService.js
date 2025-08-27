"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringService = void 0;
const AppStore_1 = require("../store/AppStore");
const apiService_1 = require("../services/apiService");
class MonitoringService {
    constructor() {
        this.timestamp = '2025-08-27 13:06:11';
        this.user = 'prxiio';
        this.store = new AppStore_1.AppStore();
        this.api = new apiService_1.APIService();
        this.metrics = new Map();
        this.initializeMonitoring();
    }
    initializeMonitoring() {
        this.setupPerformanceMonitoring();
        this.setupErrorTracking();
        this.setupUserActivityTracking();
        this.setupResourceMonitoring();
    }
    setupPerformanceMonitoring() {
        if ('performance' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.recordMetric('performance', {
                        name: entry.name,
                        duration: entry.duration,
                        startTime: entry.startTime,
                        timestamp: this.timestamp
                    });
                }
            });
            observer.observe({ entryTypes: ['navigation', 'resource', 'paint'] });
        }
    }
    setupErrorTracking() {
        window.addEventListener('error', (event) => {
            this.recordError({
                type: 'error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                timestamp: this.timestamp,
                user: this.user
            });
        });
        window.addEventListener('unhandledrejection', (event) => {
            this.recordError({
                type: 'unhandledRejection',
                message: event.reason,
                timestamp: this.timestamp,
                user: this.user
            });
        });
    }
    setupUserActivityTracking() {
        const activities = ['click', 'keypress', 'mousemove', 'scroll'];
        activities.forEach(activity => {
            window.addEventListener(activity, () => {
                this.recordUserActivity(activity);
            });
        });
    }
    setupResourceMonitoring() {
        setInterval(() => {
            this.checkResourceUsage();
        }, 60000); // Check every minute
    }
    async checkResourceUsage() {
        const memory = performance.memory;
        const resources = {
            jsHeapSizeLimit: memory?.jsHeapSizeLimit,
            totalJSHeapSize: memory?.totalJSHeapSize,
            usedJSHeapSize: memory?.usedJSHeapSize,
            timestamp: this.timestamp,
            user: this.user
        };
        await this.api.request('/monitoring/resources', {
            method: 'POST',
            body: JSON.stringify(resources)
        });
    }
    recordMetric(type, data) {
        const metric = {
            ...data,
            timestamp: this.timestamp,
            user: this.user
        };
        this.metrics.set(`${type}_${Date.now()}`, metric);
        this.sendMetrics();
    }
    async sendMetrics() {
        if (this.metrics.size >= 10) {
            const metricsArray = Array.from(this.metrics.values());
            try {
                await this.api.request('/monitoring/metrics', {
                    method: 'POST',
                    body: JSON.stringify(metricsArray)
                });
                this.metrics.clear();
            }
            catch (error) {
                console.error('Failed to send metrics:', error);
            }
        }
    }
    async recordError(error) {
        try {
            await this.api.request('/monitoring/errors', {
                method: 'POST',
                body: JSON.stringify(error)
            });
        }
        catch (err) {
            console.error('Failed to record error:', err);
        }
    }
    recordUserActivity(activity) {
        this.recordMetric('user_activity', {
            type: activity,
            path: window.location.pathname,
            timestamp: this.timestamp,
            user: this.user
        });
    }
}
exports.MonitoringService = MonitoringService;
