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
