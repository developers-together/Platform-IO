import React, { useEffect, useRef, useState } from "react";
import {
  FiFolder,
  FiFile,
  FiFileText,
  FiVideo,
  FiMoreVertical,
  FiPlus,
  FiFile as FiGenericFile,
} from "react-icons/fi";
import { AiFillFilePdf } from "react-icons/ai";
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
  // State for all items
  const [items, setItems] = useState(defaultItems);
  // State for the three-dots menu per item
  const [menuItemId, setMenuItemId] = useState(null);
  // State for Add dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [connectCode, setConnectCode] = useState("");

  // Tooltip for help: clicking the "?" opens and remains open until clicking outside
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

  // Functions for three-dots menu actions
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

  // Add dialog actions
  const openAddDialog = () => {
    setShowAddDialog(true);
    setConnectCode("");
  };
  const closeAddDialog = () => {
    setShowAddDialog(false);
    setConnectCode("");
  };
  const connectCodeAction = () => {
    console.log("Connect code:", connectCode);
    setShowAddDialog(false);
  };

  return (
    <div className="file-page">
      <header className="file-header">
        <div className="header-left">
          <h2 className="file-headline">File Share System</h2>
          <div
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
          </div>
        </div>
        <button className="add-button" onClick={openAddDialog}>
          <span className="add-icon">+</span>
        </button>
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
                    Open
                  </button>
                  <button
                    className="item-menu-item delete-item"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                  <button
                    className="item-menu-item share-item"
                    onClick={() => handleShare(item.id)}
                  >
                    Share
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Add Dialog */}
      {showAddDialog && (
        <div className="add-dialog-overlay">
          <div className="add-dialog-content">
            <button className="close-dialog-btn" onClick={closeAddDialog}>
              &times;
            </button>
            <h3>Enter Code</h3>
            <input
              type="text"
              placeholder="Enter Code..."
              value={connectCode}
              onChange={(e) => setConnectCode(e.target.value)}
              className="add-dialog-input"
            />
            <div className="add-dialog-actions">
              <button className="add-dialog-cancel" onClick={closeAddDialog}>
                Cancel
              </button>
              <button
                className="add-dialog-connect"
                onClick={connectCodeAction}
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Helper function to choose an icon based on item type */
function renderItemIcon(item) {
  if (item.type === "folder") return <FiFolder size={28} color="#4dabf7" />;
  if (item.type === "video") return <FiVideo size={28} color="#4dabf7" />;
  if (item.type === "pdf") return <AiFillFilePdf size={28} color="#4dabf7" />;
  if (item.type === "text") return <FiFileText size={28} color="#4dabf7" />;
  // For image or unknown types, use a generic file icon
  return <FiGenericFile size={28} color="#4dabf7" />;
}
