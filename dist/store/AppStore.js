"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppStore = void 0;
const eventBus_js_1 = require("../utils/eventBus.js");
class AppStore {
    constructor() {
        this.state = {
            user: {
                login: 'prxiio',
                lastActive: '2025-08-27 13:01:19',
                permissions: []
            },
            patients: [],
            appointments: [],
            inventory: [],
            notifications: [],
            activeModule: 'dashboard'
        };
        this.eventBus = new eventBus_js_1.EventBus();
        this.subscribers = new Map();
    }
    subscribe(selector, callback) {
        const id = Math.random().toString(36).substr(2, 9);
        this.subscribers.set(id, { selector, callback });
        // Initial callback with current state
        callback(selector(this.state));
        return () => {
            this.subscribers.delete(id);
        };
    }
    dispatch(action) {
        const prevState = { ...this.state };
        switch (action.type) {
            case 'SET_USER':
                this.state.user = { ...this.state.user, ...action.payload };
                break;
            case 'UPDATE_PATIENTS':
                this.state.patients = action.payload;
                break;
            case 'ADD_NOTIFICATION':
                this.state.notifications = [
                    {
                        id: Math.random().toString(36).substr(2, 9),
                        timestamp: '2025-08-27 13:01:19',
                        ...action.payload
                    },
                    ...this.state.notifications
                ];
                break;
            case 'CHANGE_MODULE':
                this.state.activeModule = action.payload;
                break;
            default:
                console.warn('Unknown action type:', action.type);
                return;
        }
        // Notify subscribers
        this.notifySubscribers(prevState);
    }
    notifySubscribers(prevState) {
        this.subscribers.forEach(({ selector, callback }) => {
            const prevSelected = selector(prevState);
            const newSelected = selector(this.state);
            if (prevSelected !== newSelected) {
                callback(newSelected);
            }
        });
    }
}
exports.AppStore = AppStore;
// Selectors
AppStore.selectors = {
    getUser: state => state.user,
    getPatients: state => state.patients,
    getNotifications: state => state.notifications,
    getActiveModule: state => state.activeModule
};
