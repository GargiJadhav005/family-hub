const { Router } = require("express");
const { submitEnquiry, getEnquiryStatus } = require("../controllers/enquiryController");

const router = Router();

router.post("/", submitEnquiry);
router.get("/:enquiryId", getEnquiryStatus);

module.exports = router;
