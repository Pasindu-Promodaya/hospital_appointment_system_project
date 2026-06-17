import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import BookAppointment from "./pages/BookAppointment";
import MyAppointments from "./pages/MyAppointments";
import EditAppointment from "./pages/EditAppointment";

function App() {
  return (
    <>
      <Navbar />

      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/book"
            element={<BookAppointment />}
          />

          <Route
            path="/appointments"
            element={<MyAppointments />}
          />

          <Route path="/edit-appointment/:id" 
          element={<EditAppointment />} />
        </Routes>
      </div>

      <Footer />
    </>
  );
}

export default App;