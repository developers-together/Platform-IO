import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  FiFolder,
  FiFileText,
  FiVideo,
  FiMoreVertical,
  FiMenu,
  FiFile as FiGenericFile,
  FiImage,
  FiArrowLeft,
} from "react-icons/fi";
import { FaFileMedical } from "react-icons/fa6";
import { IoMdDownload } from "react-icons/io";
import { FaFolderPlus } from "react-icons/fa";
import { AiFillFilePdf } from "react-icons/ai";
import { IoEnter } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { MdCheck, MdClose } from "react-icons/md";
import "./File.css";

export default function FileShareSystem() {
  // State variables
  const [items, setItems] = useState([]);
  const [menuItemPath, setMenuItemPath] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPath, setCurrentPath] = useState("/");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const helpRef = useRef(null);
  const tooltipRef = useRef(null);

  const teamId = localStorage.getItem("teamId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target) &&
        helpRef.current &&
        !helpRef.current.contains(e.target)
      ) {
        // Optionally hide tooltip
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [token]);

  // Fetch directory data
  async function getdirsroot() {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/folders/${teamId}/index`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: { path: currentPath },
        }
      );

      const allItems = response.data.directory;
      let filtered = [];

      if (currentPath === "/") {
        filtered = allItems.filter((item) => !item.includes("/"));
      } else {
        const normalizedPath = currentPath.endsWith("/")
          ? currentPath
          : currentPath + "/";
        filtered = allItems.filter((item) => {
          if (!item.startsWith(normalizedPath)) return false;
          const remainder = item.slice(normalizedPath.length);
          return !remainder.includes("/");
        });
      }

      const fetchedItems = filtered.map((fullPath) => {
        const name = fullPath.split("/").pop();
        return {
          path: fullPath,
          name,
          type: "folder",
        };
      });

      return fetchedItems;
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  }

  useEffect(() => {
    async function fetchData() {
      const data = await getdirsroot();
      setItems(data);
    }
    fetchData();
  }, [teamId, token, currentPath]);

  // Create folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const response = await axios.post(
        `http://localhost:8000/api/folders/${teamId}/store`,
        {
          name: newFolderName,
          path: currentPath,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      let path = currentPath;
      if (path === "/") path += newFolderName;
      else path += "/" + newFolderName;
      setConfirmationMessage(
        response.data.message || "Folder created successfully!"
      );
      const newFolder = {
        path: path,
        name: newFolderName,
        type: "folder",
      };
      setItems((prevItems) => [...prevItems, newFolder]);
      setNewFolderName("");
      setIsCreatingFolder(false);
    } catch (error) {
      console.error("Error creating folder:", error);
      setErrorMessage(
        error.response?.data?.error ||
          "An error occurred while creating the folder."
      );
    }
  };

  // Toggle menu
  const toggleMenu = (itemPath, e) => {
    e.stopPropagation();
    setMenuItemPath((prev) => (prev === itemPath ? null : itemPath));
  };

  // Open folder
  const handleOpen = (itemPath) => {
    setCurrentPath(itemPath);
    setMenuItemPath(null);
  };

  // Delete folder
  const handleDelete = async (itemPath) => {
    if (!window.confirm("Are you sure you want to delete this folder?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/folders/${teamId}/delete`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: { path: itemPath },
      });
      setItems((prevItems) =>
        prevItems.filter((item) => item.path !== itemPath)
      );
    } catch (error) {
      console.error("Error deleting folder:", error);
      setErrorMessage("An error occurred while deleting the folder.");
    }
  };

  // Navigate back
  const handleBack = () => {
    if (currentPath === "/") return;
    let p = currentPath.split("/");
    p.pop();
    let newPath = p.join("/");
    if (newPath === "") newPath = "/";
    setCurrentPath(newPath);
  };

  const toggleAddDialog = () => {
    setShowAddDialog((prev) => !prev);
    setConfirmationMessage("");
    setErrorMessage("");
    setIsCreatingFolder(false);
    setNewFolderName("");
  };

  // Render icon
  function renderItemIcon(item) {
    if (item.type === "folder") return <FiFolder size={28} color="#4dabf7" />;
    if (item.type === "video") return <FiVideo size={28} color="#4dabf7" />;
    if (item.type === "pdf") return <AiFillFilePdf size={28} color="#4dabf7" />;
    if (item.type === "text") return <FiFileText size={28} color="#4dabf7" />;
    if (item.type === "image") return <FiImage size={28} color="#4dabf7" />;
    return <FiGenericFile size={28} color="#4dabf7" />;
  }

  // Render breadcrumb
  function renderBreadcrumb() {
    if (currentPath === "/") {
      return <span className="breadcrumb-part">Root</span>;
    } else {
      const parts = currentPath.split("/").filter(Boolean);
      return (
        <div className="breadcrumb">
          <span className="breadcrumb-part" onClick={() => setCurrentPath("/")}>
            Root
          </span>
          {parts.map((part, index) => (
            <React.Fragment key={index}>
              <span className="breadcrumb-separator">›</span>
              <span
                className="breadcrumb-part"
                onClick={() => {
                  const newPath = "/" + parts.slice(0, index + 1).join("/");
                  setCurrentPath(newPath);
                }}
              >
                {part}
              </span>
            </React.Fragment>
          ))}
        </div>
      );
    }
  }

  return (
    <div className="file-page">
      {confirmationMessage && (
        <div className="global-confirmation-message">{confirmationMessage}</div>
      )}
      {errorMessage && (
        <div className="global-error-message">{errorMessage}</div>
      )}

      <header className="file-header">
        <div className="header-left">
          <h2 className="file-headline">File Share System</h2>
          {renderBreadcrumb()}
          {currentPath !== "/" && (
            <button className="back-button" onClick={handleBack}>
              <FiArrowLeft size={18} />
              <span>Back</span>
            </button>
          )}
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
              {isCreatingFolder ? (
                <div className="folder-create-container" tabIndex={0}>
                  <input
                    type="text"
                    className="folder-create-input"
                    placeholder="Enter folder name..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    autoFocus
                  />
                  <button
                    className="folder-save-button"
                    onClick={handleCreateFolder}
                  >
                    <MdCheck size={20} />
                  </button>
                  <button
                    className="folder-cancel-button"
                    onClick={() => setIsCreatingFolder(false)}
                  >
                    <MdClose size={20} />
                  </button>
                </div>
              ) : (
                <button
                  className="add-dialog-item2"
                  onClick={() => setIsCreatingFolder(true)}
                >
                  <FaFolderPlus /> Create Folder
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="file-main">
        <div className="items-list">
          {items.map((item) => (
            <div
              key={item.path}
              className="item-card"
              onClick={() => handleOpen(item.path)}
            >
              <div className="item-icon">{renderItemIcon(item)}</div>
              <p className="item-name" title={item.name}>
                {item.name}
              </p>
              <button
                className="item-menu-btn"
                onClick={(e) => toggleMenu(item.path, e)}
              >
                <FiMoreVertical size={20} />
              </button>
              {menuItemPath === item.path && (
                <div
                  className="item-menu-dialog"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="item-menu-item open-item"
                    onClick={() => handleOpen(item.path)}
                  >
                    <IoEnter /> Open
                  </button>
                  <button
                    className="item-menu-item open-item"
                    onClick={() => console.log("Download item:", item.path)}
                  >
                    <IoMdDownload /> Download
                  </button>
                  <button
                    className="item-menu-item delete-item"
                    onClick={() => handleDelete(item.path)}
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
