import {
  FiBell,
  FiCalendar,
  FiCheckSquare,
  FiCpu,
  FiHome,
  FiMenu,
  FiMessageSquare,
  FiSettings,
  FiUser,
} from "react-icons/fi";
import { FaFan } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import "./Sidebar.css";

export default function Sidebar({
  currentPage,
  setCurrentPage,
  sidebarOpen,
  setSidebarOpen,
}) {
  const topMenu = [
    { icon: <FiMenu />, label: "Menu", page: null },
    { icon: <FiHome />, label: "Dashboard", page: "dashboard" },
    { icon: <FiMessageSquare />, label: "Chat", page: "chat" },
    { icon: <FiCheckSquare />, label: "Tasks", page: "Tasks" },
    { icon: <FiCalendar />, label: "Calendar", page: "Calendar" },
    { icon: <FaFan />, label: "AI", page: "ai" },
  ];

  const bottomMenu = [
    { icon: <FiBell />, label: "Alerts", page: "alerts" },
    { icon: <FiSettings />, label: "Settings", page: "settings" },
    { icon: <FiUser />, label: "Profile", page: "profile" },
  ];

  const handleNav = (item) => {
    if (item.label === "Menu") {
      setSidebarOpen(!sidebarOpen);
    } else if (item.page) {
      setCurrentPage(item.page);
    } else {
      console.log("Navigating to:", item.label);
    }
  };

  // Always animate the AI icon's rotation
  const [aiRotation, setAiRotation] = useState(0);
  const animationRef = useRef();
  const prevTimeRef = useRef();
  // Use a ref to always have the current page available without restarting the loop.
  const currentPageRef = useRef(currentPage);
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    const highSpeed = 360 / 5000; // degrees per ms when active (360° in 5 sec)
    const lowSpeed = 360 / 20000; // degrees per ms when not active (360° in 20 sec)

    const animate = (time) => {
      if (prevTimeRef.current == null) {
        prevTimeRef.current = time;
      }
      const delta = time - prevTimeRef.current;
      prevTimeRef.current = time;
      // Choose speed based on whether the current page is "ai"
      const speed = currentPageRef.current === "ai" ? highSpeed : lowSpeed;
      setAiRotation((prev) => (prev + speed * delta) % 360);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  return (
    <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
      <div className="menu-section top-menu">
        {topMenu.map((item, i) => (
          <div
            key={i}
            className={`sidebar-item ${
              currentPage === item.page ? "active" : ""
            } ${item.label === "AI" ? "ai" : ""}`}
            onClick={() => handleNav(item)}
          >
            <span
              className="icon"
              style={
                item.label === "AI"
                  ? { transform: `rotate(${aiRotation}deg)` }
                  : {}
              }
            >
              {item.icon}
            </span>
            {sidebarOpen && (
              <span
                className={`label ${item.label === "AI" ? "ai-label" : ""}`}
              >
                {item.label}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="menu-section bottom-menu">
        {bottomMenu.map((item, i) => (
          <div
            key={i}
            className={`sidebar-item ${
              currentPage === item.page ? "active" : ""
            }`}
            onClick={() => handleNav(item)}
          >
            <span className="icon">{item.icon}</span>
            {sidebarOpen && <span className="label">{item.label}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
