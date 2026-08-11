"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRoutes = void 0;
const express_1 = require("express");
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const router = (0, express_1.Router)();
exports.dashboardRoutes = router;
router.use('/', dashboard_routes_1.default);
//# sourceMappingURL=index.js.map