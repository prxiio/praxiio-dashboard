"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/index.ts
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
// Correct path for the deployed static frontend
const buildPath = path_1.default.join(__dirname, "../build");
app.use(express_1.default.static(buildPath));
// Catch-all to send the index.html for any request
app.get("*", (req, res) => {
    res.sendFile(path_1.default.join(buildPath, "index.html"));
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
