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
exports.APIDocGenerator = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class APIDocGenerator {
    constructor() {
        this.timestamp = '2025-08-27 13:11:42';
        this.user = 'prxiio';
        this.initializeSpec();
    }
    initializeSpec() {
        this.spec = {
            openapi: '3.0.0',
            info: {
                title: 'Praxiio Healthcare API',
                version: '1.0.0',
                description: 'API documentation for the Praxiio Healthcare System',
                contact: {
                    name: this.user,
                    email: 'api@praxiio.com'
                }
            },
            servers: [
                {
                    url: 'https://api.praxiio.com/v1',
                    description: 'Production server'
                },
                {
                    url: 'https://staging-api.praxiio.com/v1',
                    description: 'Staging server'
                }
            ],
            paths: {},
            components: {
                schemas: {},
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    }
                }
            }
        };
    }
    addEndpoint(path, method, config) {
        if (!this.spec.paths[path]) {
            this.spec.paths[path] = {};
        }
        this.spec.paths[path][method.toLowerCase()] = {
            ...config,
            security: [{ bearerAuth: [] }]
        };
    }
    addSchema(name, schema) {
        this.spec.components.schemas[name] = schema;
    }
    generateDocs() {
        // Add common schemas
        this.addCommonSchemas();
        // Add endpoints
        this.addEndpoints();
        // Generate documentation
        this.writeSpecToFile();
        this.generateHTML();
    }
    addCommonSchemas() {
        this.addSchema('Patient', {
            type: 'object',
            properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                dateOfBirth: { type: 'string', format: 'date' },
                createdAt: { type: 'string', format: 'date-time' },
                createdBy: { type: 'string' }
            },
            required: ['name', 'dateOfBirth']
        });
        this.addSchema('Appointment', {
            type: 'object',
            properties: {
                id: { type: 'string', format: 'uuid' },
                patientId: { type: 'string', format: 'uuid' },
                date: { type: 'string', format: 'date-time' },
                type: { type: 'string' },
                status: { type: 'string', enum: ['scheduled', 'completed', 'cancelled'] }
            },
            required: ['patientId', 'date', 'type']
        });
    }
    addEndpoints() {
        // Patient endpoints
        this.addEndpoint('/patients', 'GET', {
            summary: 'List all patients',
            description: 'Returns a list of all patients in the system',
            parameters: [
                {
                    name: 'limit',
                    in: 'query',
                    schema: { type: 'integer', default: 10 }
                },
                {
                    name: 'offset',
                    in: 'query',
                    schema: { type: 'integer', default: 0 }
                }
            ],
            responses: {
                '200': {
                    description: 'List of patients',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/Patient' }
                            }
                        }
                    }
                }
            }
        });
        // Add more endpoints...
    }
    writeSpecToFile() {
        const outputPath = path.join(__dirname, 'api-spec.json');
        fs.writeFileSync(outputPath, JSON.stringify(this.spec, null, 2));
    }
    generateHTML() {
        const template = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Praxiio API Documentation</title>
                <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css" />
            </head>
            <body>
                <div id="swagger-ui"></div>
                <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js"></script>
                <script>
                    window.onload = () => {
                        SwaggerUIBundle({
                            spec: ${JSON.stringify(this.spec)},
                            dom_id: '#swagger-ui',
                            deepLinking: true,
                            presets: [
                                SwaggerUIBundle.presets.apis,
                                SwaggerUIBundle.SwaggerUIStandalonePreset
                            ]
                        });
                    };
                </script>
            </body>
            </html>
        `;
        const outputPath = path.join(__dirname, 'api-docs.html');
        fs.writeFileSync(outputPath, template);
    }
}
exports.APIDocGenerator = APIDocGenerator;
