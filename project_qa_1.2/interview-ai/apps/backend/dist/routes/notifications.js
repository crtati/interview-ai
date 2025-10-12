"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRoutes = void 0;
const express_1 = require("express");
const router = (0, express_1.Router)();
exports.notificationRoutes = router;
router.get('/', (req, res) => {
    res.json({ message: 'Notifications endpoint - TODO' });
});
//# sourceMappingURL=notifications.js.map