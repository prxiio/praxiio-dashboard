"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Store = void 0;
// Application state management
class Store {
    constructor() {
        this.state = {
            currentUser: null,
            patients: [],
            appointments: [],
            inventory: [],
            notifications: [],
            settings: {},
            lastSync: null
        };
        this.subscribers = [];
    }
    subscribe(callback) {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== callback);
        };
    }
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }
    notify() {
        this.subscribers.forEach(callback => callback(this.state));
    }
    // State getters
    getCurrentUser() {
        return this.state.currentUser;
    }
    getPatients() {
        return this.state.patients;
    }
    getAppointments() {
        return this.state.appointments;
    }
    // State setters
    setCurrentUser(user) {
        this.setState({ currentUser: user });
    }
    addPatient(patient) {
        this.setState({
            patients: [...this.state.patients, patient]
        });
    }
    updatePatient(patientId, updates) {
        const updatedPatients = this.state.patients.map(p => p.id === patientId ? { ...p, ...updates } : p);
        this.setState({ patients: updatedPatients });
    }
    addAppointment(appointment) {
        this.setState({
            appointments: [...this.state.appointments, appointment]
        });
    }
    addNotification(notification) {
        this.setState({
            notifications: [...this.state.notifications, {
                    id: Utils.generateId('notif'),
                    timestamp: new Date().toISOString(),
                    ...notification
                }]
        });
    }
}
exports.Store = Store;
