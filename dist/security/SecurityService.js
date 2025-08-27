"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityService = void 0;
const apiService_1 = require("../services/apiService");
const AppStore_1 = require("../store/AppStore");
const crypto = __importStar(require("crypto-js"));
class SecurityService {
    constructor() {
        this.api = new apiService_1.APIService();
        this.store = new AppStore_1.AppStore();
        this.sessionKey = this.generateSessionKey();
    }
    async authenticate(credentials) {
        const timestamp = '2025-08-27 13:04:33';
        const hashedPassword = this.hashPassword(credentials.password);
        try {
            const response = await this.api.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    username: credentials.username,
                    password: hashedPassword,
                    timestamp
                })
            });
            if (response.token) {
                this.setAuthToken(response.token);
                this.startSessionMonitoring();
            }
            return response;
        }
        catch (error) {
            console.error('Authentication failed:', error);
            throw error;
        }
    }
    verifyPermissions(requiredPermissions) {
        const userPermissions = this.store.state.user.permissions;
        return requiredPermissions.every(permission => userPermissions.includes(permission));
    }
    encryptData(data) {
        return crypto.AES.encrypt(JSON.stringify(data), this.sessionKey).toString();
    }
    decryptData(encryptedData) {
        const bytes = crypto.AES.decrypt(encryptedData, this.sessionKey);
        return JSON.parse(bytes.toString(crypto.enc.Utf8));
    }
    generateSessionKey() {
        return crypto.lib.WordArray.random(256 / 8).toString();
    }
    hashPassword(password) {
        return crypto.SHA256(password).toString();
    }
    setAuthToken(token) {
        localStorage.setItem('auth_token', token);
        this.api.setAuthHeader(token);
    }
    startSessionMonitoring() {
        setInterval(() => {
            this.checkSessionValidity();
        }, 300000); // Check every 5 minutes
    }
    async checkSessionValidity() {
        try {
            const response = await this.api.request('/auth/validate');
            if (!response.valid) {
                this.handleSessionExpired();
            }
        }
        catch (error) {
            this.handleSessionExpired();
        }
    }
    handleSessionExpired() {
        this.store.dispatch({
            type: 'SESSION_EXPIRED',
            payload: {
                message: 'Your session has expired. Please log in again.',
                timestamp: '2025-08-27 13:04:33'
            }
        });
    }
}
exports.SecurityService = SecurityService;
