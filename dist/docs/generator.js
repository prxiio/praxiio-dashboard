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
exports.DocumentationGenerator = void 0;
const TypeDoc = __importStar(require("typedoc"));
class DocumentationGenerator {
    constructor() {
        this.timestamp = '2025-08-27 13:06:11';
        this.author = 'prxiio';
        this.app = new TypeDoc.Application();
        this.configure();
    }
    configure() {
        this.app.options.addReader(new TypeDoc.TSConfigReader());
        this.app.options.addReader(new TypeDoc.TypeDocReader());
    }
    async generateDocs() {
        const project = await this.app.convert();
        if (project) {
            await this.app.generateDocs(project, 'docs');
            this.generateCustomDocs();
        }
    }
    generateCustomDocs() {
        this.generateAPIReference();
        this.generateArchitectureGuide();
        this.generateDeploymentGuide();
    }
    generateAPIReference() {
        // Implementation for API reference documentation
    }
}
exports.DocumentationGenerator = DocumentationGenerator;
