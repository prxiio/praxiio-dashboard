"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemedicineService = void 0;
const apiService_js_1 = require("../../services/apiService.js");
const eventBus_js_1 = require("../../utils/eventBus.js");
class TelemedicineService {
    constructor() {
        this.api = new apiService_js_1.APIService();
        this.eventBus = new eventBus_js_1.EventBus();
        this.activeSession = null;
        this.peerConnection = null;
    }
    async initializeSession(appointmentId) {
        try {
            const sessionData = await this.api.initializeSession(appointmentId);
            this.activeSession = sessionData;
            await this.setupWebRTC(sessionData);
            this.eventBus.emit('session:initialized', sessionData);
            return sessionData;
        }
        catch (error) {
            this.eventBus.emit('session:error', error);
            throw error;
        }
    }
    async setupWebRTC(sessionData) {
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        };
        this.peerConnection = new RTCPeerConnection(configuration);
        // Add local video stream
        const localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        localStream.getTracks().forEach(track => {
            this.peerConnection.addTrack(track, localStream);
        });
        // Handle incoming streams
        this.peerConnection.ontrack = (event) => {
            this.eventBus.emit('stream:received', event.streams[0]);
        };
        // Set up signaling
        this.setupSignaling(sessionData);
    }
    setupSignaling(sessionData) {
        // WebSocket connection for signaling
        this.signaling = new WebSocket(sessionData.signalingServer);
        this.signaling.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            switch (message.type) {
                case 'offer':
                    await this.handleOffer(message);
                    break;
                case 'answer':
                    await this.handleAnswer(message);
                    break;
                case 'candidate':
                    await this.handleCandidate(message);
                    break;
            }
        };
    }
    async endSession() {
        if (this.activeSession) {
            await this.api.endSession(this.activeSession.id);
            this.peerConnection?.close();
            this.signaling?.close();
            this.activeSession = null;
            this.eventBus.emit('session:ended');
        }
    }
}
exports.TelemedicineService = TelemedicineService;
