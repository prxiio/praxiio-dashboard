"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
// Event bus for application-wide communication
class EventBus {
    constructor() {
        this.events = {};
    }
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        return () => this.off(event, callback);
    }
    off(event, callback) {
        if (!this.events[event])
            return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
    emit(event, data) {
        if (!this.events[event])
            return;
        this.events[event].forEach(callback => {
            try {
                callback(data);
            }
            catch (error) {
                console.error(`Error in event handler for ${event}:`, error);
            }
        });
    }
}
exports.EventBus = EventBus;
