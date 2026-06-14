import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="bg-white shadow p-4 flex justify-between">

      <h1 className="font-bold text-blue-600">Hospital System</h1>

      <div className="space-x-4">
        <Link className="text-gray-600 hover:text-blue-600" to="/">
          Profile
        </Link>

        <Link className="text-gray-600 hover:text-blue-600" to="/dashboard">
          Medical History
        </Link>
      </div>

    </div>
  );
}