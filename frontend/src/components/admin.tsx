import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode, JwtPayload } from "jwt-decode";
import "./../styles/admin.css";

interface CustomJwtPayload extends JwtPayload {
  mspId?: string;
}

const Admin = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check JWT and display the upload based on MSP
  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      try {
        const decodedToken = jwtDecode<CustomJwtPayload>(jwt);
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
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const usernameInput = form.elements.namedItem('username') as HTMLInputElement;
    const passwordInput = form.elements.namedItem('password') as HTMLInputElement;
    const fileInput = form.elements.namedItem('file') as HTMLInputElement;

    const formData = new FormData();
    formData.append("username", usernameInput.value);
    formData.append("password", passwordInput.value);

    if (showUpload && fileInput && fileInput.files && fileInput.files.length > 0) {
      formData.append("file", fileInput.files[0]);
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

      await response.text();
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