import React, { useState, useEffect } from "react";
import {
  FiLogOut,
  FiTrash2,
  FiEdit,
  FiUpload,
  FiBriefcase,
  FiMapPin,
  FiPhone,
  FiLock,
  FiUser,
  FiPlus,
  FiUsers,
  FiHash,
  FiCalendar,
  FiHeart,
} from "react-icons/fi";
import { IoIosColorPalette } from "react-icons/io";
import Avatar from "./Avatar";
import "./Profile.css";
import axios from "axios";

// Reusable Modal component
const Modal = ({ title, message, onConfirm, onCancel }) => (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>{title}</h3>
      <p>{message}</p>
      <div className="modal-actions">
        <button onClick={onConfirm} className="btn confirm-btn">
          Confirm
        </button>
        <button onClick={onCancel} className="btn cancel-btn">
          Cancel
        </button>
      </div>
    </div>
  </div>
);

export default function Profile({ setCurrentPage }) {
  const initialUserData = {
    name: "John Doe",
    age: 28,
    sex: "Male",
    job: "Software Engineer",
    location: "New York, USA",
    phone: "+1 555-123-4567",
    email: "john.doe@example.com",
    id: "user-12345",
    teams: [],
  };

  const [userData, setUserData] = useState(initialUserData);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarBgColor, setAvatarBgColor] = useState("#3b82f6");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [teams, setTeams] = useState(initialUserData.teams);
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch user and team data
  useEffect(() => {
    const response = axios
      .get("http://144.24.195.74:8000/api/user/show", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .catch((error) => console.error("Error fetching user:", error));

    const teamsPromise = axios
      .get("http://144.24.195.74:8000/api/user/teams", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .catch((error) => console.error("Error fetching teams:", error));

    Promise.all([response, teamsPromise]).then(
      ([userResponse, teamsResponse]) => {
        if (!userResponse || !teamsResponse) return;

        setUserData((prevData) => ({
          ...prevData,
          id: userResponse.data.id,
          name: userResponse.data.name,
          email: userResponse.data.email,
          age: userResponse.data.age ?? prevData.age,
          sex: userResponse.data.gender ?? prevData.sex,
          job: userResponse.data.job ?? prevData.job,
          location: userResponse.data.location ?? prevData.location,
          phone: userResponse.data.phone ?? prevData.phone,
          teams: teamsResponse.data.map((team) => team.name) ?? prevData.teams,
        }));
        setTeams(teamsResponse.data.map((team) => team.name));
      }
    );
  }, [token]);

  // Handlers for adding a team
  const handleAddTeam = () => {
    setIsAddingTeam(true);
  };
  const handleCancelAddTeam = () => {
    setIsAddingTeam(false);
    setNewTeamName("");
  };

  // Avatar File Change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Magic Avatar
  const handleMagicAvatar = () => {
    const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
    setAvatarBgColor(randomColor);
    setAvatarUrl(
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        userData.name
      )}&size=96&background=${randomColor.replace(
        "#",
        ""
      )}&color=fff&rounded=true&bold=true`
    );
  };

  // Form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validate
  const validateForm = () => {
    const newErrors = {};
    if (userData.age < 18) newErrors.age = "Must be at least 18 years old";
    if (!/^\+\d{1,3} \d{3}-\d{3}-\d{4}$/.test(userData.phone)) {
      newErrors.phone = "Invalid format: +[country code] XXX-XXX-XXXX";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save / Cancel
  const handleSave = () => {
    if (!validateForm()) return;
    setIsEditing(false);
  };
  const handleCancel = () => {
    // Revert to initial data
    setUserData(initialUserData);
    setAvatarUrl("");
    setAvatarBgColor("#3b82f6");
    setErrors({});
    setTeams(initialUserData.teams);
    setIsEditing(false);
    setIsAddingTeam(false);
    setNewTeamName("");
  };

  // Confirm Add Team
  const handleConfirmAddTeam = () => {
    if (newTeamName.trim()) {
      setTeams([...teams, newTeamName.trim()]);
    }
    setIsAddingTeam(false);
    setNewTeamName("");
  };

  const handleDeleteTeam = (index) => {
    setTeams(teams.filter((_, i) => i !== index));
  };

  // Logout & Delete Modals
  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("teamId");
    setCurrentPage("login");
    setShowLogoutModal(false);
  };
  const cancelLogout = () => setShowLogoutModal(false);

  const handleDelete = () => setShowDeleteModal(true);
  const confirmDelete = async () => {
    axios
      .delete("http://144.24.195.74:8000/api/user/delete", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("teamId");
        setCurrentPage("register");
        setShowDeleteModal(false);
      })
      .catch((error) => {
        console.error(
          "Error deleting user:",
          error.response ? error.response.data : error
        );
      });
  };
  const cancelDelete = () => setShowDeleteModal(false);

  // Change Team navigates to teams page
  const handleChangeTeam = () => {
    if (setCurrentPage) {
      setCurrentPage("teams");
    }
  };

  return (
    <div className="profile-page">
      {/* Modals */}
      {showLogoutModal && (
        <Modal
          title="Sign Out"
          message="Are you sure you want to sign out?"
          onConfirm={confirmLogout}
          onCancel={cancelLogout}
        />
      )}
      {showDeleteModal && (
        <Modal
          title="Delete Account"
          message="PERMANENTLY DELETE ACCOUNT? This action cannot be undone!"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      {/* Header */}
      <header
        className="profile-header"
        style={{ background: "none", boxShadow: "none" }}
      >
        <h2>User Profile</h2>
      </header>

      <main className="profile-content">
        <div className="profile-grid">
          {/* Left Card: Profile Information */}
          <div className={`profile-card ${isEditing ? "editing" : ""}`}>
            {/* Left Column: Avatar & Mini Info */}
            <div
              className="avatar-section tooltip-container"
              data-tooltip="This is your profile photo"
            >
              <div className="avatar-container">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="profile-avatar"
                  />
                ) : (
                  <Avatar
                    name={userData.name}
                    className="profile-avatar"
                    background={avatarBgColor}
                  />
                )}

                {/* Mini info under avatar: User ID, Full Name, Job */}
                <div className="mini-info">
                  <div
                    className="mini-line tooltip-container"
                    data-tooltip="Your unique user ID"
                  >
                    <FiHash className="icon" /> {userData.id}
                  </div>
                  <div
                    className="mini-line tooltip-container"
                    data-tooltip="Your display name"
                  >
                    <FiUser className="icon" /> {userData.name}
                  </div>
                  <div
                    className="mini-line tooltip-container"
                    data-tooltip="Your job title"
                  >
                    <FiBriefcase className="icon" /> {userData.job}
                  </div>
                </div>

                {/* Upload & Magic Avatar buttons only appear in edit mode */}
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
                    <button
                      className="avatar-btn magic-btn"
                      onClick={handleMagicAvatar}
                    >
                      <IoIosColorPalette className="icon" /> Magic Avatar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Profile Fields & Team Membership */}
            <div className="profile-details">
              <div className="profile-fields">
                <div
                  className="form-group tooltip-container"
                  data-tooltip="Your age"
                >
                  <label>
                    <FiCalendar className="icon" /> Age
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
                      {errors.age && (
                        <span className="error">{errors.age}</span>
                      )}
                    </>
                  ) : (
                    <div className="field-value">{userData.age}</div>
                  )}
                </div>

                <div
                  className="form-group tooltip-container"
                  data-tooltip="Your gender"
                >
                  <label>
                    <FiHeart className="icon" /> Gender
                  </label>
                  {isEditing ? (
                    <select
                      name="sex"
                      value={userData.sex}
                      onChange={handleInputChange}
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  ) : (
                    <div className="field-value">{userData.sex}</div>
                  )}
                </div>

                <div
                  className="form-group tooltip-container"
                  data-tooltip="Your location"
                >
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

                <div
                  className="form-group tooltip-container"
                  data-tooltip="Your phone number"
                >
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
                  <div
                    className="form-group tooltip-container"
                    data-tooltip="Change your password"
                  >
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

              {/* Team Membership Section under the profile fields */}
              <div
                className="teams-section2 tooltip-container"
                data-tooltip="Teams you belong to"
              >
                <h3>
                  <FiUsers className="icon" /> Team Memberships
                </h3>
                <div className="teams-list">
                  {teams.map((team, idx) => (
                    <div key={idx} className="team-chip">
                      #{team}
                      {isEditing && (
                        <button
                          className="delete-team-btn"
                          onClick={() => handleDeleteTeam(idx)}
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}

                  {isEditing &&
                    (isAddingTeam ? (
                      <div className="add-team-inline">
                        <input
                          type="text"
                          value={newTeamName}
                          onChange={(e) => setNewTeamName(e.target.value)}
                          placeholder="Team name"
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
                    ) : (
                      <button className="add-team-btn" onClick={handleAddTeam}>
                        <FiPlus className="icon" />
                      </button>
                    ))}
                </div>
              </div>

              {/* Save & Cancel buttons when editing */}
              {isEditing && (
                <div className="edit-actions">
                  <button className="save-changes-btn" onClick={handleSave}>
                    Save
                  </button>
                  <button className="cancel-changes-btn" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Card: Options */}
          <div
            className="options-card tooltip-container"
            data-tooltip="Manage your account settings"
          >
            <h3>Account Settings</h3>
            <button
              className="option-btn tooltip-container"
              data-tooltip="Toggle editing mode"
              onClick={() => setIsEditing(!isEditing)}
            >
              <FiEdit />
              {isEditing ? "Cancel Editing" : "Edit Profile"}
            </button>
            <button
              className="option-btn tooltip-container"
              data-tooltip="Switch to another team"
              onClick={handleChangeTeam}
            >
              <FiUsers />
              Change Team
            </button>
            <hr className="separator" />
            <button
              className="option-btn red-btn tooltip-container"
              data-tooltip="Sign out of your account"
              onClick={handleLogout}
            >
              <FiLogOut />
              Sign Out
            </button>
            <button
              className="option-btn red-btn tooltip-container"
              data-tooltip="Delete your account permanently"
              onClick={handleDelete}
            >
              <FiTrash2 />
              Delete Account
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
