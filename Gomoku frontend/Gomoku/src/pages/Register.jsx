import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService"; // Import API function

const Register = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    birthDay: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user.firstName || !user.lastName || !user.email || !user.password) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      await registerUser(user);
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err || "Registration failed.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center text-white p-6" style={{ backgroundImage: `url('https://live.staticflickr.com/65535/49800246313_a2d9c644ee_b.jpg')` }}>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-teal-900/50 animate-gradient-shift"></div>
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-600 animate-text-glow">
          Register
        </h1>

        {error && <p className="text-red-400 mb-6 animate-text-reveal text-center">{error}</p>}
        {success && <p className="text-green-400 mb-6 animate-text-reveal text-center">{success}</p>}

        <form onSubmit={handleRegister} className="flex flex-col items-center w-full max-w-md animate-fade-slide-up">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={user.firstName}
            onChange={handleChange}
            className="w-64 px-4 py-3 mb-4 text-black rounded-lg bg-gray-200/80 shadow-lg focus:ring-4 focus:ring-teal-500/50 focus:outline-none transform hover:scale-105 transition-all duration-500 animate-bounce-in"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={user.lastName}
            onChange={handleChange}
            className="w-64 px-4 py-3 mb-4 text-black rounded-lg bg-gray-200/80 shadow-lg focus:ring-4 focus:ring-teal-500/50 focus:outline-none transform hover:scale-105 transition-all duration-500 animate-bounce-in"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={user.email}
            onChange={handleChange}
            className="w-64 px-4 py-3 mb-4 text-black rounded-lg bg-gray-200/80 shadow-lg focus:ring-4 focus:ring-teal-500/50 focus:outline-none transform hover:scale-105 transition-all duration-500 animate-bounce-in"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={user.password}
            onChange={handleChange}
            className="w-64 px-4 py-3 mb-4 text-black rounded-lg bg-gray-200/80 shadow-lg focus:ring-4 focus:ring-teal-500/50 focus:outline-none transform hover:scale-105 transition-all duration-500 animate-bounce-in"
          />
          <input
            type="date"
            name="birthDay"
            value={user.birthDay}
            onChange={handleChange}
            className="w-64 px-4 py-3 mb-4 text-black rounded-lg bg-gray-200/80 shadow-lg focus:ring-4 focus:ring-teal-500/50 focus:outline-none transform hover:scale-105 transition-all duration-500 animate-bounce-in"
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={user.address}
            onChange={handleChange}
            className="w-64 px-4 py-3 mb-4 text-black rounded-lg bg-gray-200/80 shadow-lg focus:ring-4 focus:ring-teal-500/50 focus:outline-none transform hover:scale-105 transition-all duration-500 animate-bounce-in"
          />
          <div className="flex justify-center">
            <button
              type="submit"
              className="relative px-8 py-3 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg shadow-xl hover:from-green-600 hover:to-teal-700 transform hover:scale-110 hover:rotate-2 transition-all duration-500 group overflow-hidden"
            >
              <span className="relative z-10">Register</span>
              <span className="absolute inset-0 bg-green-400 opacity-0 group-hover:opacity-40 animate-pulse transition-opacity duration-500"></span>
            </button>
          </div>
        </form>

        <p className="mt-6 text-gray-300 animate-text-reveal text-center">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-teal-400 hover:underline transform hover:scale-105 transition-all duration-300"
          >
            Login
          </button>
        </p>
      </div>

      <style jsx>{`
        @keyframes gradient-shift { ... }
        @keyframes text-glow { ... }
        @keyframes bounce-in { ... }
        @keyframes fade-slide-up { ... }
        @keyframes text-reveal { ... }
      `}</style>
    </div>
  );
};

export default Register;
