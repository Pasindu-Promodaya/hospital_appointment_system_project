// src/pages/EditAppointment.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAppointment,
  updateAppointment,
} from "../services/appointmentService";
import { getAllDoctors } from "../services/doctorService"; // ✅ ADDED
import { getAllPatients } from "../services/patientService"; // ✅ ADDED
import Alert from '../components/Alert';
import '../styles/App.css';

function EditAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ✅ ADDED: State for doctors and patients lists
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [alertMsg, setAlertMsg] = useState(null);
  const [alertType, setAlertType] = useState('success');

  const [form, setForm] = useState({
    doctorId: "",
    patientId: "",
    appointmentDate: "",
    appointmentTime: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  // ✅ CHANGED: Load appointment, doctors, and patients together
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [appointmentRes, doctorsRes, patientsRes] = await Promise.all([
        getAppointment(id),
        getAllDoctors(),
        getAllPatients()
      ]);

      setForm(appointmentRes.data);
      setDoctors(doctorsRes.data);
      setPatients(patientsRes.data);
      
    } catch (err) {
      console.error("Failed to load data:", err);
      setAlertMsg("Failed to load appointment details. Please try again.");
      setAlertType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateAppointment(id, {
        doctorId: Number(form.doctorId),
        patientId: Number(form.patientId),
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime,
      });

      navigate("/appointments", {
        state: {
          alertMsg: "Appointment Updated Successfully",
          alertType: "success",
        },
      });

    } catch (err) {
      console.error("Update failed:", err);

      const errorMessage =
        err.response?.data?.message ||
        "Failed to update appointment. Please try again.";

      setAlertMsg(errorMessage);
      setAlertType("error");
    }
  };

  // Find selected doctor and patient names for display
  const selectedDoctor = doctors.find(d => d.id === Number(form.doctorId));
  const selectedPatient = patients.find(p => p.id === Number(form.patientId));

  if (loading) {
    return (
      <div className="edit-appointment-container">
        <h2 className="edit-appointment-heading">Edit Appointment</h2>
        <div className="loading-spinner">Loading appointment details...</div>
      </div>
    );
  }

  return (
    <div className="edit-appointment-container">
      <h2 className="edit-appointment-heading">Edit Appointment</h2>

      <Alert
        type={alertType}
        message={alertMsg}
        onClose={() => setAlertMsg(null)}
      />

      <form className="edit-appointment-form" onSubmit={handleSubmit}>
        {/* ✅ CHANGED: Doctor dropdown instead of input */}
        <div className="form-group">
          <label htmlFor="doctorId">Doctor</label>
          <select
            id="doctorId"
            name="doctorId"
            value={form.doctorId}
            onChange={handleChange}
            required
            className="form-input"
          >
            <option value="">Select Doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} - {doctor.specialization || 'General'}
              </option>
            ))}
          </select>
          {selectedDoctor && (
            <div className="form-helper">
              Selected: {selectedDoctor.name} ({selectedDoctor.specialization || 'General'})
            </div>
          )}
        </div>

        {/* ✅ CHANGED: Patient dropdown instead of input */}
        <div className="form-group">
          <label htmlFor="patientId">Patient</label>
          <select
            id="patientId"
            name="patientId"
            value={form.patientId}
            onChange={handleChange}
            required
            className="form-input"
          >
            <option value="">Select Patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name} - {patient.email || patient.phone || ''}
              </option>
            ))}
          </select>
          {selectedPatient && (
            <div className="form-helper">
              Selected: {selectedPatient.name} ({selectedPatient.email || selectedPatient.phone || 'No contact'})
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="appointmentDate">Appointment Date</label>
          <input
            id="appointmentDate"
            type="date"
            name="appointmentDate"
            value={form.appointmentDate}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="appointmentTime">Appointment Time</label>
          <input
            id="appointmentTime"
            type="time"
            name="appointmentTime"
            value={form.appointmentTime}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-update">
            Update Appointment
          </button>
          <button 
            type="button" 
            className="btn-cancel-form"
            onClick={() => navigate('/appointments')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditAppointment;