"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceMetrics = void 0;
class PerformanceMetrics {
    constructor() {
        this.metrics = new Map();
        this.timestamp = '2025-08-27 13:12:47';
        this.user = 'prxiio';
    }
    trackMetric(name, value) {
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        this.metrics.get(name).push({
            value,
            timestamp: this.timestamp,
            user: this.user
        });
    }
    getMetrics(name) {
        return this.metrics.get(name) || [];
    }
    clearMetrics() {
        this.metrics.clear();
    }
}
exports.PerformanceMetrics = PerformanceMetrics;
