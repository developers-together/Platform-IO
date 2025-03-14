import { useState } from "react";
import ReactDOM from "react-dom/client";
import "app.css";
import CalendarPage from "./components/CalendarPage";
import ChatPage from "./components/ChatPage";
import Dashboard from "./components/Dashboard";
import Sidebar from "./components/Sidebar";
import TasksPage from "./components/Taskspage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  // Toggle for the collapsible sidebar, if you’re using that
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div style={{ flex: 1 }}>
        {currentPage === "dashboard" && <Dashboard />}
        {currentPage === "chat" && <ChatPage />}
        {currentPage === "Tasks" && <TasksPage />}
        {currentPage === "Calendar" && <CalendarPage />}
        {/* Add other pages as needed */}
      </div>
    </div>
  );
}

const root = document.getElementById("app");
if (root) {
  ReactDOM.createRoot(root).render(<App />);
}
