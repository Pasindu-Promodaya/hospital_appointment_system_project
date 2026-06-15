import { BrowserRouter, Routes, Route } from "react-router-dom";
import MyProfile from "./pages/MyProfile";
import MedicalDashboard from "./pages/MedicalDashboard";
import Navbar from "./components/Navbar";

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>
        <Route path="/" element={<MyProfile />} />
        <Route path="/dashboard" element={<MedicalDashboard />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;