const { Router } = require("express");
const { listInstructions, createInstruction } = require("../controllers/instructionController");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = Router();

router.get("/", authMiddleware, listInstructions);
router.post("/", authMiddleware, requireRole("teacher"), createInstruction);

module.exports = router;
