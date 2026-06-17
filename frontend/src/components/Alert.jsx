// src/components/Alert.jsx
import React from 'react';
import '../styles/App.css'; // ✅ Import CSS

const Alert = ({ type = "success", message = null, onClose }) => {
  if (message === null) {
    return null;
  }

  const alertClass = type === "error" ? "alert-error" : "alert-success";

  return (
    <div className="alert-container">
      <div className={alertClass} role="alert">
        <span>{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="alert-close"
            aria-label="Dismiss alert"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;