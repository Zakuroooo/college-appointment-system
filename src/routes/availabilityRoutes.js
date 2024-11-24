const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const {
  addAvailability,
  getAvailability,
} = require("../controllers/availabilityController");

const router = express.Router();

// Route for a professor to add availability
router.post("/", authenticateToken, addAvailability);

// Route for a student to view a professor's availability
router.get("/:professorId", authenticateToken, getAvailability);

module.exports = router;
