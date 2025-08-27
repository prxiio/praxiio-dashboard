"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const AppStore_1 = require("../store/AppStore");
const apiService_1 = require("../services/apiService");
class AnalyticsService {
    constructor() {
        this.timestamp = '2025-08-27 13:10:52';
        this.user = 'prxiio';
        this.batchSize = 50;
        this.flushInterval = 30000; // 30 seconds
        this.store = new AppStore_1.AppStore();
        this.api = new apiService_1.APIService();
        this.events = new Map();
        this.initializeAnalytics();
    }
    initializeAnalytics() {
        this.setupEventTracking();
        this.setupPerformanceTracking();
        this.setupUserTracking();
        this.setupAutomaticFlush();
    }
    track(eventName, data) {
        const event = {
            eventName,
            timestamp: this.timestamp,
            user: this.user,
            sessionId: this.getSessionId(),
            data,
            context: this.getContext()
        };
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }
        this.events.get(eventName).push(event);
        if (this.shouldFlush(eventName)) {
            this.flush(eventName);
        }
    }
    setupEventTracking() {
        // Track user interactions
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (target.hasAttribute('data-track')) {
                this.track('user_interaction', {
                    type: 'click',
                    element: target.tagName,
                    id: target.id,
                    class: target.className,
                    path: this.getElementPath(target)
                });
            }
        });
        // Track form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            this.track('form_submission', {
                formId: form.id,
                formName: form.getAttribute('name'),
                fields: this.getFormFields(form)
            });
        });
        // Track page views
        window.addEventListener('popstate', () => this.trackPageView());
        this.trackPageView();
    }
    setupPerformanceTracking() {
        // Track performance metrics
        if ('performance' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    this.track('performance', {
                        metric: entry.entryType,
                        value: entry.duration,
                        name: entry.name
                    });
                });
            });
            observer.observe({
                entryTypes: ['navigation', 'resource', 'paint', 'largest-contentful-paint']
            });
        }
    }
    setupUserTracking() {
        // Track user session
        this.track('session_start', {
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`
        });
        // Track user engagement
        let lastActivity = Date.now();
        const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        activityEvents.forEach(event => {
            window.addEventListener(event, () => {
                const now = Date.now();
                if (now - lastActivity > 30000) { // 30 seconds inactivity threshold
                    this.track('user_engagement', {
                        type: 'reengagement',
                        inactivityDuration: now - lastActivity
                    });
                }
                lastActivity = now;
            });
        });
    }
    setupAutomaticFlush() {
        setInterval(() => {
            this.events.forEach((_, eventName) => {
                this.flush(eventName);
            });
        }, this.flushInterval);
        // Flush before page unload
        window.addEventListener('beforeunload', () => {
            this.events.forEach((_, eventName) => {
                this.flush(eventName, true);
            });
        });
    }
    async flush(eventName, sync = false) {
        const events = this.events.get(eventName) || [];
        if (events.length === 0)
            return;
        const eventsToSend = events.splice(0, this.batchSize);
        try {
            const sendEvents = () => this.api.request('/analytics/events', {
                method: 'POST',
                body: JSON.stringify({
                    eventName,
                    events: eventsToSend,
                    timestamp: this.timestamp,
                    user: this.user
                })
            });
            if (sync) {
                await sendEvents();
            }
            else {
                sendEvents().catch(error => {
                    console.error('Failed to send analytics:', error);
                    // Retry logic
                    this.events.get(eventName).unshift(...eventsToSend);
                });
            }
        }
        catch (error) {
            console.error('Analytics flush failed:', error);
            // Store failed events for retry
            this.events.get(eventName).unshift(...eventsToSend);
        }
    }
    shouldFlush(eventName) {
        return (this.events.get(eventName) || []).length >= this.batchSize;
    }
    getSessionId() {
        let sessionId = sessionStorage.getItem('analytics_session_id');
        if (!sessionId) {
            sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('analytics_session_id', sessionId);
        }
        return sessionId;
    }
    getContext() {
        return {
            url: window.location.href,
            path: window.location.pathname,
            title: document.title,
            timestamp: this.timestamp,
            user: this.user,
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            screenSize: {
                width: window.screen.width,
                height: window.screen.height
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
    }
    trackPageView() {
        this.track('page_view', {
            url: window.location.href,
            referrer: document.referrer,
            title: document.title
        });
    }
    getElementPath(element) {
        const path = [];
        let current = element;
        while (current && current !== document.body) {
            let selector = current.tagName.toLowerCase();
            if (current.id) {
                selector += `#${current.id}`;
            }
            else if (current.className) {
                selector += `.${current.className.split(' ').join('.')}`;
            }
            path.unshift(selector);
            current = current.parentElement;
        }
        return path.join(' > ');
    }
    getFormFields(form) {
        const fields = {};
        const elements = form.elements;
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            if (element.name && !element.name.toLowerCase().includes('password')) {
                fields[element.name] = element.type;
            }
        }
        return fields;
    }
}
exports.AnalyticsService = AnalyticsService;
