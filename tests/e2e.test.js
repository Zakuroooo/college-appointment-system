const request = require("supertest");
const app = require("../index");
const prisma = require("../src/utils/prismaClient");
const bcrypt = require("bcrypt");

let studentToken, professorToken, professorId, appointmentId;

describe("College Appointment System E2E Test", () => {
  beforeAll(async () => {
    await prisma.availability.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.user.deleteMany({});

    const hashedPassword = await bcrypt.hash("plain_password", 10);

    const student = await prisma.user.create({
      data: {
        name: "Student A1",
        email: "studentA1@test.com",
        password: hashedPassword,
        role: "student",
      },
    });
    const professor = await prisma.user.create({
      data: {
        name: "Professor P1",
        email: "professorP1@test.com",
        password: hashedPassword,
        role: "professor",
      },
    });

    professorId = professor.id;

    const studentRes = await request(app).post("/api/auth/login").send({
      email: "studentA1@test.com",
      password: "plain_password",
    });
    studentToken = studentRes.body.token;

    const professorRes = await request(app).post("/api/auth/login").send({
      email: "professorP1@test.com",
      password: "plain_password",
    });
    professorToken = professorRes.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("Professor adds availability", async () => {
    const res = await request(app)
      .post("/api/availability")
      .set("Authorization", `Bearer ${professorToken}`)
      .send({ timeSlot: "2024-11-25T10:00:00.000Z" });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Availability added successfully");
  });

  it("Student views professor's availability", async () => {
    const res = await request(app)
      .get(`/api/availability/${professorId}`)
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.slots).toBeDefined();
    expect(res.body.slots).toHaveLength(1);
  });

  it("Student books an appointment", async () => {
    const timeSlot = "2024-11-25T10:00:00.000Z";

    const addAvailabilityRes = await request(app)
      .post("/api/availability")
      .set("Authorization", `Bearer ${professorToken}`)
      .send({ timeSlot });

    expect(addAvailabilityRes.status).toBe(201);
    expect(addAvailabilityRes.body.message).toBe(
      "Availability added successfully"
    );

    console.log("Added Availability:", addAvailabilityRes.body);

    const res = await request(app)
      .post(`/api/appointments/${professorId}/book`)
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ professorId, timeSlot });

    console.log("Response from book appointment:", res.body);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Appointment booked successfully!");

    appointmentId = res.body.appointment.id;
  });

  it("Professor cancels the appointment", async () => {
    const timeSlot = "2024-11-25T10:00:00.000Z";

    const bookRes = await request(app)
      .post(`/api/appointments/${professorId}/book`)
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ professorId, timeSlot });

    const appointmentId = bookRes.body.appointment.id;

    console.log("Booking Appointment:", bookRes.body);

    const cancelRes = await request(app)
      .delete(`/api/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${professorToken}`);

    console.log("Response from cancel appointment:", cancelRes.body);

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.message).toBe("Appointment canceled successfully");
  });

  it("Student checks their appointments", async () => {
    const res = await request(app)
      .get("/api/appointments/")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.appointments).toBeDefined();
    expect(res.body.appointments).toHaveLength(1);
  });
});
