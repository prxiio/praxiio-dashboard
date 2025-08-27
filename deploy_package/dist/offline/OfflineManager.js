"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineManager = void 0;
const AppStore_1 = require("../store/AppStore");
const idb_1 = require("idb");
class OfflineManager {
    constructor() {
        this.timestamp = '2025-08-27 13:11:42';
        this.user = 'prxiio';
        this.MAX_RETRIES = 3;
        this.store = new AppStore_1.AppStore();
        this.initializeDB();
    }
    async initializeDB() {
        this.db = await (0, idb_1.openDB)('praxiio-offline', 1, {
            upgrade(db) {
                db.createObjectStore('offlineData', { keyPath: 'key' });
                db.createObjectStore('syncQueue', { keyPath: 'key' });
            }
        });
    }
    async saveOfflineData(key, data) {
        await this.db.put('offlineData', {
            key,
            value: data,
            timestamp: this.timestamp
        });
    }
    async getOfflineData(key) {
        return await this.db.get('offlineData', key);
    }
    async queueForSync(action, data) {
        const key = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await this.db.put('syncQueue', {
            key,
            value: {
                action,
                data,
                timestamp: this.timestamp,
                retries: 0
            }
        });
        // Attempt immediate sync if online
        if (navigator.onLine) {
            this.processSyncQueue();
        }
    }
    async processSyncQueue() {
        const cursor = await this.db.transaction('syncQueue').store.openCursor();
        while (cursor) {
            const { value } = cursor.value;
            if (value.retries < this.MAX_RETRIES) {
                try {
                    await this.syncItem(value);
                    await this.db.delete('syncQueue', cursor.key);
                }
                catch (error) {
                    value.retries++;
                    await this.db.put('syncQueue', {
                        key: cursor.key,
                        value
                    });
                }
            }
            else {
                // Move to error queue or notify user
                this.handleFailedSync(value);
                await this.db.delete('syncQueue', cursor.key);
            }
            await cursor.continue();
        }
    }
    async syncItem(item) {
        const response = await fetch('/api/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Timestamp': this.timestamp,
                'X-User': this.user
            },
            body: JSON.stringify(item)
        });
        if (!response.ok) {
            throw new Error(`Sync failed: ${response.statusText}`);
        }
    }
    handleFailedSync(item) {
        this.store.dispatch({
            type: 'SYNC_FAILED',
            payload: {
                item,
                timestamp: this.timestamp,
                user: this.user
            }
        });
    }
    setupOfflineListeners() {
        window.addEventListener('online', () => {
            this.processSyncQueue();
            this.store.dispatch({
                type: 'ONLINE_STATUS_CHANGED',
                payload: {
                    online: true,
                    timestamp: this.timestamp
                }
            });
        });
        window.addEventListener('offline', () => {
            this.store.dispatch({
                type: 'ONLINE_STATUS_CHANGED',
                payload: {
                    online: false,
                    timestamp: this.timestamp
                }
            });
        });
    }
    async clearOldData() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const cursor = await this.db.transaction('offlineData').store.openCursor();
        while (cursor) {
            if (new Date(cursor.value.timestamp) < thirtyDaysAgo) {
                await this.db.delete('offlineData', cursor.key);
            }
            await cursor.continue();
        }
    }
}
exports.OfflineManager = OfflineManager;
