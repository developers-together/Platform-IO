import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Avatar from "./Avatar"; // UI Avatars-based component
import { FaFan } from "react-icons/fa"; // Rotating fan icon for header
import "./Teams.css";

/**
 * Rotating fan icon component (with normal/hover/click speeds)
 */
function RotatingFanIcon({ size = 128 }) {
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef();
  const prevTimeRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [fastMode, setFastMode] = useState(false);

  useEffect(() => {
    const normalSpeed = 360 / 5000; // 5 seconds per rotation
    const hoverSpeed = 360 / 2500; // 2.5 seconds per rotation
    const clickSpeed = 360 / 1000; // 1 second per rotation

    const animate = (time) => {
      if (!prevTimeRef.current) prevTimeRef.current = time;
      const delta = time - prevTimeRef.current;
      prevTimeRef.current = time;
      const currentSpeed = fastMode
        ? clickSpeed
        : hovered
        ? hoverSpeed
        : normalSpeed;
      setRotation((prev) => (prev + currentSpeed * delta) % 360);
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [hovered, fastMode]);

  const handleClick = () => {
    setFastMode((prev) => !prev);
  };

  return (
    <div
      className="fan-icon-container"
      style={{ width: size, height: size }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      <FaFan
        style={{
          transform: `rotate(${rotation}deg)`,
          width: "100%",
          height: "100%",
          cursor: "pointer",
        }}
      />
    </div>
  );
}

/* Simple modal for confirming leaving a team */
function LeaveModal({ teamId, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Leave Team</h3>
        <p>Are you sure you want to leave this team?</p>
        <div className="modal-actions">
          <button onClick={() => onConfirm(teamId)} className="btn confirm-btn">
            Yes, Leave
          </button>
          <button onClick={onCancel} className="btn cancel-btn">
            Don't Leave
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Teams({ setCurrentPage }) {
  const token = localStorage.getItem("token");
  const [teams, setTeams] = useState([]);
  const [menuTeamId, setMenuTeamId] = useState(null);
  const [showTeamCode, setShowTeamCode] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [teamName, setTeamName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [leaveModalTeamId, setLeaveModalTeamId] = useState(null);

  // Fetch teams from API
  const getTeams = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/user/teams", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching teams:", error);
      return [];
    }
  };

  const fetchTeams = async () => {
    const t = await getTeams();
    const formatted = t.map((team) => ({
      id: team.id,
      name: team.name,
      projectname: team.projectname,
      description: team.description,
      code: team.code,
    }));
    setTeams(formatted);
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // Navigate to dashboard
  const goToDashboard = (id) => {
    localStorage.setItem("teamId", id);
    setCurrentPage("dashboard");
  };

  // Toggle three-dots menu
  const toggleTeamMenu = (id, e) => {
    e.stopPropagation();
    setMenuTeamId((prev) => (prev === id ? null : id));
    setShowTeamCode(false);
  };

  // Show code dialog
  const handleShowCode = (id, e) => {
    e.stopPropagation();
    setMenuTeamId(id);
    setShowTeamCode(true);
  };

  // Open leave modal instead of immediate deletion
  const handleLeaveTeam = (id, e) => {
    e.stopPropagation();
    setLeaveModalTeamId(id);
  };

  const confirmLeaveTeam = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/team/${id}/delete`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      setTeams((prev) => prev.filter((team) => team.id !== id));
    } catch (error) {
      console.error(
        "Error leaving team:",
        error.response?.data || error.message
      );
    }
    setMenuTeamId(null);
    setShowTeamCode(false);
    setLeaveModalTeamId(null);
  };

  // Join team
  const joinTeam = async () => {
    if (!joinCode.trim()) return;
    try {
      await axios.post(
        "http://localhost:8000/api/team/joinTeam",
        { code: joinCode.toUpperCase() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      fetchTeams();
    } catch (error) {
      console.error(
        "Error joining team:",
        error.response?.data || error.message
      );
    }
    setJoinCode("");
    setShowAddDialog(false);
  };

  // Create team
  const createTeam = async () => {
    if (!teamName.trim() || !projectName.trim() || !teamDescription.trim())
      return;
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      await axios.post(
        "http://localhost:8000/api/team/create",
        {
          name: teamName,
          projectname: projectName,
          description: teamDescription,
          code: newCode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      setTeams((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          name: teamName,
          projectname: projectName,
          description: teamDescription,
          code: newCode,
        },
      ]);
    } catch (error) {
      console.error(
        "Error creating team:",
        error.response?.data || error.message
      );
    }
    setTeamName("");
    setProjectName("");
    setTeamDescription("");
    setShowAddDialog(false);
  };

  const closeAddDialog = () => {
    setShowAddDialog(false);
    setJoinCode("");
    setTeamName("");
    setProjectName("");
    setTeamDescription("");
  };

  return (
    <div className="teams-page">
      {/* Header area */}
      <div className="teams-header">
        <RotatingFanIcon size={60} />
        <h2 className="teams-headline">Which team do you want to log into?</h2>
      </div>

      {/* Cards container */}
      <div className="teams-cards-container">
        {teams.map((team) => (
          <div
            key={team.id}
            className="team-card"
            onClick={() => goToDashboard(team.id)}
          >
            <div className="team-avatar-container">
              {/* Full-width square avatar taking half the card's height */}
              <Avatar
                name={team.name}
                options={{
                  size: "200", // Adjust size as needed
                  background: "0052d4",
                  color: "fff",
                  bold: true,
                  rounded: false, // square avatar
                }}
                className="team-avatar"
              />
              <button
                className="team-menu-btn"
                onClick={(e) => toggleTeamMenu(team.id, e)}
              >
                &#8942;
              </button>
            </div>
            <div className="team-info">
              <div className="info-item">
                <span className="info-title">Team Name:</span>
                <span className="info-value" title="Team Name">
                  {team.name}
                </span>
              </div>
              <div className="info-item">
                <span className="info-title">Project:</span>
                <span className="info-value" title="Project Name">
                  {team.projectname}
                </span>
              </div>
              <div className="info-item">
                <span className="info-title">Description:</span>
                <span className="info-value" title="Description">
                  {team.description}
                </span>
              </div>
            </div>
            {menuTeamId === team.id && !showTeamCode && (
              <div
                className="team-menu-dialog"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="team-menu-item"
                  onClick={(e) => handleShowCode(team.id, e)}
                >
                  Show Code
                </button>
                <button
                  className="team-menu-item2"
                  onClick={(e) => handleLeaveTeam(team.id, e)}
                >
                  Leave
                </button>
              </div>
            )}
            {menuTeamId === team.id && showTeamCode && (
              <div
                className="team-code-dialog"
                onClick={(e) => e.stopPropagation()}
              >
                <p>Team Code: {team.code}</p>
                <button
                  onClick={() => {
                    setMenuTeamId(null);
                    setShowTeamCode(false);
                  }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        ))}

        {/* "Add" card */}
        <div
          className="team-card add-card"
          onClick={() => setShowAddDialog(true)}
        >
          <div className="add-card-content">
            <span className="plus-icon">+</span>
            <p>Add</p>
          </div>
        </div>
      </div>

      {/* "Add" Dialog */}
      {showAddDialog && (
        <div className="add-dialog-overlay">
          <div className="add-dialog-content2">
            <button className="close-dialog-btn" onClick={closeAddDialog}>
              &times;
            </button>
            <div className="join-create-options">
              <div className="join-team-box">
                <h3>Join Team</h3>
                <input
                  maxLength={6}
                  type="text"
                  placeholder="Team Code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="join-input"
                />
                <button className="join-btn" onClick={joinTeam}>
                  Join
                </button>
              </div>
              <div className="create-team-box">
                <h3>Create Team</h3>
                <input
                  type="text"
                  placeholder="Team Name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="create-input"
                />
                <input
                  type="text"
                  placeholder="Project Name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="create-input"
                />
                <input
                  type="text"
                  placeholder="Team Description"
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  className="create-input"
                />
                <button className="create-btn" onClick={createTeam}>
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Modal */}
      {leaveModalTeamId && (
        <LeaveModal
          teamId={leaveModalTeamId}
          onConfirm={confirmLeaveTeam}
          onCancel={() => setLeaveModalTeamId(null)}
        />
      )}
    </div>
  );
}
