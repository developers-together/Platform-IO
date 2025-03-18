import { useState, useEffect } from "react";
import { FiCheck, FiChevronDown, FiChevronUp, FiX } from "react-icons/fi";
import "./Dashboard.css";
import axios from "axios";

function TasksCard() {
  return (
    <div className="card tasks-card">
      <h3>My Tasks</h3>
      <ul>
        {/* Each list item is now a "task-item" row */}
        <li className="task-item">
          <div className="task-left">
            <input type="checkbox" className="circular-checkbox2" />
            <span className="task-name">Finalize project architecture</span>
          </div>
          <span className="task-options">•••</span>
        </li>

        <li className="task-item">
          <div className="task-left">
            <input type="checkbox" className="circular-checkbox2" />
            <span className="task-name">Develop UI prototypes</span>
          </div>
          <span className="task-options">•••</span>
        </li>

        <li className="task-item">
          <div className="task-left">
            <input type="checkbox" className="circular-checkbox2" />
            <span className="task-name">Optimize code performance</span>
          </div>
          <span className="task-options">•••</span>
        </li>

        <li className="task-item">
          <div className="task-left">
            <input type="checkbox" className="circular-checkbox2" />
            <span className="task-name">Update technical docs</span>
          </div>
          <span className="task-options">•••</span>
        </li>

        <li className="task-item">
          <div className="task-left">
            <input type="checkbox" className="circular-checkbox2" />
            <span className="task-name">Update technical docs</span>
          </div>
          <span className="task-options">•••</span>
        </li>
      </ul>
    </div>
  );
}

function AISuggestedActionsCard() {
  const suggestions = [
    "Refactor data layer for speed",
    "Integrate real-time notifications",
    "Implement voice-to-text",
    "Schedule weekly code reviews",
    "Refactor data layer for speed",
    "Integrate real-time notifications",
    "Implement voice-to-text",
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
              <button className="action-btn2 accept" title="Accept suggestion">
                <FiCheck />
              </button>
              <button className="action-btn2 reject" title="Reject suggestion">
                <FiX />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EventsCard() {
  const events = [
    {
      time: "10:00–11:00",
      title: "Meeting with a client",
      desc: "Tell How To Boost Website Traffic",
    },
    {
      time: "05:40–13:20",
      title: "Visit online course",
      desc: "Check updates about design course",
    },
    {
      time: "9:00–13:00",
      title: "Design new UI and check sales",
      desc: "Tell How To Boost Website Traffic",
    },
  ];

  return (
    <div className="card events-card">
      <h3 className="events-title">Upcoming events</h3>
      <ul>
        {events.map((evt, idx) => (
          <li key={idx} className="event-item">
            <div className="event-time-dot">
              {/* Dot for color bullet */}
              <span className="dot"></span>
              <span className="event-time">{evt.time}</span>
            </div>
            <div className="event-info">
              <div className="event-title">{evt.title}</div>
              <div className="event-desc">{evt.desc}</div>
            </div>
            <div className="event-options">•••</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CalendarCard() {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  // Example array of days that have events
  const eventDays = [3, 10, 15, 21];

  return (
    <div className="card calendar-card">
      <h3>Calendar</h3>
      <div className="calendar-grid">
        {days.map((day) => {
          // Check if this day has an event
          const hasEvent = eventDays.includes(day);

          return (
            <div key={day} className="calendar-day">
              {day}
              {hasEvent && <span className="event-dot"></span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecentChatCard() {
  const [groups, setGroups] = useState([
    {
      name: "UI Design",
      isOpen: true,
      messages: [
        { user: "Charlie", text: "We need a new color scheme." },
        { user: "Bob", text: "How about a fresh gradient?" },
      ],
    },
    {
      name: "Team Alpha",
      isOpen: false,
      messages: [
        { user: "Alice", text: "Just finished the wireframes!" },
        { user: "Bob", text: "Great, I'll review them soon." },
      ],
    },
  ]);

  // Toggle open/close by flipping isOpen
  const toggleGroup = (index) => {
    setGroups((prev) =>
      prev.map((grp, i) =>
        i === index ? { ...grp, isOpen: !grp.isOpen } : grp
      )
    );
  };

  return (
    <div className="card chat-card">
      <h3>Recent Chat</h3>
      <ul>
        {groups.map((group, idx) => (
          <li key={idx} className="chat-group-card">
            {/* Header row (full width) */}
            <div className="chat-group-header" onClick={() => toggleGroup(idx)}>
              <span className="chat-dot"></span>
              <span className="chat-group-name">{group.name}</span>
              {group.isOpen ? (
                <FiChevronUp className="chat-group-arrow" />
              ) : (
                <FiChevronDown className="chat-group-arrow" />
              )}
            </div>

            {/* Instead of conditionally rendering, always render w/ a class toggle */}
            <div className={`chat-group-body ${group.isOpen ? "open" : ""}`}>
              {group.messages.map((msg, i) => (
                <div key={i} className="chat-group-message">
                  <strong>{msg.user}:</strong> {msg.text}
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="dashboard-page">
      <header className="db-header">
        <h2>Dashboard</h2>
      </header>
      <div className="dashboard-grid">
        <TasksCard />
        <RecentChatCard />
        <AISuggestedActionsCard />
        <CalendarCard />
        <EventsCard />
      </div>
    </div>
  );
}
