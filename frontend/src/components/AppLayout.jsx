// resources/js/components/AppLayout.jsx
import { FiCheck, FiMoon, FiSun, FiX } from "react-icons/fi";
import "./AppLayout.css";

// ----- TASKS CARD -----
function TasksCard() {
  return (
    <div className="card tasks-card">
      <h3>My Tasks</h3>
      <ul>
        <li>
          <input type="checkbox" /> Finalize project architecture
          <span className="action">•••</span>
        </li>
        <li>
          <input type="checkbox" /> Develop UI prototypes
          <span className="action">•••</span>
        </li>
        <li>
          <input type="checkbox" /> Optimize code performance
          <span className="action">•••</span>
        </li>
        <li>
          <input type="checkbox" /> Update technical docs
          <span className="action">•••</span>
        </li>
      </ul>
    </div>
  );
}

// ----- AI SUGGESTED ACTIONS CARD -----
function AISuggestedActionsCard() {
  const suggestions = [
    "Refactor data layer for speed",
    "Integrate real-time notifications",
    "Implement voice-to-text in messaging",
    "Schedule weekly code reviews",
  ];
  return (
    <div className="card ai-card">
      <h3>AI Suggested Actions</h3>
      <ul>
        {suggestions.map((text, index) => (
          <li key={index} className="ai-item">
            <span>{text}</span>
            <div className="ai-actions">
              <FiCheck className="action-btn accept" title="Accept" />
              <FiX className="action-btn reject" title="Reject" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ----- UPCOMING EVENTS CARD -----
function EventsCard() {
  return (
    <div className="card events-card">
      <h3>Upcoming Events</h3>
      <ul>
        <li>12/05 - Virtual Hackathon Kickoff</li>
        <li>15/05 - UX Design Workshop</li>
        <li>20/05 - Team Strategy Meeting</li>
      </ul>
    </div>
  );
}

// ----- CALENDAR CARD -----
function CalendarCard() {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  return (
    <div className="card calendar-card">
      <h3>Calendar</h3>
      <div className="calendar-grid">
        {days.map((day) => (
          <div key={day} className="calendar-day">
            {day}
            <div className="day-actions">
              <button className="btn-accept" title="Accept Event">
                <FiCheck />
              </button>
              <button className="btn-reject" title="Reject Event">
                <FiX />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----- RECENT FILES CARD -----
function RecentFilesCard() {
  const files = [
    { name: "Proposal.pdf", type: "pdf" },
    { name: "Design.sketch", type: "sketch" },
    { name: "Report.docx", type: "doc" },
    { name: "Budget.xlsx", type: "xlsx" },
  ];
  return (
    <div className="card files-card">
      <h3>Recent Files</h3>
      <ul>
        {files.map((file, index) => (
          <li key={index}>
            <span className="file-icon">📄</span>
            {file.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ----- RECENT CHAT CARD -----
function RecentChatCard() {
  const chats = [
    { user: "Alice", message: "I updated the wireframes." },
    { user: "Bob", message: "The API is now faster!" },
    { user: "Charlie", message: "Let's schedule a meeting." },
  ];
  return (
    <div className="card chat-card">
      <h3>Recent Chat</h3>
      <ul>
        {chats.map((chat, index) => (
          <li key={index}>
            <strong>{chat.user}: </strong>
            <span>{chat.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AppLayout({ darkMode, setDarkMode }) {
  return (
    <div className="app-layout">
      {/* The sidebar is handled at a higher level, so we just do main content here */}
      <div className={`main-content ${darkMode ? "dark" : ""}`}>
        <header className="top-header">
          <h2>Dashboard</h2>
          <div
            className="toggle-icon"
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle Dark/Light Mode"
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </div>
        </header>
        <div className="dashboard-grid">
          <TasksCard />
          <AISuggestedActionsCard />
          <EventsCard />
          <CalendarCard />
          <RecentFilesCard />
          <RecentChatCard />
        </div>
      </div>
    </div>
  );
}
