const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./src/routes/authRoutes");
const availabilityRoutes = require("./src/routes/availabilityRoutes");
const appointmentRoutes = require("./src/routes/appointmentRoutes");

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/appointments", appointmentRoutes);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
