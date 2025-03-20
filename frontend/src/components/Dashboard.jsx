import { useState, useEffect, useMemo, useRef } from "react";
import {
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiCornerUpLeft,
  FiImage,
  FiMoreHorizontal,
  FiPhone,
  FiSend,
  FiTrash2,
  FiVideo,
  FiXCircle,
  FiPlus,
  FiEdit2,
} from "react-icons/fi";
import "./Dashboard.css";
import axios from "axios";

// ---------------- AISUGGESTED ACTIONS CARD ----------------
function AISuggestedActionsCard() {
  const [suggestions, setSuggestions] = useState([]);
  const token = localStorage.getItem("token");
  const teamId = localStorage.getItem("teamId");

  useEffect(() => {
    // Example endpoint for AI suggestions; adjust if needed.
    const fetchSuggestions = async () => {
      try {
        const response = await axios.get(
          `http://144.24.195.74:8000/api/tasks/${teamId}/suggestions`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        console.log(response.data.data);
        const formattedSuggestions = response.data.data.map((suggestion, ind) => ({
          text: suggestion.title,
          index: ind,
        }));
        
        console.log(formattedSuggestions);
        setSuggestions(formattedSuggestions);
      } catch (error) {
        console.error("Error fetching AI suggestions:", error);
      }
    };
    fetchSuggestions();
  }, [teamId, token]);

  return (
    <div className="card ai-card">
      <h3>AI Suggested Actions</h3>
      <ul>
        {suggestions.length === 0 ? (
          <li style={{ color: "white" }}>No suggestions yet</li>
        ) : (
          suggestions.map((suggestion, index) => (
            <li key={index} className="ai-item">
              <span>{suggestion.text}</span>
              <div className="ai-actions">
                <button className="action-btn2 accept" title="Accept suggestion">
                  <FiCheck />
                </button>
                <button className="action-btn2 reject" title="Reject suggestion">
                  <FiX />
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

// ---------------- TASKS CARD ----------------
function TasksCard({ setCurrentPage }) {
  const [tasks, setTasks] = useState([]);
  const token = localStorage.getItem("token");
  const teamId = localStorage.getItem("teamId");

  useEffect(() => {
    // Fetch incomplete tasks from the API
    const fetchTasks = async () => {
      try {
        const response = await axios.get(
          `http://144.24.195.74:8000/api/tasks/${teamId}/index`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        const allTasks = response.data?.data || [];
        const incomplete = allTasks
          .filter((t) => !t.completed)
          .map((t) => ({
            id: t.id,
            title: t.title || "Untitled Task",
            description: t.description || "",
            dueDate: t.end || "",
            createdAt: t.created_at || "",
            starred: t.stared || false,
          }));
        setTasks(incomplete.slice(0, 5));
      } catch (error) {
        console.error("Error fetching tasks for Dashboard:", error);
      }
    };
    fetchTasks();
  }, [teamId, token]);

  // Mark a task as completed using the same API as in your Tasks page.
  const completeTask = async (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    try {
      await axios.put(
        `http://144.24.195.74:8000/api/tasks/${taskId}/update`,
        {
          title: task.title,
          description: task.description,
          completed: true,
          stared: task.starred,
          start: new Date().toISOString().slice(0, 19).replace("T", " "),
          end: task.dueDate,
          category: "General",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      // Remove completed task from local list
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (error) {
      console.error("Error completing task from Dashboard:", error);
    }
  };

  return (
    <div className="card tasks-card">
      {/* Clicking the header navigates to the Tasks page */}
      <h3 style={{ cursor: "pointer" }} onClick={() => setCurrentPage("Tasks")}>
        My Tasks
      </h3>
      <ul>
        {tasks.length === 0 ? (
          <li style={{ color: "gray" }}>No tasks yet</li>
        ) : (
          tasks.map((task) => (
            <li
              className="task-item"
              key={task.id}
              onClick={() => setCurrentPage("Tasks")}
            >
              <div className="task-left" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  className="circular-checkbox2"
                  onChange={() => completeTask(task.id)}
                />
                <span className="task-name">{task.title}</span>
              </div>
              <span className="task-options">•••</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

// ---------------- EVENTS CARD ----------------
function EventsCard({ setCurrentPage }) {
  const [events, setEvents] = useState([]);
  const token = localStorage.getItem("token");
  const teamId = localStorage.getItem("teamId");

  const formatTime = (dateStr) => {
    if (!dateStr) return "??:??";
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    const fetchTasksForEvents = async () => {
      try {
        const response = await axios.get(
          `http://144.24.195.74:8000/api/tasks/${teamId}/index`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        const allTasks = response.data?.data || [];
        // Upcoming tasks: have a future end date and are not completed
        const upcoming = allTasks
          .filter((t) => t.end && !t.completed)
          .sort((a, b) => new Date(a.end) - new Date(b.end))
          .slice(0, 3);

        const mappedEvents = upcoming.map((t) => ({
          id: t.id,
          // Use created_at as the start time for display purposes
          startTime: formatTime(t.created_at),
          endTime: formatTime(t.end),
          title: t.title || "No Title",
          desc: t.description || "No description",
        }));
        setEvents(mappedEvents);
      } catch (error) {
        console.error("Error fetching events for Dashboard:", error);
      }
    };
    fetchTasksForEvents();
  }, [teamId, token]);

  return (
    <div className="card events-card">
      <h3
        className="events-title"
        style={{ cursor: "pointer" }}
        onClick={() => setCurrentPage("Calendar")}
      >
        Upcoming events
      </h3>
      <ul>
        {events.length === 0 ? (
          <li style={{ color: "gray" }}>No upcoming events</li>
        ) : (
          events.map((evt) => (
            <li
              key={evt.id}
              className="event-item"
              style={{ cursor: "pointer" }}
              onClick={() => setCurrentPage("Calendar")}
            >
              <div className="event-time-dot">
                <span className="dot"></span>
                <span className="event-time">
                  {evt.startTime}–{evt.endTime}
                </span>
              </div>
              <div className="event-info">
                <div className="event-title">{evt.title}</div>
                <div className="event-desc">{evt.desc}</div>
              </div>
              <div className="event-options">•••</div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

// ---------------- CALENDAR CARD ----------------
function CalendarCard({ setCurrentPage }) {
  const [tasks, setTasks] = useState([]);
  const token = localStorage.getItem("token");
  const teamId = localStorage.getItem("teamId");

  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(
          `http://144.24.195.74:8000/api/tasks/${teamId}/index`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        setTasks(response.data?.data || []);
      } catch (error) {
        console.error("Error fetching tasks for CalendarCard:", error);
      }
    };
    fetchTasks();
  }, [teamId, token]);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const eventDays = tasks.reduce((acc, t) => {
    if (t.end) {
      const d = new Date(t.end);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        const dayNum = d.getDate();
        if (!acc.includes(dayNum)) {
          acc.push(dayNum);
        }
      }
    }
    return acc;
  }, []);

  return (
    <div className="card calendar-card">
      <h3
        style={{ cursor: "pointer" }}
        onClick={() => setCurrentPage("Calendar")}
      >
        Calendar
      </h3>
      <div className="calendar-grid">
        {days.map((day) => {
          const hasEvent = eventDays.includes(day);
          return (
            <div
              key={day}
              className="calendar-day"
              style={{ cursor: "pointer" }}
              onClick={() => setCurrentPage("Calendar")}
            >
              {day}
              {hasEvent && <span className="event-dot"></span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------- RECENT CHAT CARD ----------------
function RecentChatCard({ setCurrentPage }) {
  const [groups, setGroups] = useState([]);
  const token = localStorage.getItem("token");
  const teamId = localStorage.getItem("teamId");

  useEffect(() => {
    const fetchRecentChats = async () => {
      try {
        const channelsRes = await axios.get(
          `http://144.24.195.74:8000/api/chats/${teamId}/index`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        const channels = channelsRes.data || [];
        const groupData = [];
        for (const channel of channels) {
          try {
            const msgRes = await axios.get(
              `http://144.24.195.74:8000/api/chats/${channel.id}/getMessages`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/json",
                },
              }
            );
            const allMsgs = msgRes.data?.data || [];
            const lastTwo = allMsgs.slice(-2);
            const mapped = lastTwo.map((m) => ({
              user: m.user_name,
              text: m.message,
            }));
            groupData.push({
              name: channel.name,
              isOpen: false,
              messages: mapped,
            });
          } catch (err) {
            console.error(
              `Error fetching messages for channel ${channel.id}:`,
              err
            );
          }
        }
        setGroups(groupData.slice(0, 2));
      } catch (error) {
        console.error("Error fetching team chats for Dashboard:", error);
      }
    };
    fetchRecentChats();
  }, [teamId, token]);

  const toggleGroup = (index) => {
    setGroups((prev) =>
      prev.map((grp, i) =>
        i === index ? { ...grp, isOpen: !grp.isOpen } : grp
      )
    );
  };

  return (
    <div className="card chat-card">
      {/* Clicking the header directs to the Chat page */}
      <h3 style={{ cursor: "pointer" }} onClick={() => setCurrentPage("chat")}>
        Recent Chat
      </h3>
      <ul>
        {groups.length === 0 ? (
          <li style={{ color: "gray" }}>No chats found</li>
        ) : (
          groups.map((group, idx) => (
            <li key={idx} className="chat-group-card">
              <div
                className="chat-group-header"
                onClick={() => toggleGroup(idx)}
              >
                <span className="chat-dot"></span>
                <span className="chat-group-name">{group.name}</span>
                {group.isOpen ? <FiChevronUp /> : <FiChevronDown />}
              </div>
              <div className={`chat-group-body ${group.isOpen ? "open" : ""}`}>
                {group.messages.map((msg, i) => (
                  <div key={i} className="chat-group-message">
                    <strong>{msg.user}:</strong> {msg.text}
                  </div>
                ))}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

// ---------------- DASHBOARD ----------------
export default function Dashboard({ setCurrentPage }) {
  return (
    <div className="dashboard-page">
      <header className="db-header">
        <h2>Dashboard</h2>
      </header>
      <div className="dashboard-grid">
        <TasksCard setCurrentPage={setCurrentPage} />
        <RecentChatCard setCurrentPage={setCurrentPage} />
        <AISuggestedActionsCard />
        <CalendarCard setCurrentPage={setCurrentPage} />
        <EventsCard setCurrentPage={setCurrentPage} />
      </div>
    </div>
  );
}
