import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});


// ================= DOCTORS =================
export const getDoctors = () => API.get("/doctors");


// ================= APPOINTMENTS =================

// Book appointment
export const bookAppointment = (data) =>
  API.post("/appointments", data);


// Get all appointments of a patient
export const getPatientAppointments = (patientId) =>
  API.get(`/appointments/patient/${patientId}`);


// Get all appointments of a doctor (optional use)
export const getDoctorAppointments = (doctorId) =>
  API.get(`/appointments/doctor/${doctorId}`);


// Cancel appointment (YOU SAID PATCH WORKS)
export const cancelAppointment = (id) =>
  API.patch(`/appointments/${id}/cancel`);


// Optional: get single appointment
export const getAppointmentById = (id) =>
  API.get(`/appointments/${id}`);

export default API;