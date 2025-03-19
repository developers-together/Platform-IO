import {
  FiBell,
  FiCalendar,
  FiCheckSquare,
  FiHome,
  FiMenu,
  FiMessageSquare,
  FiSettings,
  FiUsers,
  FiUser,
} from "react-icons/fi";
import { IoFolderOutline } from "react-icons/io5";

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
    { icon: <IoFolderOutline />, label: "Shared File System", page: "File" },
    { icon: <FaFan />, label: "AI", page: "AI" },
  ];

  const bottomMenu = [
    { icon: <FiUsers />, label: "Team Profile", page: "Team" },
    { icon: <FiUser />, label: "Profile", page: "Profile" },
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

  // State for the AI icon rotation (in degrees)
  const [aiRotation, setAiRotation] = useState(0);
  const animationRef = useRef();
  const prevTimeRef = useRef();
  const [aiHovered, setAiHovered] = useState(false);
  // Use a ref to hold the current page without restarting the animation loop
  const currentPageRef = useRef(currentPage);
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    // Define speeds in degrees per millisecond:
    const NOT_AI_NOT_HOVERED = 360 / 10000; // 360° in 20s
    const NOT_AI_HOVERED = 360 / 5000; // 360° in 10s
    const AI_NOT_HOVERED = 360 / 2500; // 360° in 5s
    const AI_HOVERED = 360 / 1250; // 360° in 2.5s

    const animate = (time) => {
      if (prevTimeRef.current == null) {
        prevTimeRef.current = time;
      }
      const delta = time - prevTimeRef.current;
      prevTimeRef.current = time;

      let speed;
      if (currentPageRef.current === "AI") {
        speed = aiHovered ? AI_HOVERED : AI_NOT_HOVERED;
      } else {
        speed = aiHovered ? NOT_AI_HOVERED : NOT_AI_NOT_HOVERED;
      }

      setAiRotation((prev) => (prev + speed * delta) % 360);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [aiHovered]);

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
            onMouseEnter={() => {
              if (item.label === "AI") setAiHovered(true);
            }}
            onMouseLeave={() => {
              if (item.label === "AI") setAiHovered(false);
            }}
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
