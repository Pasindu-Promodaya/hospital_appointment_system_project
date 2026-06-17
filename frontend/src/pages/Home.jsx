import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home">

      <h1>Hospital Appointment Management System</h1>

      <p>
        Welcome! Book, update and manage hospital appointments quickly.
      </p>

      <div className="home-buttons">

        <Link to="/book">
          <button>Book Appointment</button>
        </Link>

        <Link to="/appointments">
          <button>View Appointments</button>
        </Link>

      </div>

    </div>
  );
}

export default Home;