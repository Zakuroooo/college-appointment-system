const prisma = require("../utils/prismaClient");

exports.addAvailability = async (req, res) => {
  const { timeSlot } = req.body;

  if (req.user.role !== "professor") {
    return res
      .status(403)
      .json({ message: "Only professors can add availability" });
  }

  try {
    const availability = await prisma.availability.create({
      data: {
        timeSlot,
        professorId: req.user.id,
      },
    });
    res
      .status(201)
      .json({ message: "Availability added successfully", availability });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

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

exports.bookAppointment = async (req, res) => {
  const { professorId } = req.params;
  const { timeSlot } = req.body;
  console.log("Book Appointment Request:", { professorId, timeSlot });

  try {
    const parsedTimeSlot = new Date(timeSlot);

    const availability = await prisma.availability.findFirst({
      where: {
        professorId: parseInt(professorId),
        timeSlot: parsedTimeSlot,
      },
    });

    if (!availability) {
      return res
        .status(404)
        .json({ message: "No availability found for this time slot" });
    }
    console.log("Found Availability:", availability);

    const appointment = await prisma.appointment.create({
      data: {
        timeSlot: availability.timeSlot,
        studentId: req.user.id,
        professorId: parseInt(professorId),
      },
    });

    res.status(201).json({
      message: "Appointment booked successfully!",
      appointment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

    if (
      req.user.role !== "professor" ||
      req.user.id !== appointment.professorId
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized to cancel this appointment" });
    }

    await prisma.appointment.delete({
      where: { id: parseInt(appointmentId) },
    });

    res.status(200).json({ message: "Appointment canceled successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
