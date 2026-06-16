import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Doctors from "./pages/Doctor";
import Appointment from "./pages/Appointment";

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