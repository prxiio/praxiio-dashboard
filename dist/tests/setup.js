"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSetup = void 0;
const AppStore_1 = require("../store/AppStore");
const apiService_1 = require("../services/apiService");
const AIService_1 = require("../services/ai/AIService");
exports.testSetup = {
    timestamp: '2025-08-27 13:04:33',
    user: 'prxiio',
    store: new AppStore_1.AppStore(),
    api: new apiService_1.APIService(),
    ai: new AIService_1.AIService()
};
