const { Router } = require("express");
const { listEvents, createEvent, deleteEvent } = require("../controllers/eventController");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = Router();

router.get("/", listEvents);

router.post("/", authMiddleware, requireRole("teacher"), createEvent);
router.delete("/:id", authMiddleware, requireRole("teacher"), deleteEvent);

module.exports = router;
