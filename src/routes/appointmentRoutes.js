const express = require("express");
const authenticateToken = require("../middleware/authMiddleware"); // Ensure middleware is imported
const {
  bookAppointment,
  getAppointments,
  cancelAppointment,
} = require("../controllers/appointmentController");

const router = express.Router();

router.post("/:professorId/book", authenticateToken, bookAppointment); // Define POST
router.get("/", authenticateToken, getAppointments); // Define GET /
router.delete("/:appointmentId", authenticateToken, cancelAppointment); // Define DELETE /:appointmentId

module.exports = router;
