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
  // States for items and menus
  const [items, setItems] = useState([]);
  const [menuItemId, setMenuItemId] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipTab, setTooltipTab] = useState("windows");
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const helpRef = useRef(null);
  const tooltipRef = useRef(null);

  const teamId = localStorage.getItem("teamId");
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
          },
        }
      );
      console.log(response.data);
      return response.data.files || response.data; // adjust based on your API response
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  }

  // Call API on component mount
  useEffect(() => {
    async function fetchData() {
      const data = await getdirsroot();
      console.log(data);
      setItems(data);
    }
    fetchData();
  }, [teamId, token]);

  // Function to create a new folder using the API
  const handleCreateFolder = async () => {
    // Prompt user for folder name (could be replaced with a custom modal)
    const folderName = window.prompt("Enter a folder name:");
    if (!folderName) return; // User cancelled or provided empty name

    try {
      const response = await axios.post(
        `http://localhost:8000/api/folders/${teamId}/store`,
        {
          name: folderName,
          path: "/", // current directory, adjust if needed
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Folder creation response:", response.data);
      setConfirmationMessage(response.data.message || "Folder created successfully!");

      // Optionally update the items state if you want to reflect the new folder immediately
      // e.g., setItems([...items, { id: newId, name: folderName, type: "folder" }]);
    } catch (error) {
      console.error("Error creating folder:", error);
      setErrorMessage(
        error.response?.data?.error || "An error occurred while creating the folder."
      );
    }
  };

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
    // Clear any previous confirmation or error messages when reopening the dialog
    setConfirmationMessage("");
    setErrorMessage("");
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
                onClick={handleCreateFolder}
              >
                <FaFolderPlus /> Create Folder
              </button>
              {/* Display confirmation or error messages */}
              {confirmationMessage && (
                <div className="confirmation-message">
                  {confirmationMessage}
                </div>
              )}
              {errorMessage && (
                <div className="error-message">{errorMessage}</div>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="file-main">
        <div className="items-list">
          {items.map((item, index) => (
            <div key={index} className="item-card">
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
                    onClick={() =>
                      console.log("Download item:", item.id)
                    }
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
