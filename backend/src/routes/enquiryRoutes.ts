import { Router } from "express";
import { submitEnquiry, getEnquiryStatus } from "../controllers/enquiryController";

const router = Router();

// Public endpoint - no authentication needed
router.post("/", submitEnquiry);

// Get enquiry status by ID (public)
router.get("/:enquiryId", getEnquiryStatus);

export default router;
