import express from "express";
import {
  createPlanningRequest,
  getPlanningRequests,
  updatePlanningRequestStatus,
} from "../controller/PlanningRequest.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware if you want to restrict these routes to authenticated users
// router.use(authMiddleware);

router.post("/", createPlanningRequest);
router.get("/", getPlanningRequests);
router.patch("/:id/status", updatePlanningRequestStatus);

export default router;
