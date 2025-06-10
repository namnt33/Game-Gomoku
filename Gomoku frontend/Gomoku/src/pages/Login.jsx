import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginUser(email, password);
      navigate("/main"); // Điều hướng đến MainPage sau khi đăng nhập
    } catch (err) {
      setError(err.message || "Login failed!");
    }
  };

  const handleBack = () => {
    navigate("/"); // Điều hướng về HomePage
  };

  return (
    <div
      className="flex flex-col items-center min-h-screen bg-cover bg-center text-white p-6"
      style={{
        backgroundImage: `url('https://img.freepik.com/premium-photo/mystical-realms-chinese-style-fantasy-art-style-4_954894-52783.jpg')`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-blue-900/50 animate-background-flow"></div>
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-5xl font-extrabold my-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 animate-title-shimmer">
          Login
        </h1>
        <form
          onSubmit={handleLogin}
          className="flex flex-col items-center w-full max-w-md animate-form-rise"
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-64 px-4 py-3 text-black rounded-lg mb-4 bg-gray-200/80 shadow-lg focus:ring-4 focus:ring-blue-500/50 focus:outline-none transform hover:scale-105 transition-all duration-500 animate-input-slide"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-64 px-4 py-3 text-black rounded-lg mb-4 bg-gray-200/80 shadow-lg focus:ring-4 focus:ring-blue-500/50 focus:outline-none transform hover:scale-105 transition-all duration-500 animate-input-slide"
          />
          <div className="flex justify-center space-x-4">
            <button
              type="submit"
              className="relative px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-xl hover:from-blue-600 hover:to-indigo-700 transform hover:scale-110 hover:rotate-2 transition-all duration-500 group overflow-hidden animate-button-pop"
            >
              <span className="relative z-10">Login</span>
              <span className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-40 animate-pulse-ring transition-opacity duration-500"></span>
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="relative px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-700 rounded-lg shadow-xl hover:from-gray-600 hover:to-gray-800 transform hover:scale-110 hover:rotate-2 transition-all duration-500 group overflow-hidden animate-button-pop"
            >
              <span className="relative z-10">Back</span>
              <span className="absolute inset-0 bg-gray-400 opacity-0 group-hover:opacity-40 animate-pulse-ring transition-opacity duration-500"></span>
            </button>
          </div>
        </form>
        <p className="mt-6 text-gray-300 animate-text-fade">
          If you don't have an account,{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-blue-400 hover:text-blue-600 cursor-pointer underline transition-colors duration-300"
          >
            click here to register
          </span>
        </p>
        {error && (
          <p className="text-red-400 mt-6 animate-error-fade text-center">{error}</p>
        )}
      </div>

      <style jsx>{`
        @keyframes background-flow {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }
        @keyframes title-shimmer {
          0% { text-shadow: 0 0 5px rgba(79, 70, 229, 0.5), 0 0 10px rgba(79, 70, 229, 0.3); }
          50% { text-shadow: 0 0 15px rgba(79, 70, 229, 1), 0 0 25px rgba(79, 70, 229, 0.8); }
          100% { text-shadow: 0 0 5px rgba(79, 70, 229, 0.5), 0 0 10px rgba(79, 70, 229, 0.3); }
        }
        @keyframes form-rise {
          0% { opacity: 0; transform: translateY(20px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes input-slide {
          0% { opacity: 0; transform: translateX(-30px); }
          50% { opacity: 0.5; transform: translateX(10px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes button-pop {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.9); opacity: 0; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes error-fade {
          0% { opacity: 0; filter: blur(3px); transform: translateY(10px); }
          100% { opacity: 1; filter: blur(0); transform: translateY(0); }
        }
        @keyframes text-fade {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-background-flow {
          background-size: 300% 300%;
          animation: background-flow 15s ease infinite;
        }
        .animate-title-shimmer {
          animation: title-shimmer 3s ease-in-out infinite;
        }
        .animate-form-rise {
          animation: form-rise 0.8s ease-out;
        }
        .animate-input-slide {
          animation: input-slide 0.6s ease-out;
        }
        .animate-button-pop {
          animation: button-pop 0.6s ease-out;
        }
        .animate-pulse-ring {
          animation: pulse-ring 1s ease-out infinite;
        }
        .animate-error-fade {
          animation: error-fade 0.7s ease-out;
        }
        .animate-text-fade {
          animation: text-fade 0.7s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Login;