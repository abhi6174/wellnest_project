import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./../styles/admin.css";

const Admin = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check JWT and display the upload based on MSP
  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      try {
        const decodedToken = jwtDecode(jwt);
        if (decodedToken.mspId === "Org2MSP") {
          setShowUpload(true);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("jwt");
    navigate("/login"); // Redirect to Login Page
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("username", e.target.username.value);
    formData.append("password", e.target.password.value);

    if (showUpload && e.target.file.files.length > 0) {
      formData.append("file", e.target.file.files[0]);
    }

    const jwt = localStorage.getItem("jwt");
    try {
      const response = await fetch("http://localhost:8080/fabric/register", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Network error");
      }

      const data = await response.text();
      alert("User registered successfully!");
    } catch (error) {
      console.error("Registration Error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      {/* <div className="logout-container">
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div> */}

      <div className="form-container">
        <h1 className="form-title">Add User</h1>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="input-group">
            <i className="fas fa-user"></i>
            <input type="text" name="username" placeholder="User Name" required />
          </div>

          <div className="input-group">
            <i className="fas fa-lock"></i>
            <input type="password" name="password" placeholder="Password" required />
          </div>

          {showUpload && (
            <div className="input-group">
              <i className="fas fa-file-upload"></i>
              <input type="file" id="file" name="file" accept=".pdf" />
              <label htmlFor="file">Upload PDF</label>
            </div>
          )}

          <div className="button-container">
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Loading..." : "Add User"}
            </button>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Admin;