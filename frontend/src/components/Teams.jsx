import { useEffect, useState } from "react";
import axios from "axios";
import "./Teams.css";

export default function Teams({ setCurrentPage }) {
  const token = localStorage.getItem("token");
  const [teams, setTeams] = useState([]);
  const [joinCode, setJoinCode] = useState("");
  const [teamName, setTeamName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");

  // For inline adding a team (if needed)
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");

  const getTeams = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/user/teams", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      return response.data.teams;
    } catch (error) {
      console.error("Error fetching teams:", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchTeams = async () => {
      const t = await getTeams();
      const formattedTeams = t.map((team) => ({
        id: team.id,
        name: team.name,
        projectname: team.projectname,
        description: team.description,
        code: team.code,
        visible: false,
      }));
      setTeams(formattedTeams);
    };
    fetchTeams();
  }, []);

  const toggleVisibility = (id) => {
    setTeams(
      teams.map((team) =>
        team.id === id ? { ...team, visible: !team.visible } : team
      )
    );
  };

  const joinTeam = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/team/joinTeam",
        { code: joinCode.toUpperCase() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      console.log("Joined team:", response.data);
    } catch (error) {
      console.error(
        "Error joining team:",
        error.response?.data || error.message
      );
    }
  };

  const createTeam = async () => {
    if (!teamName.trim() || !projectName.trim() || !teamDescription.trim())
      return;

    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      const response = await axios.post(
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
    } catch (error) {
      console.error(
        "Error creating team:",
        error.response?.data || error.message
      );
      return;
    }

    setTeams([
      ...teams,
      {
        id: teams.length + 1,
        name: teamName,
        projectname: projectName,
        description: teamDescription,
        code: newCode,
        visible: false,
      },
    ]);

    // Reset creation fields
    setTeamName("");
    setProjectName("");
    setTeamDescription("");
  };

  const leaveTeam = async (id) => {
    try {
      await axios.post(
        `http://localhost:8000/api/team/${id}/leave`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      setTeams(teams.filter((team) => team.id !== id));
    } catch (error) {
      console.error(
        "Error leaving team:",
        error.response?.data || error.message
      );
    }
  };

  const goToDashboard = (id) => {
    localStorage.setItem("teamId", id);
    setCurrentPage("dashboard");
  };

  return (
    <div className="teams-container">
      <h2>Teams</h2>
      <ul className="teams-list">
        {teams.map((team) => (
          <li key={team.id} className="team-item">
            <span
              className="team-name"
              onClick={() => goToDashboard(team.id)}
              title="Go to team dashboard"
            >
              {team.name}
            </span>
            <span className="team-project">{team.projectname}</span>
            <span className="team-description">{team.description}</span>
            <span className="team-code">
              {team.visible ? team.code : "******"}
            </span>
            <div className="team-actions">
              <button
                className="toggle-btn"
                onClick={() => toggleVisibility(team.id)}
              >
                {team.visible ? "Hide" : "Show"}
              </button>
              <button className="leave-btn" onClick={() => leaveTeam(team.id)}>
                Leave Team
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="actions">
        <input
          type="text"
          placeholder="Enter Team Code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          className="join-input"
        />
        <button className="join-btn" onClick={joinTeam}>
          Join Team
        </button>

        <input
          type="text"
          placeholder="Enter Team Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="join-input"
        />
        <input
          type="text"
          placeholder="Enter Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="join-input"
        />
        <input
          type="text"
          placeholder="Enter Team Description"
          value={teamDescription}
          onChange={(e) => setTeamDescription(e.target.value)}
          className="join-input"
        />
        <button className="create-btn" onClick={createTeam}>
          Create Team
        </button>
      </div>
    </div>
  );
}
