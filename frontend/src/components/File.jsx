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
import { MdDelete, MdCheck, MdClose } from "react-icons/md";
import "./File.css";

export default function FileShareSystem() {
  // State variables for file system, overlays, etc.
  const [items, setItems] = useState([]);
  const [menuItemPath, setMenuItemPath] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPath, setCurrentPath] = useState("/");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Overlays: registration always appears on load; tutorial appears after.
  const [showRegisterOverlay, setShowRegisterOverlay] = useState(true);
  const [showTutorialOverlay, setShowTutorialOverlay] = useState(false);

  // Active OS for the tutorial overlay.
  const [activeOS, setActiveOS] = useState("windows");

  // Registration data
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
  });

  // Get token and teamId from localStorage
  let teamId = localStorage.getItem("teamId");
  let token = localStorage.getItem("token");

  // Remove auto-forcing of registration based on localStorage.
  // Registration overlay always shows on page load.

  // Close item menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !e.target.closest(".item-menu-dialog") &&
        !e.target.closest(".item-menu-btn")
      ) {
        setMenuItemPath(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch directory items (or return dummy data in guest mode)
  async function getdirsroot() {
    if (!token || token === "guestToken") {
      return [
        { path: "/demo-folder", name: "Demo Folder", type: "folder" },
        { path: "/demo-file.txt", name: "Demo File.txt", type: "text" },
      ];
    }
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

      return filtered.map((fullPath) => ({
        path: fullPath,
        name: fullPath.split("/").pop(),
        type: "folder",
      }));
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

  // Folder creation handler
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      if (token === "guestToken") {
        const newPath =
          currentPath === "/"
            ? `${currentPath}${newFolderName}`
            : `${currentPath}/${newFolderName}`;
        setItems((prev) => [
          ...prev,
          {
            path: newPath,
            name: newFolderName,
            type: "folder",
          },
        ]);
        setConfirmationMessage("Folder created (guest mode)!");
        setNewFolderName("");
        setIsCreatingFolder(false);
        return;
      }

      const response = await axios.post(
        `http://localhost:8000/api/folders/${teamId}/store`,
        { name: newFolderName, path: currentPath },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const newPath =
        currentPath === "/"
          ? `${currentPath}${newFolderName}`
          : `${currentPath}/${newFolderName}`;
      setConfirmationMessage(response.data.message || "Folder created!");
      setItems((prev) => [
        ...prev,
        { path: newPath, name: newFolderName, type: "folder" },
      ]);
      setNewFolderName("");
      setIsCreatingFolder(false);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "Error creating folder.");
    }
  };

  // Registration handler (login button)
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8000/api/register",
        registerData
      );
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("teamId", response.data.teamId);
      localStorage.setItem("hasRegistered", "true");

      setShowRegisterOverlay(false);
      setShowTutorialOverlay(true);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error || "Registration failed. Please try again."
      );
    }
  };

  // Skip button handler (guest mode)
  const handleGuestEnter = () => {
    localStorage.setItem("hasRegistered", "true");
    localStorage.setItem("token", "guestToken");
    localStorage.setItem("teamId", "guestTeamId");
    token = "guestToken";
    teamId = "guestTeamId";

    setShowRegisterOverlay(false);
    setShowTutorialOverlay(true);
  };

  // Toggle item menu
  const toggleMenu = (itemPath, e) => {
    e.stopPropagation();
    setMenuItemPath((prev) => (prev === itemPath ? null : itemPath));
  };

  // Open folder or item
  const handleOpen = (itemPath) => {
    if (itemPath === "/demo-folder") {
      setCurrentPath("/demo-folder");
    } else {
      setCurrentPath(itemPath);
    }
    setMenuItemPath(null);
  };

  // Delete folder/item
  const handleDelete = async (itemPath) => {
    if (!window.confirm("Delete this folder permanently?")) return;
    try {
      if (token === "guestToken") {
        setItems((prev) => prev.filter((item) => item.path !== itemPath));
        return;
      }
      await axios.delete(`http://localhost:8000/api/folders/${teamId}/delete`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: { path: itemPath },
      });
      setItems((prev) => prev.filter((item) => item.path !== itemPath));
    } catch (error) {
      setErrorMessage("Error deleting folder.");
    }
  };

  // Navigate back in directory
  const handleBack = () => {
    if (currentPath === "/") return;
    const newPath = currentPath.split("/").slice(0, -1).join("/") || "/";
    setCurrentPath(newPath);
  };

  // Render item icon based on type
  const renderItemIcon = (item) => {
    const iconProps = { size: 28, color: "#4dabf7" };
    switch (item.type) {
      case "folder":
        return <FiFolder {...iconProps} />;
      case "video":
        return <FiVideo {...iconProps} />;
      case "pdf":
        return <AiFillFilePdf {...iconProps} />;
      case "text":
        return <FiFileText {...iconProps} />;
      case "image":
        return <FiImage {...iconProps} />;
      default:
        return <FiGenericFile {...iconProps} />;
    }
  };

  // Render breadcrumb navigation
  const renderBreadcrumb = () => {
    if (currentPath === "/")
      return <span className="breadcrumb-part">Root</span>;
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
              onClick={() =>
                setCurrentPath("/" + parts.slice(0, index + 1).join("/"))
              }
            >
              {part}
            </span>
          </React.Fragment>
        ))}
      </div>
    );
  };

  // --- Overlay Components ---

  // Registration Overlay component
  const RegisterOverlay = () => {
    const overlayRef = useRef(null);
    // On first mount, remove the animation style so subsequent re-renders don't re-trigger it.
    useEffect(() => {
      if (overlayRef.current) {
        overlayRef.current.style.animation = "none";
      }
    }, []);
    return (
      <div className="overlay2">
        <div className="register-overlay" ref={overlayRef}>
          <h2>Create Your Account</h2>
          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Username"
              value={registerData.username}
              onChange={(e) =>
                setRegisterData((prev) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={registerData.password}
              onChange={(e) =>
                setRegisterData((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              required
            />
            <button type="submit">Login</button>
          </form>
          <button
            type="button"
            onClick={handleGuestEnter}
            style={{ marginTop: "1rem", fontSize: "0.9rem" }}
          >
            Skip Registration
          </button>
          {errorMessage && <div className="overlay-error">{errorMessage}</div>}
        </div>
      </div>
    );
  };

  // Tutorial Overlay component
  const TutorialOverlay = () => {
    const overlayRef = useRef(null);
    useEffect(() => {
      if (overlayRef.current) {
        overlayRef.current.style.animation = "none";
      }
    }, []);
    return (
      <div className="overlay2">
        <div className="tutorial-overlay" ref={overlayRef}>
          <h2>Getting Started Guide</h2>
          <div className="os-tabs">
            {["windows", "mac", "linux"].map((os) => (
              <button
                key={os}
                className={activeOS === os ? "active" : ""}
                onClick={() => setActiveOS(os)}
              >
                {os.charAt(0).toUpperCase() + os.slice(1)}
              </button>
            ))}
          </div>
          <div className="tutorial-content">
            {activeOS === "windows" && (
              <>
                <h3>Windows Instructions</h3>
                <ol>
                  <li>Right-click files/folders for context menu</li>
                  <li>Drag-and-drop to organize items</li>
                  <li>Double-click folders to navigate</li>
                </ol>
              </>
            )}
            {activeOS === "mac" && (
              <>
                <h3>macOS Instructions</h3>
                <ol>
                  <li>Control-click for context menus</li>
                  <li>Use trackpad gestures to navigate</li>
                  <li>Drag items between folders</li>
                </ol>
              </>
            )}
            {activeOS === "linux" && (
              <>
                <h3>Linux Instructions</h3>
                <ol>
                  <li>Right-click for context menus</li>
                  <li>Use keyboard shortcuts (Ctrl+C/V)</li>
                  <li>Drag items to move/copy</li>
                </ol>
              </>
            )}
          </div>
          <button
            className="close-tutorial"
            onClick={() => setShowTutorialOverlay(false)}
          >
            Start Using
          </button>
        </div>
      </div>
    );
  };

  // --- End Overlays ---

  return (
    <div className="file-page">
      {showRegisterOverlay && <RegisterOverlay />}
      {showTutorialOverlay && <TutorialOverlay />}

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
          <button
            className="add-button2"
            onClick={() => setShowAddDialog(!showAddDialog)}
          >
            <FiMenu size={24} />
          </button>
          {showAddDialog && (
            <div className="add-dialog-popup2">
              <button
                className="add-dialog-item3"
                onClick={() => console.log("Upload File")}
              >
                <FaFileMedical /> Upload File
              </button>
              {isCreatingFolder ? (
                <div className="folder-create-container">
                  <input
                    type="text"
                    className="folder-create-input"
                    placeholder="Folder name..."
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
                    onClick={() => console.log("Download:", item.path)}
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
