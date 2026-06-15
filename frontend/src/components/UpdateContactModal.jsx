import React, { useState } from "react";

const UpdateContactModal = ({ currentContact, onClose, onSave }) => {
  const [formData, setFormData] = useState(currentContact);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">

      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* POPUP CARD (CENTERED) */}
      <div className="relative w-[420px] bg-white rounded-2xl shadow-2xl border p-5 animate-fadeIn">

        {/* HEADER */}
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          ✏️ Update Patient Profile
        </h3>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Name */}
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
          />

          {/* Phone */}
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
          />

          {/* Relation */}
          <input
            name="relation"
            value={formData.relation}
            onChange={handleChange}
            placeholder="Relation"
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
          />

          {/* EMAIL */}
          <input
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            placeholder="Email Address"
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
          />

          {/* SECONDARY PHONE */}
          <input
            name="secondaryPhone"
            value={formData.secondaryPhone || ""}
            onChange={handleChange}
            placeholder="Secondary Phone"
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
          />

          {/* ADDRESS */}
          <textarea
            name="address"
            value={formData.address || ""}
            onChange={handleChange}
            placeholder="Home Address"
            rows="2"
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
          />

          {/* BUTTONS */}
          <div className="flex justify-end gap-2 pt-2">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md"
            >
              Save Changes
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default UpdateContactModal;