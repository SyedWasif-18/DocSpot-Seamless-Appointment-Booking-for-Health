import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AuthPages.css";

const API_URL = "http://localhost:5000/api/v1/user";

const AuthPages = () => {
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regType, setRegType] = useState("patient");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setLoginError("");
    setRegError("");
    setRegSuccess("");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await axios.post(`${API_URL}/login`, {
        email: loginEmail,
        password: loginPassword,
      });

      if (res.data.token) {
        const user = res.data.user;
        if (user.type === "doctor" && !user.isdoctor) {
          setLoginError("Your application is still under review by the admin.");
          return;
        }
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(user));

        if (user.isAdmin) {
          navigate("/admin-dashboard");
        } else if (user.type === "doctor") {
          navigate("/dashboard/doctor");
        } else {
          navigate("/dashboard/patient");
        }
      }
    } catch (err) {
      setLoginError(err.response?.data?.message || "Login failed");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");

    if (regPassword.length < 6) {
      setRegError("Password must be at least 6 characters");
      return;
    }

    try {
      const payload = {
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        type: regType,
      };

      if (regType === "doctor") {
        payload.specialization = "General";
        payload.experience = "0 years";
        payload.location = "Not set";
        payload.fee = 0;
      }

      const res = await axios.post(`${API_URL}/register`, payload);

      if (regType === "doctor") {
        setRegSuccess("Registration submitted! Please wait for admin approval.");
      } else {
        setRegSuccess("Registration successful! You can now log in.");
      }

      setRegName("");
      setRegEmail("");
      setRegPhone("");
      setRegPassword("");
      setRegType("patient");

      setTimeout(() => setIsFlipped(false), 1500);
    } catch (err) {
      setRegError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <video autoPlay loop muted className="background-video">
        <source src="http://localhost:5000/uploads/dna-video.mp4" type="video/mp4" />
      </video>

      <div className="flip-container">
        <div className={`auth-card ${isFlipped ? "flipped" : ""}`}>

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="form-content login-face">
            <h2>Welcome to <span className="neon-text">DocSpot 🩺</span></h2>
            <input type="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="form-input" required />
            <input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="form-input" required />
            {loginError && <p className="error-msg">{loginError}</p>}
            <button type="submit" className="form-button">Login</button>
            <p className="toggle-link">Don’t have an account? <span onClick={handleFlip}>Sign up</span></p>
          </form>

          {/* Register Form */}
          <form onSubmit={handleRegisterSubmit} className="form-content register-face">
            <h2>Register for <span className="neon-text">DocSpot 🩺</span></h2>
            <input type="text" placeholder="Name" value={regName} onChange={(e) => setRegName(e.target.value)} className="form-input" required />
            <input type="email" placeholder="Email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="form-input" required />
            <input type="text" placeholder="Phone" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} className="form-input" required />
            <input type="password" placeholder="Password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="form-input" required />
            <select value={regType} onChange={(e) => setRegType(e.target.value)} className="form-input" required>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
            {regError && <p className="error-msg">{regError}</p>}
            {regSuccess && <p className="success-msg">{regSuccess}</p>}
            <button type="submit" className="form-button">Register</button>
            <p className="toggle-link">Already have an account? <span onClick={handleFlip}>Login</span></p>
          </form>

        </div>
      </div>
    </div>
  );
};

export default AuthPages;