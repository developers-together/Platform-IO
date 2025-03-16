import { useState } from "react";
import ReactDOM from "react-dom/client";
import "./app.css";
import CalendarPage from "./components/CalendarPage";
import ChatPage from "./components/ChatPage";
import Dashboard from "./components/Dashboard";
import Sidebar from "./components/Sidebar";
import TasksPage from "./components/Taskspage";
import Login from "./components/Login";
import Register from "./components/Register";
import AIPage from "./components/AI";
import Teams from "./components/Teams";

export default function App() {
  const [currentPage, setCurrentPage] = useState("login");
  // Toggle for the collapsible sidebar, if you’re using that
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {currentPage !== "teams" &&
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
        {currentPage === "dashboard" && <Dashboard />}
        {currentPage === "chat" && <ChatPage />}
        {currentPage === "Tasks" && <TasksPage />}
        {currentPage === "Calendar" && <CalendarPage />}
        {currentPage === "login" && <Login setCurrentPage={setCurrentPage} />}
        {currentPage === "register" && (
          <Register setCurrentPage={setCurrentPage} />
        )}
        {currentPage === "AI" && <AIPage />}
        {currentPage === "teams" && <Teams />}
        {/* Add other pages as needed */}
      </div>
    </div>
  );
}

const root = document.getElementById("app");
if (root) {
  ReactDOM.createRoot(root).render(<App />);
}
