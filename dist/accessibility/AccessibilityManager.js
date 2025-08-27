"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessibilityManager = void 0;
const AppStore_1 = require("../store/AppStore");
const MonitoringService_1 = require("../monitoring/MonitoringService");
class AccessibilityManager {
    constructor() {
        this.timestamp = '2025-08-27 13:08:38';
        this.user = 'prxiio';
        this.store = new AppStore_1.AppStore();
        this.monitoring = new MonitoringService_1.MonitoringService();
        this.initializeA11y();
    }
    initializeA11y() {
        this.setupARIA();
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
        this.setupColorContrast();
        this.setupFocusManagement();
    }
    setupARIA() {
        // Implement ARIA landmarks and roles
        const landmarks = {
            navigation: document.querySelector('nav'),
            main: document.querySelector('main'),
            complementary: document.querySelector('aside'),
            search: document.querySelector('.search-container')
        };
        Object.entries(landmarks).forEach(([role, element]) => {
            if (element) {
                element.setAttribute('role', role);
                element.setAttribute('aria-label', `${role} section`);
            }
        });
        // Set up live regions for dynamic content
        const notifications = document.querySelector('.notifications');
        if (notifications) {
            notifications.setAttribute('aria-live', 'polite');
            notifications.setAttribute('role', 'status');
        }
    }
    setupKeyboardNavigation() {
        // Implement keyboard navigation handlers
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                this.handleTabNavigation(event);
            }
            else if (event.key === 'Escape') {
                this.handleEscapeKey();
            }
        });
        // Add keyboard shortcuts
        const shortcuts = new Map([
            ['Control+/', () => this.toggleHelp()],
            ['Control+F', () => this.focusSearch()],
            ['Control+H', () => this.navigateHome()]
        ]);
        document.addEventListener('keydown', (event) => {
            shortcuts.forEach((action, shortcut) => {
                const keys = shortcut.split('+');
                if (keys.every(key => key === 'Control' ? event.ctrlKey : event.key === key)) {
                    event.preventDefault();
                    action();
                }
            });
        });
    }
    setupScreenReaderSupport() {
        // Add descriptive text for screen readers
        document.querySelectorAll('img, svg').forEach(element => {
            if (!element.getAttribute('aria-label')) {
                const alt = element.getAttribute('alt');
                element.setAttribute('aria-label', alt || 'Decorative image');
                if (!alt)
                    element.setAttribute('aria-hidden', 'true');
            }
        });
        // Add descriptions for interactive elements
        document.querySelectorAll('button, a').forEach(element => {
            if (!element.getAttribute('aria-label')) {
                const text = element.textContent?.trim();
                if (text)
                    element.setAttribute('aria-label', text);
            }
        });
    }
    setupColorContrast() {
        // Monitor and enforce WCAG color contrast requirements
        const contrastChecker = {
            checkContrast: (foreground, background) => {
                // Calculate relative luminance
                const getLuminance = (r, g, b) => {
                    const [rs, gs, bs] = [r, g, b].map(c => {
                        c = c / 255;
                        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
                    });
                    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
                };
                // Calculate contrast ratio
                const l1 = getLuminance(parseInt(foreground.slice(1, 3), 16), parseInt(foreground.slice(3, 5), 16), parseInt(foreground.slice(5, 7), 16));
                const l2 = getLuminance(parseInt(background.slice(1, 3), 16), parseInt(background.slice(3, 5), 16), parseInt(background.slice(5, 7), 16));
                const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
                return Math.round(ratio * 100) / 100;
            }
        };
        // Monitor dynamic color changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes' &&
                    (mutation.attributeName === 'style' ||
                        mutation.attributeName === 'class')) {
                    const element = mutation.target;
                    const style = window.getComputedStyle(element);
                    const contrast = contrastChecker.checkContrast(style.color, style.backgroundColor);
                    if (contrast < 4.5) {
                        console.warn('Insufficient contrast ratio:', contrast);
                        this.monitoring.recordMetric('accessibility', {
                            type: 'contrast-issue',
                            element: element.tagName,
                            contrast: contrast,
                            timestamp: this.timestamp
                        });
                    }
                }
            });
        });
        observer.observe(document.body, {
            attributes: true,
            subtree: true,
            attributeFilter: ['style', 'class']
        });
    }
    setupFocusManagement() {
        // Implement focus trap for modals
        class FocusTrap {
            constructor(element) {
                this.element = element;
                this.focusableElements = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            }
            activate() {
                const firstFocusable = this.focusableElements[0];
                const lastFocusable = this.focusableElements[this.focusableElements.length - 1];
                this.element.addEventListener('keydown', (e) => {
                    if (e.key === 'Tab') {
                        if (e.shiftKey) {
                            if (document.activeElement === firstFocusable) {
                                e.preventDefault();
                                lastFocusable.focus();
                            }
                        }
                        else {
                            if (document.activeElement === lastFocusable) {
                                e.preventDefault();
                                firstFocusable.focus();
                            }
                        }
                    }
                });
                firstFocusable.focus();
            }
        }
        // Apply focus trap to modals
        document.querySelectorAll('.modal').forEach(modal => {
            const focusTrap = new FocusTrap(modal);
            modal.addEventListener('show', () => focusTrap.activate());
        });
    }
    handleTabNavigation(event) {
        // Skip hidden elements
        const focusableElements = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const visibleFocusableElements = Array.from(focusableElements)
            .filter(el => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden';
        });
        if (event.shiftKey) {
            // Handle backward tab
            if (document.activeElement === visibleFocusableElements[0]) {
                event.preventDefault();
                visibleFocusableElements[visibleFocusableElements.length - 1].focus();
            }
        }
    }
    handleEscapeKey() {
        // Close modals and dropdowns
        document.querySelectorAll('.modal.active, .dropdown.active').forEach(element => {
            element.classList.remove('active');
        });
    }
    toggleHelp() {
        this.store.dispatch({
            type: 'TOGGLE_HELP_MODAL',
            payload: {
                timestamp: this.timestamp,
                user: this.user
            }
        });
    }
    focusSearch() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput)
            searchInput.focus();
    }
    navigateHome() {
        window.location.href = '/';
    }
}
exports.AccessibilityManager = AccessibilityManager;
