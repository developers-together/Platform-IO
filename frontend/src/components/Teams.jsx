import { use, useEffect, useState } from "react";
import "./Teams.css";
import axios from "axios";

export default function Teams() {
    const token = localStorage.getItem("token");
    const [teams, setTeams] = useState([{ id: 1, name: "Team Alpha", code: "A1B2C3", visible: false,description:"Team Alpha is a team of developers working on a project"},
        { id: 2, name: "Team Beta", code: "D4E5F6", visible: false, description:"hi"},]);
    const [joinCode, setJoinCode] = useState("");
    const [teamName, setTeamName] = useState("");

    const getTeams = async (token) => {
        try {
            const response = await axios.get(`http://localhost:8000/api/user/teams`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json",
                },
            });
            return response.data.teams;  // Properly return the data
        } catch (error) {
            console.error("Error:", error);
            return [];  // Return an empty array to prevent errors in `.map()`
        }
    };

useEffect(() => {
    const fetchTeams = async () => {
        const t = await getTeams(token);  // Wait for the async function to resolve
         const formattedTeams = t.map(
            (team) => ({
                id: team.id,
                name: team.name,
                description: team.description,
                code: team.code,
                visible: false 
            })
        );
        setTeams(formattedTeams);
    };
    fetchTeams();
    // console.log(t);
}, [token]);
    

    const toggleVisibility = (id) => {
        setTeams(teams.map(team => 
            team.id === id ? { ...team, visible: !team.visible } : team
        ));
    };

    const joinTeam = () => {
        if (!joinCode.trim()) return;
        alert(`Joining team with code: ${joinCode}`);
        setJoinCode("");
    };

    const createTeam = async () => {
        const newCode = Math.random().toString(36).substring(2, 8).toUpperCase(); 
        const newTeam = { id: teams.length + 1, name: teamName, code: newCode, visible: false };
        try{
            const response = await axios.post("http://localhost:8000/api/team/create", {
                "name": teamName,
                "projectname": teamName,
                "description": "New Team",
                "code": newCode
            },
            {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json",
                }
            });
        } catch (error) {
            console.error("Error creating team:", error.response?.data || error.message);
            return;
        }
        setTeams([...teams, newTeam]);
    };

    return (
        <div className="teams-container">
            <h2>Teams</h2>
            <ul className="teams-list">
                {teams.map((team) => (
                    <li key={team.id} className="team-item">
                        <span className="team-name">{team.name}</span>
                        <span className="team-desciption">{team.description}</span>
                        <span className="team-code">{team.visible ? team.code : "******"}</span>
                        <button className="toggle-btn" onClick={() => toggleVisibility(team.id)}>
                            {team.visible ? "Hide" : "Show"}
                        </button>
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
                <button className="join-btn" onClick={joinTeam}>Join Team</button>
                <input 
                    type = "test" 
                    placeholder="Enter Team Name"
                    value={teamName} 
                    onChange={(e) => setTeamName(e.target.value)}
                    className="join-input" 
                />
                <button className="create-btn" onClick={createTeam}>Create Team</button>
            </div>
        </div>
    );
}
