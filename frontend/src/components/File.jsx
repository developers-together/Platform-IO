import React, { useEffect, useRef, useState } from "react";
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

// Default data for folders and files combined
const defaultItems = [
  { id: 1, name: "Admissions File", type: "folder" },
  { id: 2, name: "Hungarian Scholarship", type: "folder" },
  { id: 3, name: "Books", type: "folder" },
  { id: 4, name: "Certificates", type: "folder" },
  { id: 5, name: "IDs", type: "folder" },
  { id: 6, name: "phone", type: "folder" },
  { id: 7, name: "Research Pictures", type: "folder" },
  { id: 8, name: "20230501_161833.jpg", type: "image" },
  { id: 9, name: "Adaptive High Bitrate.mp4", type: "video" },
  { id: 10, name: "Adham Haitham CV.pdf", type: "pdf" },
  { id: 11, name: "notes.txt", type: "text" },
];

export default function FileShareSystem() {
  // State for items and menus
  const [items, setItems] = useState(defaultItems);
  const [menuItemId, setMenuItemId] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Tooltip for help
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipTab, setTooltipTab] = useState("windows");
  const helpRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  return (
    <div className="file-page">
      <header className="file-header">
        <div className="header-left">
          <h2 className="file-headline">File Share System</h2>
          {/* <div
            className="help-circle"
            ref={helpRef}
            onClick={() => setShowTooltip(true)}
          >
            ?
            {showTooltip && (
              <div className="help-tooltip" ref={tooltipRef}>
                <div className="tooltip-tabs">
                  <button
                    className={`tooltip-tab ${
                      tooltipTab === "windows" ? "active" : ""
                    }`}
                    onClick={() => setTooltipTab("windows")}
                  >
                    Windows
                  </button>
                  <button
                    className={`tooltip-tab ${
                      tooltipTab === "linux" ? "active" : ""
                    }`}
                    onClick={() => setTooltipTab("linux")}
                  >
                    Linux
                  </button>
                  <button
                    className={`tooltip-tab ${
                      tooltipTab === "mac" ? "active" : ""
                    }`}
                    onClick={() => setTooltipTab("mac")}
                  >
                    Mac
                  </button>
                </div>
                <div className="tooltip-content">
                  {tooltipTab === "windows" && (
                    <p>
                      Download and install the Nextcloud client for Windows to
                      sync your files seamlessly.
                    </p>
                  )}
                  {tooltipTab === "linux" && (
                    <p>
                      Use the Nextcloud client for Linux (available in most
                      distributions) for file syncing.
                    </p>
                  )}
                  {tooltipTab === "mac" && (
                    <p>
                      Install the Nextcloud client on your Mac for effortless
                      file sharing and sync.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div> */}
        </div>
        <div className="add-button-container2">
          <button className="add-button2" onClick={toggleAddDialog}>
            <FiMenu size={24} />
          </button>
          {showAddDialog && (
            <div className="add-dialog-popup2">
              {/* <div className="add-dialog-separator2"></div> */}
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
                    onClick={() => handleOpen(item.id)}
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

/** Helper function to choose an icon based on item type */
function renderItemIcon(item) {
  if (item.type === "folder") return <FiFolder size={28} color="#4dabf7" />;
  if (item.type === "video") return <FiVideo size={28} color="#4dabf7" />;
  if (item.type === "pdf") return <AiFillFilePdf size={28} color="#4dabf7" />;
  if (item.type === "text") return <FiFileText size={28} color="#4dabf7" />;
  return <FiGenericFile size={28} color="#4dabf7" />;
}

const teamId = localStorage.getItem("teamId");
async function getdirsroot() {
  const response = await axios.get(
    `http://localhost:8000/api/folders/${teamId}/index`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
    {
      params: {
        path: "/",
      },
    }
  );
  console.log(response.data);
  return response.data;
}

async function getdircontent() {
  const response = await axios.get(
    `http://localhost:8000/api/folders/${teamId}/show`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
    {
      params: {
        path: "/",
      },
    }
  );
  console.log(response.data);
  return response.data;
}

async function createdir() {
  const response = await axios.post(
    `http://localhost:8000/api/folders/${teamId}/store`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
    {
      params: {
        name: "test",
        path: "/",
      },
    }
  );
  console.log(response.data);
  return response.data;
}

async function deletedir() {
  const response = await axios.delete(
    `http://localhost:8000/api/folders/${teamId}/delete`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
    {
      params: {
        name: "test",
        path: "/",
      },
    }
  );
  console.log(response.data);
  return response.data;
}
