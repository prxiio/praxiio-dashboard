"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
// ✅ Initialize Express
const app = (0, express_1.default)();
// ✅ API routes (if you already have routers, mount them here)
// Example: app.use("/api/users", usersRouter);
// ✅ Serve static frontend from client/build
const buildPath = path_1.default.join(__dirname, "../../client/build");
app.use(express_1.default.static(buildPath));
// ✅ Catch-all for SPA routes → always send index.html
app.get("*", (req, res) => {
    res.sendFile(path_1.default.join(buildPath, "index.html"));
});
// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
