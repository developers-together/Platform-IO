import { useState } from "react";
import ReactDOM from "react-dom/client";
import "./app.css";
import Landing from "./components/landing";
import CalendarPage from "./components/CalendarPage";
import ChatPage from "./components/ChatPage";
import Dashboard from "./components/Dashboard";
import Sidebar from "./components/Sidebar";
import TasksPage from "./components/Taskspage";
import Login from "./components/Login";
import Register from "./components/Register";
import AIPage from "./components/AI";
import Teams from "./components/Teams";
import Profile from "./components/Profile";
import FilePage from "./components/File";

export default function App() {
  // Set the default view to 'landing'
  const [currentPage, setCurrentPage] = useState("landing");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {currentPage !== "teams" &&
        currentPage !== "landing" && // hide sidebar on landing page
        currentPage !== "login" &&
        currentPage !== "register" && (
          <Sidebar
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        )}
      <div style={{ flex: 1 }}>
        {currentPage === "landing" && (
          <Landing setCurrentPage={setCurrentPage} />
        )}
        {currentPage === "login" && <Login setCurrentPage={setCurrentPage} />}
        {currentPage === "register" && (
          <Register setCurrentPage={setCurrentPage} />
        )}
        {currentPage === "dashboard" && (
          <Dashboard setCurrentPage={setCurrentPage} />
        )}
        {currentPage === "chat" && <ChatPage setCurrentPage={setCurrentPage} />}
        {currentPage === "Tasks" && (
          <TasksPage setCurrentPage={setCurrentPage} />
        )}
        {currentPage === "Calendar" && (
          <CalendarPage setCurrentPage={setCurrentPage} />
        )}
        {currentPage === "File" && <FilePage setCurrentPage={setCurrentPage} />}
        {currentPage === "AI" && (
          <AIPage
            setLeftSidebarOpen={setSidebarOpen}
            setCurrentPage={setCurrentPage}
          />
        )}
        {currentPage === "teams" && <Teams setCurrentPage={setCurrentPage} />}
        {currentPage === "Profile" && (
          <Profile setCurrentPage={setCurrentPage} />
        )}
      </div>
    </div>
  );
}

const root = document.getElementById("app");
if (root) {
  ReactDOM.createRoot(root).render(<App />);
}
