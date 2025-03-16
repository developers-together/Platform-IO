import React, { useState } from "react";
import {
  FiLogOut,
  FiTrash2,
  FiEdit,
  FiUpload,
  FiUser,
  FiUsers,
  FiBriefcase,
  FiMapPin,
  FiPhone,
  FiLock,
  FiPlus,
} from "react-icons/fi";
import { IoIosColorPalette } from "react-icons/io"; // color palette icon
import Avatar from "./Avatar";
import "./Profile.css";

const initialUserData = {
  name: "John Doe",
  age: 28,
  sex: "Male",
  job: "Software Engineer",
  location: "New York, USA",
  phone: "+1 555-123-4567",
  email: "john.doe@example.com",
  id: "user-12345",
  teams: ["Team Alpha", "Design Squad", "Frontend Warriors", "Beta Testers"],
};

export default function Profile() {
  const [userData, setUserData] = useState(initialUserData);
  const [isEditing, setIsEditing] = useState(false);

  // Merged logic for color + generate
  const [avatarUrl, setAvatarUrl] = useState("");
  // We keep a fallback color in case user hasn't generated or uploaded an avatar
  const [avatarBgColor, setAvatarBgColor] = useState("#4dabf7");

  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [teams, setTeams] = useState(initialUserData.teams);

  // Inline add-team
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");

  // Custom modals for logout/delete
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ============================
  //        HANDLERS
  // ============================

  // 1) Upload local file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // 2) “Magic Avatar” merges color + generate
  const handleMagicAvatar = () => {
    // 1) Generate random color
    const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
    setAvatarBgColor(randomColor);

    // 2) Generate UI Avatars URL
    setAvatarUrl(
      `https://ui-avatars.com/api/?name=${
        userData.name
      }&size=96&background=${randomColor.replace(
        "#",
        ""
      )}&color=fff&rounded=true&bold=true`
    );
  };

  // 3) Form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // 4) Validate
  const validateForm = () => {
    const newErrors = {};
    if (userData.age < 18) newErrors.age = "Must be at least 18 years old";
    if (!/^\+\d{1,3} \d{3}-\d{3}-\d{4}$/.test(userData.phone)) {
      newErrors.phone =
        "Format: +[country code] [3 digits]-[3 digits]-[4 digits]";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 5) Save
  const handleSave = () => {
    if (!validateForm()) return;
    setIsEditing(false);
    // Add any additional save logic or API calls
  };

  // 6) Cancel
  const handleCancel = () => {
    setUserData(initialUserData);
    setAvatarUrl("");
    setAvatarBgColor("#4dabf7");
    setErrors({});
    setTeams(initialUserData.teams);
    setIsEditing(false);
    setIsAddingTeam(false);
    setNewTeamName("");
  };

  // 7) Teams
  const handleAddTeam = () => setIsAddingTeam(true);

  const handleConfirmAddTeam = () => {
    if (newTeamName.trim()) {
      setTeams([...teams, newTeamName.trim()]);
    }
    setIsAddingTeam(false);
    setNewTeamName("");
  };

  const handleCancelAddTeam = () => {
    setIsAddingTeam(false);
    setNewTeamName("");
  };

  // 8) Logout & Delete modals
  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    console.log("Logout action");
    setShowLogoutModal(false);
  };
  const cancelLogout = () => setShowLogoutModal(false);

  const handleDelete = () => setShowDeleteModal(true);
  const confirmDelete = () => {
    console.log("Delete action");
    setShowDeleteModal(false);
  };
  const cancelDelete = () => setShowDeleteModal(false);

  // ============================
  //        RENDER
  // ============================
  return (
    <div className="profile-page">
      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Sign Out</h3>
            <p>Are you sure you want to sign out?</p>
            <div className="modal-actions">
              <button onClick={confirmLogout} className="btn confirm-btn">
                Yes
              </button>
              <button onClick={cancelLogout} className="btn cancel-btn">
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Account</h3>
            <p>PERMANENTLY DELETE ACCOUNT? This action cannot be undone!</p>
            <div className="modal-actions">
              <button onClick={confirmDelete} className="btn confirm-btn">
                Yes
              </button>
              <button onClick={cancelDelete} className="btn cancel-btn">
                No
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="profile-header">
        <h2>User Profile</h2>
        <button
          className="edit-toggle"
          onClick={() => setIsEditing(!isEditing)}
        >
          <FiEdit className="icon" />
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </header>

      <main className="profile-content">
        <div className="profile-card">
          {/* Avatar Section */}
          <div className="avatar-section">
            <div className="avatar-container">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="profile-avatar" />
              ) : (
                // fallback <Avatar> if no file or URL
                <Avatar
                  key={avatarBgColor} // ensures re-render on color changes
                  name={userData.name}
                  className="profile-avatar"
                  background={avatarBgColor}
                />
              )}
              {isEditing && (
                <div className="avatar-controls">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    id="avatar-upload"
                    hidden
                  />
                  <label htmlFor="avatar-upload" className="avatar-btn">
                    <FiUpload className="icon" /> Upload
                  </label>

                  {/* The single “Magic Avatar” button merges color + generate */}
                  <button
                    className="avatar-btn magic-btn"
                    onClick={handleMagicAvatar}
                  >
                    <IoIosColorPalette className="icon" />
                    Magic Avatar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="profile-details">
            <div className="profile-fields">
              <div className="form-group">
                <label>
                  <FiUser className="icon" /> Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={userData.name}
                    onChange={handleInputChange}
                  />
                ) : (
                  <div className="field-value">{userData.name}</div>
                )}
              </div>

              <div className="form-group">
                <label>
                  <FiUser className="icon" /> Age
                </label>
                {isEditing ? (
                  <>
                    <input
                      type="number"
                      name="age"
                      value={userData.age}
                      onChange={handleInputChange}
                      min="18"
                    />
                    {errors.age && <span className="error">{errors.age}</span>}
                  </>
                ) : (
                  <div className="field-value">{userData.age}</div>
                )}
              </div>

              <div className="form-group">
                <label>
                  <FiUser className="icon" /> Gender
                </label>
                {isEditing ? (
                  <select
                    name="sex"
                    value={userData.sex}
                    onChange={handleInputChange}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <div className="field-value">{userData.sex}</div>
                )}
              </div>

              <div className="form-group">
                <label>
                  <FiBriefcase className="icon" /> Job
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="job"
                    value={userData.job}
                    onChange={handleInputChange}
                  />
                ) : (
                  <div className="field-value">{userData.job}</div>
                )}
              </div>

              <div className="form-group">
                <label>
                  <FiMapPin className="icon" /> Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={userData.location}
                    onChange={handleInputChange}
                  />
                ) : (
                  <div className="field-value">{userData.location}</div>
                )}
              </div>

              <div className="form-group">
                <label>
                  <FiPhone className="icon" /> Phone
                </label>
                {isEditing ? (
                  <>
                    <input
                      type="tel"
                      name="phone"
                      value={userData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 555-123-4567"
                    />
                    {errors.phone && (
                      <span className="error">{errors.phone}</span>
                    )}
                  </>
                ) : (
                  <div className="field-value">{userData.phone}</div>
                )}
              </div>

              {isEditing && (
                <div className="form-group">
                  <label>
                    <FiLock className="icon" /> New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
              )}
            </div>

            <div className="teams-section">
              <h3>
                <FiUsers className="icon" /> Team Memberships
              </h3>
              <div className="teams-list">
                {teams.map((team, idx) => (
                  <div key={idx} className="team-chip">
                    #{team}
                  </div>
                ))}

                {isEditing && !isAddingTeam && (
                  <button
                    className="add-team-btn"
                    onClick={() => setIsAddingTeam(true)}
                  >
                    <FiPlus className="icon" />
                  </button>
                )}

                {isEditing && isAddingTeam && (
                  <div className="add-team-inline">
                    <input
                      type="text"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="New team"
                    />
                    <button
                      className="inline-confirm"
                      onClick={handleConfirmAddTeam}
                    >
                      Add
                    </button>
                    <button
                      className="inline-cancel"
                      onClick={handleCancelAddTeam}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="profile-footer">
        {isEditing ? (
          <>
            <button className="btn save-btn" onClick={handleSave}>
              Save Changes
            </button>
            <button className="btn cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button className="btn logout-btn" onClick={handleLogout}>
              <FiLogOut className="icon" /> Sign Out
            </button>
            <button className="btn delete-btn" onClick={handleDelete}>
              <FiTrash2 className="icon" /> Delete Account
            </button>
          </>
        )}
      </footer>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Sign Out</h3>
            <p>Are you sure you want to sign out?</p>
            <div className="modal-actions">
              <button onClick={confirmLogout} className="btn confirm-btn">
                Yes
              </button>
              <button onClick={cancelLogout} className="btn cancel-btn">
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Account</h3>
            <p>PERMANENTLY DELETE ACCOUNT? This action cannot be undone!</p>
            <div className="modal-actions">
              <button onClick={confirmDelete} className="btn confirm-btn">
                Yes
              </button>
              <button onClick={cancelDelete} className="btn cancel-btn">
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
