// src/components/AppointmentCard.jsx
import { useNavigate } from 'react-router-dom'; // ✅ ADDED
import '../styles/App.css';

function AppointmentCard({ 
  appointment, 
  onCancel, 
  onDeleteCancelled, 
  showDeleteButton = false 
}) {
  const navigate = useNavigate(); // ✅ ADDED

  // ✅ ADDED: Navigate to edit page
  const handleEdit = () => {
    navigate(`/edit-appointment/${appointment.id}`);
  };

  return (
    <div className={`appointment-card ${appointment.status === 'CANCELLED' ? 'cancelled' : ''}`}>
      <div className="appointment-detail">
        <strong>Appointment ID:</strong> {appointment.id}
      </div>
      <div className="appointment-detail">
        <strong>Doctor:</strong> {appointment.doctorName || appointment.doctorId}
      </div>
      <div className="appointment-detail">
        <strong>Patient:</strong> {appointment.patientName || appointment.patientId}
      </div>
      <div className="appointment-detail">
        <strong>Date:</strong> {appointment.appointmentDate}
      </div>
      <div className="appointment-detail">
        <strong>Time:</strong> {appointment.appointmentTime}
      </div>
      <div className="appointment-detail">
        <strong>Status:</strong> 
        <span className={`status-badge ${appointment.status === 'CANCELLED' ? 'cancelled' : 'active'}`}>
          {appointment.status || 'ACTIVE'}
        </span>
      </div>

      <div className="appointment-actions">
        {/* ✅ ADDED: Edit button - shows for all appointments */}
        <button
          onClick={handleEdit}
          className="btn-edit"
        >
          ✏️ Edit
        </button>

        {/* Show Cancel button only if not already cancelled */}
        {appointment.status !== 'CANCELLED' && (
          <button
            onClick={() => onCancel(appointment.id)}
            className="btn-cancel"
          >
            Cancel Appointment
          </button>
        )}

        {/* Show Delete button only for cancelled appointments */}
        {showDeleteButton && onDeleteCancelled && (
          <button
            onClick={() => onDeleteCancelled(appointment.id)}
            className="btn-remove-view"
          >
            🗑️ Remove from View
          </button>
        )}
      </div>
    </div>
  );
}

export default AppointmentCard;