import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <h2>🏥 Hospital Appointment System</h2>

      <div>
        <Link to="/">Home</Link>
        <Link to="/book">Book</Link>
        <Link to="/appointments">My Appointments</Link>

      </div>
    </nav>
  );
}

export default Navbar;