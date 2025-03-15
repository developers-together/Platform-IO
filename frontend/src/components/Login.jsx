import { useState } from "react";
import axios from "axios";
import { FiMail, FiLock, FiAlertCircle } from "react-icons/fi";
import "./Login.css";

export default function Login({ setCurrentPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/api/login", {
        email,
        password,
      });
      setCurrentPage("dashboard");
    } catch (error) {
      console.log(error.response?.data?.message);
      setError(
        error.response?.data?.message ||
          "Invalid email or password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Sign in to continue</p>
        </div>
        {error && (
          <div className="error-message2">
            <FiAlertCircle className="error-icon2" />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <FiMail className="input-icon" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="login-input"
            />
          </div>

          <div className="input-group">
            <FiLock className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-input"
            />
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? <div className="spinner"></div> : "Sign In"}
          </button>
        </form>
        <button
          className="skip-button"
          onClick={() => setCurrentPage("dashboard")}
        >
          SKIP
        </button>{" "}
        {/*temp skip button for debugging*/}
        <p className="login-footer">
          Don't have an account?{" "}
          <span
            onClick={() => setCurrentPage("register")}
            className="register-link"
          >
            Create Account
          </span>
        </p>
      </div>
    </div>
  );
}
