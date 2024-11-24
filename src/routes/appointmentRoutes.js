const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const {
  bookAppointment,
  getAppointments,
  cancelAppointment,
} = require("../controllers/appointmentController");

const router = express.Router();

router.post("/:professorId/book", authenticateToken, bookAppointment);
router.get("/", authenticateToken, getAppointments);
router.delete("/:appointmentId", authenticateToken, cancelAppointment);

module.exports = router;
