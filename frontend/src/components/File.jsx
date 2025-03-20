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

  // Overlays: initially hidden.
  const [showRegisterOverlay, setShowRegisterOverlay] = useState(false);
  const [showTutorialOverlay, setShowTutorialOverlay] = useState(false);

  // Active OS for the tutorial overlay.
  const [activeOS, setActiveOS] = useState("windows");

  // Registration data
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
  });

  // Define fileInputRef for file uploads.
  const fileInputRef = useRef(null);

  // Get token and teamId from localStorage
  let teamId = localStorage.getItem("teamId");
  let token = localStorage.getItem("token");

  // On component mount, if no token exists, prompt the user.
  useEffect(() => {
    if (!token) {
      
        setShowRegisterOverlay(true);
      
    }
  }, [token]);

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

      // Directories filtering
      const allDirs = response.data.directory;
      let filteredDirs;
      if (currentPath === "/") {
        filteredDirs = allDirs.filter((item) => !item.includes("/"));
      } else {
        const normalizedPath = currentPath.endsWith("/")
          ? currentPath
          : currentPath + "/";
        filteredDirs = allDirs.filter((item) => {
          if (!item.startsWith(normalizedPath)) return false;
          const remainder = item.slice(normalizedPath.length);
          return !remainder.includes("/");
        });
      }
      const fetchedDirectories = filteredDirs.map((fullPath) => {
        const name = fullPath.split("/").pop();
        return { path: fullPath, name, type: "folder" };
      });

      // Files filtering
      const allFiles = response.data.files || [];
      let filteredFiles;
      if (currentPath === "/") {
        filteredFiles = allFiles.filter((file) => !file.path.includes("/"));
      } else {
        const normalizedPath = currentPath.endsWith("/")
          ? currentPath
          : currentPath + "/";
        filteredFiles = allFiles.filter((file) => {
          if (!file.path.startsWith(normalizedPath)) return false;
          const remainder = file.path.slice(normalizedPath.length);
          return !remainder.includes("/");
        });
      }
      const fetchedFiles = filteredFiles.map((file) => {
        const name = file.path.split("/").pop();
        return { path: file.path, name, type: file.type };
      });

      const fetchedItems = [...fetchedDirectories, ...fetchedFiles];
      return fetchedItems;
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  }

  // Fetch directory items on mount and whenever currentPath changes
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
    if (token === "guestToken") {
      const newPath =
        currentPath === "/" ? `${currentPath}${newFolderName}` : `${currentPath}/${newFolderName}`;
      setItems((prev) => [
        ...prev,
        { path: newPath, name: newFolderName, type: "folder" },
      ]);
      setConfirmationMessage("Folder created (guest mode)!");
      setNewFolderName("");
      setIsCreatingFolder(false);
      return;
    }
    try {
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
        currentPath === "/" ? `${currentPath}${newFolderName}` : `${currentPath}/${newFolderName}`;
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

  // Registration handler
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
        error.response?.data?.error ||
          "Registration failed. Please try again."
      );
    }
  };

  // Guest mode handler
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

  // Open folder or file (only folders change directory)
  const handleOpen = (itemPath, itemType) => {
    if (itemType === "folder") {
      setCurrentPath(itemPath);
    }
    setMenuItemPath(null);
  };

  // Delete folder or file
  const handleDelete = async (itemPath, itemType) => {
    if (!window.confirm(`Are you sure you want to delete this ${itemType}?`))
      return;
    try {
      if (token === "guestToken") {
        setItems((prev) => prev.filter((item) => item.path !== itemPath));
        return;
      }
      const endpoint =
        itemType === "folder"
          ? `http://localhost:8000/api/folders/${teamId}/delete`
          : `http://localhost:8000/api/files/${teamId}/delete`;
      await axios.delete(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: { path: itemPath },
      });
      setItems((prev) => prev.filter((item) => item.path !== itemPath));
    } catch (error) {
      console.error(`Error deleting ${itemType}:`, error);
      setErrorMessage(`An error occurred while deleting the ${itemType}.`);
    }
  };

  // Navigate back in directory
  const handleBack = () => {
    if (currentPath === "/") return;
    const newPath = currentPath.split("/").slice(0, -1).join("/") || "/";
    setCurrentPath(newPath);
  };

  // Download file feature (only for files)
  const handleDownload = async (item) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/files/${teamId}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { path: item.path },
          responseType: "blob",
        }
      );
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", item.name);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
      setErrorMessage("An error occurred while downloading the file.");
    }
  };

  // Upload file feature with duplicate checking
  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const originalName = file.name;
    // Filter items in current directory
    const currentItems = items.filter((item) => {
      if (currentPath === "/") {
        return !item.path.slice(1).includes("/");
      } else {
        const normalizedPath = currentPath.endsWith("/")
          ? currentPath
          : currentPath + "/";
        const remainder = item.path.slice(normalizedPath.length);
        return remainder && !remainder.includes("/");
      }
    });
    if (currentItems.some((item) => item.name === originalName)) {
      setErrorMessage("File already exists");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", currentPath);
    formData.append("name", originalName);
    try {
      const response = await axios.post(
        `http://localhost:8000/api/files/${teamId}/store`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setConfirmationMessage(
        response.data.message || "File uploaded successfully!"
      );
      const dotIndex = originalName.lastIndexOf(".");
      let extension = "";
      if (dotIndex !== -1) {
        extension = originalName.substring(dotIndex);
      }
      const newFile = {
        path:
          currentPath === "/"
            ? `/${originalName}`
            : `${currentPath}/${originalName}`,
        name: originalName,
        type: extension.replace(".", "").toLowerCase(),
      };
      setItems((prev) => [...prev, newFile]);
    } catch (error) {
      console.error("Error uploading file:", error);
      setErrorMessage(
        error.response?.data?.error ||
          "An error occurred while uploading the file."
      );
    }
    e.target.value = "";
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Toggle add dialog and clear messages
  const toggleAddDialog = () => {
    setShowAddDialog((prev) => !prev);
    setConfirmationMessage("");
    setErrorMessage("");
    setIsCreatingFolder(false);
    setNewFolderName("");
  };

  // Render icon based on item type
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
    if (currentPath === "/") return <span className="breadcrumb-part">Root</span>;
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

  // Registration Overlay
  const RegisterOverlay = () => {
    const overlayRef = useRef(null);
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

  // Tutorial Overlay
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
          <button className="close-tutorial" onClick={() => setShowTutorialOverlay(false)}>
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
        <div className="global-confirmation-message">
          {confirmationMessage}
        </div>
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
              <button className="add-dialog-item3" onClick={triggerFileInput}>
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
                  <button className="folder-save-button" onClick={handleCreateFolder}>
                    <MdCheck size={20} />
                  </button>
                  <button className="folder-cancel-button" onClick={() => setIsCreatingFolder(false)}>
                    <MdClose size={20} />
                  </button>
                </div>
              ) : (
                <button className="add-dialog-item2" onClick={() => setIsCreatingFolder(true)}>
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
              onClick={() =>
                item.type === "folder" && handleOpen(item.path, item.type)
              }
            >
              <div className="item-icon">{renderItemIcon(item)}</div>
              <p className="item-name" title={item.name}>
                {item.name}
              </p>
              <button className="item-menu-btn" onClick={(e) => toggleMenu(item.path, e)}>
                <FiMoreVertical size={20} />
              </button>
              {menuItemPath === item.path && (
                <div className="item-menu-dialog" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="item-menu-item open-item"
                    onClick={() => handleOpen(item.path, item.type)}
                  >
                    <IoEnter /> Open
                  </button>
                  {item.type !== "folder" && (
                    <button
                      className="item-menu-item download-item"
                      onClick={() => handleDownload(item)}
                    >
                      <IoMdDownload /> Download
                    </button>
                  )}
                  <button
                    className="item-menu-item delete-item"
                    onClick={() => handleDelete(item.path, item.type)}
                  >
                    <MdDelete /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      {/* Hidden file input for uploading files */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleUploadFile}
      />
    </div>
  );
}
