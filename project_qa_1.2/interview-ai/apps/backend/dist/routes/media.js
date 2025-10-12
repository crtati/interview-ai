"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaRoutes = void 0;
const express_1 = require("express");
const router = (0, express_1.Router)();
exports.mediaRoutes = router;
router.post('/avatar', (req, res) => {
    res.json({ message: 'Media avatar endpoint - TODO' });
});
//# sourceMappingURL=media.js.map