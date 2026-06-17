import api from "../api/axios";

export const getAppointments = () =>
    api.get("/appointments");

export const getAppointment = (id) =>
    api.get(`/appointments/${id}`);

export const createAppointment = (appointment) =>
    api.post("/appointments", appointment);

export const updateAppointment = (id, appointment) =>
    api.put(`/appointments/${id}`, appointment);

export const cancelAppointment = (id) =>
    api.patch(`/appointments/${id}/cancel`);

export const getDoctorAppointments = (doctorId) =>
    api.get(`/appointments/doctor/${doctorId}`);

export const getPatientAppointments = (patientId) =>
    api.get(`/appointments/patient/${patientId}`);