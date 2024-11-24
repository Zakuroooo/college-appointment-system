const prisma = require("../utils/prismaClient");

/**
 * Add availability for a professor.
 */
exports.addAvailability = async (req, res) => {
  const { timeSlot } = req.body;

  // Ensure the user is a professor
  if (req.user.role !== "professor") {
    return res
      .status(403)
      .json({ message: "Only professors can add availability" });
  }

  try {
    const availability = await prisma.availability.create({
      data: {
        timeSlot,
        professorId: req.user.id, // Use the professor's ID from the token
      },
    });
    res
      .status(201)
      .json({ message: "Availability added successfully", availability });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get availability for a professor.
 */
exports.getAvailability = async (req, res) => {
  const { professorId } = req.params;

  try {
    const slots = await prisma.availability.findMany({
      where: { professorId: parseInt(professorId) },
    });
    res.status(200).json({ message: "Professor is Available!", slots });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Book an appointment with a professor.
 */
/**
 * Book an appointment with a professor.
 */
exports.bookAppointment = async (req, res) => {
  const { professorId } = req.params;
  const { timeSlot } = req.body;
  console.log("Book Appointment Request:", { professorId, timeSlot });

  try {
    // Ensure the timeSlot is in a Date object format
    const parsedTimeSlot = new Date(timeSlot);

    // Ensure the availability exists
    const availability = await prisma.availability.findFirst({
      where: {
        professorId: parseInt(professorId),
        timeSlot: parsedTimeSlot, // Ensure timeSlot is in Date format
      },
    });

    if (!availability) {
      return res
        .status(404)
        .json({ message: "No availability found for this time slot" });
    }
    console.log("Found Availability:", availability);

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        timeSlot: availability.timeSlot,
        studentId: req.user.id,
        professorId: parseInt(professorId),
      },
    });

    // Respond with the appointment details
    res.status(201).json({
      message: "Appointment booked successfully!",
      appointment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get a list of appointments for a professor or student.
 */
exports.getAppointments = async (req, res) => {
  // CHANGED: Check if user is professor or student
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const appointments =
      userRole === "professor"
        ? await prisma.appointment.findMany({
            where: { professorId: userId },
          })
        : await prisma.appointment.findMany({
            where: { studentId: userId },
          });

    res.status(200).json({ appointments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Cancel an appointment.
 */
exports.cancelAppointment = async (req, res) => {
  const { appointmentId } = req.params;
  console.log("Cancel Appointment Request:", { appointmentId });

  try {
    // Ensure that the appointmentId is provided and valid
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(appointmentId) },
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    console.log("Found Appointment to cancel:", appointment);

    // Ensure the user has the right to cancel
    if (
      req.user.role !== "professor" ||
      req.user.id !== appointment.professorId
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized to cancel this appointment" });
    }

    // Delete the appointment instead of updating its status
    await prisma.appointment.delete({
      where: { id: parseInt(appointmentId) },
    });

    res.status(200).json({ message: "Appointment canceled successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
