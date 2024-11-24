const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const {
  addAvailability,
  getAvailability,
} = require("../controllers/availabilityController");

const router = express.Router();

router.post("/", authenticateToken, addAvailability);

router.get("/:professorId", authenticateToken, getAvailability);

module.exports = router;
