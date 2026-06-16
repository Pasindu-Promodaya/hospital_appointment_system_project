import { BrowserRouter, Routes, Route } from "react-router-dom";

import Appointment from "./pages/Appointments";
import BookAppointment from "./pages/BookAppointment"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/doctors" element={<Doctors />} />

        <Route path="/appointment" element={<Appointment />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;