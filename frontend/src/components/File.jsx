import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  FiFolder,
  FiFileText,
  FiVideo,
  FiMoreVertical,
  FiMenu,
  FiFile as FiGenericFile,
} from "react-icons/fi";
import { FaFileMedical } from "react-icons/fa6";
import { IoMdDownload } from "react-icons/io";
import { FaFolderPlus } from "react-icons/fa";
import { AiFillFilePdf } from "react-icons/ai";
import { IoEnter } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import "./File.css";

export default function FileShareSystem() {
  // Initially set items to an empty array
  const [items, setItems] = useState([]);
  const [menuItemId, setMenuItemId] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipTab, setTooltipTab] = useState("windows");
  const helpRef = useRef(null);
  const tooltipRef = useRef(null);

  const teamId = localStorage.getItem("teamId");
  // Assume token is stored somewhere as well
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Handle click outside the tooltip
    const handleClickOutside = (e) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target) &&
        helpRef.current &&
        !helpRef.current.contains(e.target)
      ) {
        setShowTooltip(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // API call to fetch directory data
  async function getdirsroot() {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/folders/${teamId}/index`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        }
      );
      console.log(response.data);
      return response.data; // Assuming this returns an array of items
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  }

  // Call API on component mount
  useEffect(() => {
    async function fetchData() {
      const data = await getdirsroot();
      // If your API returns the items in a specific property, for example data.items,
      // adjust accordingly. Here we assume the API returns an array.
      console.log(data);
      setItems(data);
    }
    fetchData();
  }, [teamId, token]);

  // Three-dots menu functions
  const toggleMenu = (itemId, e) => {
    e.stopPropagation();
    setMenuItemId((prev) => (prev === itemId ? null : itemId));
  };

  const handleOpen = (itemId) => {
    console.log("Open item:", itemId);
    setMenuItemId(null);
  };

  const handleDelete = (itemId) => {
    console.log("Delete item:", itemId);
    setMenuItemId(null);
  };

  const handleShare = (itemId) => {
    console.log("Share item:", itemId);
    setMenuItemId(null);
  };

  // Toggle the add dialog pop-up
  const toggleAddDialog = () => {
    setShowAddDialog((prev) => !prev);
  };

  // Helper function to choose an icon based on item type
  function renderItemIcon(item) {
    if (item.type === "folder") return <FiFolder size={28} color="#4dabf7" />;
    if (item.type === "video") return <FiVideo size={28} color="#4dabf7" />;
    if (item.type === "pdf") return <AiFillFilePdf size={28} color="#4dabf7" />;
    if (item.type === "text") return <FiFileText size={28} color="#4dabf7" />;
    return <FiGenericFile size={28} color="#4dabf7" />;
  }

  return (
    <div className="file-page">
      <header className="file-header">
        <div className="header-left">
          <h2 className="file-headline">File Share System</h2>
          {/* Tooltip code can be added back here if needed */}
        </div>
        <div className="add-button-container2">
          <button className="add-button2" onClick={toggleAddDialog}>
            <FiMenu size={24} />
          </button>
          {showAddDialog && (
            <div className="add-dialog-popup2">
              <button
                className="add-dialog-item3"
                onClick={() => console.log("Add File")}
              >
                <FaFileMedical /> Upload File
              </button>
              <button
                className="add-dialog-item2"
                onClick={() => console.log("Add Folder")}
              >
                <FaFolderPlus /> Create Folder
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="file-main">
        <div className="items-list">
          {items.map((item) => (
            <div key={item.id} className="item-card">
              <div className="item-icon">{renderItemIcon(item)}</div>
              <p className="item-name">{item.name}</p>
              <button
                className="item-menu-btn"
                onClick={(e) => toggleMenu(item.id, e)}
              >
                <FiMoreVertical size={20} />
              </button>
              {menuItemId === item.id && (
                <div
                  className="item-menu-dialog"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="item-menu-item open-item"
                    onClick={() => handleOpen(item.id)}
                  >
                    <IoEnter /> Open
                  </button>
                  <button
                    className="item-menu-item open-item"
                    onClick={() => console.log("Download item:", item.id)}
                  >
                    <IoMdDownload /> Download
                  </button>
                  <button
                    className="item-menu-item delete-item"
                    onClick={() => handleDelete(item.id)}
                  >
                    <MdDelete /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
