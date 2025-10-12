"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionRoutes = void 0;
const express_1 = require("express");
const router = (0, express_1.Router)();
exports.questionRoutes = router;
router.get('/', (req, res) => {
    res.json({ message: 'Questions endpoint - TODO' });
});
//# sourceMappingURL=questions.js.map