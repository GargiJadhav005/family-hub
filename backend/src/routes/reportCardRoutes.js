const { Router } = require("express");
const {
  listReportCards,
  saveReportCard,
  generateAllReportCards,
  generateReportCard,
  getStudentReportCard,
} = require("../controllers/reportCardController");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = Router();

router.get("/", authMiddleware, listReportCards);
router.post("/save", authMiddleware, requireRole("teacher"), saveReportCard);
router.post("/generate-all", authMiddleware, requireRole("teacher"), generateAllReportCards);
router.post("/generate/:studentId", authMiddleware, requireRole("teacher"), generateReportCard);
router.get("/:studentId", authMiddleware, getStudentReportCard);

module.exports = router;
