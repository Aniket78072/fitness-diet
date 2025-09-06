import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { logout } from "../features/authSlice";
// import { FaFacebookF, FaTwitter, FaYoutube, FaInstagram } from "react-icons/fa";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token) || localStorage.getItem("token");

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav className="bg-black text-white flex items-center justify-between px-4 md:px-8 py-4 fixed w-full z-50">
      <div className="flex items-center">
        <div className="text-3xl font-extrabold flex items-center space-x-2">
          <span>GYM</span>
          <div className="w-6 h-6 bg-orange-500 rounded-sm flex items-center justify-center">
            <div className="w-1 h-4 bg-white"></div>
            <div className="w-1 h-4 bg-white ml-1"></div>
          </div>
        </div>
      </div>

      {/* Desktop Navigation */}
      {token && (
        <ul className="hidden md:flex space-x-6 text-sm font-semibold">
          <li>
            <Link to="/home" className="hover:text-orange-500 transition">Home</Link>
          </li>
          <li>
            <Link to="/dashboard" className="hover:text-orange-500 transition">Dashboard</Link>
          </li>
          <li>
            <Link to="/food-log" className="hover:text-orange-500 transition">Food Log</Link>
          </li>
          <li>
            <Link to="/suggestions" className="hover:text-orange-500 transition">AI Suggestions</Link>
          </li>
          <li>
            <Link to="/workouts" className="hover:text-orange-500 transition">Workout Tracker</Link>
          </li>
          <li>
            <Link to="/ai-trainer" className="hover:text-orange-500 transition">AI Trainer</Link>
          </li>
        </ul>
      )}

      {/* Desktop Auth Buttons */}
      <div className="hidden md:flex space-x-4">
        {!token ? (
          <>
            <Link to="/" className="hover:text-orange-500 transition">Login</Link>
            <Link to="/register" className="hover:text-orange-500 transition">Register</Link>
          </>
        ) : (
          <button onClick={handleLogout} className="hover:text-white hover:bg-orange-500 transition border-2 border-orange-500 text-orange-500 px-4 py-2 rounded">Logout</button>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden flex flex-col space-y-1 p-2"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        <div className={`w-6 h-0.5 bg-white transition-transform duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
        <div className={`w-6 h-0.5 bg-white transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></div>
        <div className={`w-6 h-0.5 bg-white transition-transform duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black border-t border-gray-700">
          {token && (
            <ul className="flex flex-col space-y-2 p-4 text-sm font-semibold">
              <li>
                <Link to="/home" className="block py-2 hover:text-orange-500 transition" onClick={() => setIsMenuOpen(false)}>Home</Link>
              </li>
              <li>
                <Link to="/dashboard" className="block py-2 hover:text-orange-500 transition" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
              </li>
              <li>
                <Link to="/food-log" className="block py-2 hover:text-orange-500 transition" onClick={() => setIsMenuOpen(false)}>Food Log</Link>
              </li>
              <li>
                <Link to="/suggestions" className="block py-2 hover:text-orange-500 transition" onClick={() => setIsMenuOpen(false)}>AI Suggestions</Link>
              </li>
              <li>
                <Link to="/workouts" className="block py-2 hover:text-orange-500 transition" onClick={() => setIsMenuOpen(false)}>Workout Tracker</Link>
              </li>
              <li>
                <Link to="/ai-trainer" className="block py-2 hover:text-orange-500 transition" onClick={() => setIsMenuOpen(false)}>AI Trainer</Link>
              </li>
              <li className="pt-2 border-t border-gray-700">
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full text-left py-2 hover:text-orange-500 transition">Logout</button>
              </li>
            </ul>
          )}
          {!token && (
            <div className="flex flex-col space-y-2 p-4">
              <Link to="/" className="block py-2 hover:text-orange-500 transition" onClick={() => setIsMenuOpen(false)}>Login</Link>
              <Link to="/register" className="block py-2 hover:text-orange-500 transition" onClick={() => setIsMenuOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
