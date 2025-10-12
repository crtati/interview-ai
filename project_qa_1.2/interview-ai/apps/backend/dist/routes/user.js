"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const router = (0, express_1.Router)();
exports.userRoutes = router;
// Placeholder para rutas de usuario
router.get('/profile', (req, res) => {
    res.json({ message: 'User profile endpoint - TODO' });
});
//# sourceMappingURL=user.js.map