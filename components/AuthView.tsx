import React, { useState } from "react";
import axios from "axios";

interface AuthViewProps {
  onLogin: (user: any) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | "warning"
  >();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setMessageType(undefined);

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setMessage("⚠️ Passwords do not match.");
      setMessageType("warning");
      return;
    }

    try {
      if (isLogin) {
        const res = await axios.post("http://localhost:5000/login", {
          email: formData.email,
          password: formData.password,
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        setMessage("✅ Login successful!");
        setMessageType("success");
        onLogin(res.data.user);
      } else {
        const res = await axios.post("http://localhost:5000/signup", {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });

        setMessage(res.data.message || "✅ Signup successful! Please login.");
        setMessageType("success");
        setIsLogin(true);
      }
    } catch (err: any) {
      if (isLogin) {
        setMessage("❌ Invalid credentials.");
      } else {
        setMessage("❌ Something went wrong. Please try again.");
      }
      setMessageType("error");
    }
  };

  const getAlertStyle = () => {
    switch (messageType) {
      case "success":
        return "bg-green-100 text-green-800 border border-green-300";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "error":
        return "bg-red-100 text-red-800 border border-red-300";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      {/* Main Auth Card */}
      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 mt-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <img
              src="/logo.jpg"
              alt="Logo"
              className="mx-auto w-16 h-16 object-contain"
            />
            <h1 className="text-2xl font-bold text-gray-800 mt-4">
              Welcome to CodePilot
            </h1>
            <p className="text-gray-500 text-sm">
              Your AI-powered coding assistant.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex mb-6 border-b">
            <button
              className={`flex-1 py-2 text-lg font-medium ${
                isLogin
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2 text-lg font-medium ${
                !isLogin
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {!isLogin && (
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            )}

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
            >
              {isLogin ? "Login" : "Sign Up"}
            </button>
          </form>

          {/* Message */}
          {message && (
            <div
              className={`mt-4 text-center text-sm px-4 py-2 rounded ${getAlertStyle()}`}
            >
              {message}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white shadow-inner py-4 mt-8 text-center text-gray-500 text-sm">
        <p>© 2025 CodePilot. All rights reserved.</p>
        <p>Made with ❤️ by Sanket Team</p>
      </footer>
    </div>
  );
};

export default AuthView;
