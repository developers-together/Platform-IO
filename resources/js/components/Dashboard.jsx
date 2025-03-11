// resources/js/components/Dashboard.jsx
import { FiCheck, FiX } from 'react-icons/fi';
import './Dashboard.css';

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

function AISuggestedActionsCard() {
    const suggestions = [
        'Refactor data layer for speed',
        'Integrate real-time notifications',
        'Implement voice-to-text',
        'Schedule weekly code reviews',
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

function RecentFilesCard() {
    const files = ['Proposal.pdf', 'Design.sketch', 'Report.docx', 'Budget.xlsx'];
    return (
        <div className="card files-card">
            <h3>Recent Files</h3>
            <ul>
                {files.map((file, i) => (
                    <li key={i}>
                        <span className="file-icon">📄</span> {file}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function RecentChatCard() {
    const chats = [
        { user: 'Alice', message: 'I updated the wireframes.' },
        { user: 'Bob', message: 'The API is now faster!' },
        { user: 'Charlie', message: "Let's schedule a meeting." },
    ];
    return (
        <div className="card chat-card">
            <h3>Recent Chat</h3>
            <ul>
                {chats.map((chat, i) => (
                    <li key={i}>
                        <strong>{chat.user}:</strong> {chat.message}
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
                <AISuggestedActionsCard />
                <EventsCard />
                <CalendarCard />
                <RecentFilesCard />
                <RecentChatCard />
            </div>
        </div>
    );
}
