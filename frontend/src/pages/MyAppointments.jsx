// src/pages/MyAppointments.jsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  getAppointments,
  cancelAppointment,
} from "../services/appointmentService";
import AppointmentCard from "../components/AppointmentCard";
import Loading from "../components/Loading";
import Alert from '../components/Alert';
import '../styles/App.css'; // ✅ Import CSS

function MyAppointments() {
  const location = useLocation();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);
  
  const [hiddenAppointments, setHiddenAppointments] = useState(new Set());

  const [alertMsg, setAlertMsg] = useState(location.state?.alertMsg || null);
  const [alertType, setAlertType] = useState(location.state?.alertType || 'success');

  const loadAppointments = async () => {
    try {
      const response = await getAppointments();
      setAppointments(response.data);
    } catch (err) {
      console.log(err);
      setAlertMsg("Failed to load appointments. Please refresh the page.");
      setAlertType("error");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAppointments();

    if (location.state?.alertMsg) {
      window.history.replaceState({}, document.title);
    }
  }, []);

  const handleCancel = async (id) => {
    try {
      await cancelAppointment(id);

      setAlertMsg("Appointment cancelled successfully.");
      setAlertType("success");

      await loadAppointments();

    } catch (err) {
      console.error("Cancel failed:", err);

      const errorMessage =
        err.response?.data?.message ||
        "Failed to cancel appointment. Please try again.";

      setAlertMsg(errorMessage);
      setAlertType("error");
    }
  };

  const handleDeleteCancelled = (id) => {
    setHiddenAppointments(prev => new Set([...prev, id]));
    setAlertMsg("Cancelled booking removed from view.");
    setAlertType("success");
  };

  const handleRestoreAll = () => {
    setHiddenAppointments(new Set());
    setAlertMsg("All cancelled bookings restored.");
    setAlertType("success");
  };

  const toggleShowDeleted = () => {
    setShowDeleted(!showDeleted);
  };

  const filteredAppointments = appointments.filter((appointment) => {
    if (hiddenAppointments.has(appointment.id)) {
      return false;
    }

    if (showDeleted) {
      return appointment.status === 'CANCELLED';
    } else {
      return appointment.status !== 'CANCELLED';
    }
  });

  const visibleCancelledCount = appointments.filter(
    app => app.status === 'CANCELLED' && !hiddenAppointments.has(app.id)
  ).length;

  if (loading) return <Loading />;

  return (
    <div className="appointments-container">
      <h2 className="appointments-heading">My Appointments</h2>

      <Alert
        type={alertType}
        message={alertMsg}
        onClose={() => setAlertMsg(null)}
      />

      {/* ✅ Toolbar with proper gap between elements */}
      <div className="appointments-toolbar">
        <button 
          onClick={toggleShowDeleted}
          className={`btn-toggle-cancelled ${showDeleted ? 'active' : 'inactive'}`}
        >
          {showDeleted ? 'Hide Cancelled' : 'Show Cancelled'}
        </button>

        {visibleCancelledCount > 0 && (
          <span className="cancelled-count-badge">
            {visibleCancelledCount} cancelled appointment{visibleCancelledCount > 1 ? 's' : ''}
          </span>
        )}

        {hiddenAppointments.size > 0 && (
          <button
            onClick={handleRestoreAll}
            className="btn-restore-all"
          >
            🔄 Restore All ({hiddenAppointments.size})
          </button>
        )}
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="empty-state">
          {showDeleted 
            ? 'No cancelled appointments found.' 
            : 'No active appointments found.'}
        </div>
      ) : (
        filteredAppointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onCancel={handleCancel}
            onDeleteCancelled={handleDeleteCancelled}
            showDeleteButton={appointment.status === 'CANCELLED'}
          />
        ))
      )}
    </div>
  );
}

export default MyAppointments;