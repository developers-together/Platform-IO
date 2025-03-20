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
  const fileInputRef = useRef(null);

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
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
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
          // Pass the currentPath as a parameter (if your backend uses it)
          params: { path: currentPath },
        }
      );

      // Assume response.data.directory is an array of full paths, for example:
      // ["1", "1/2", "1/2/gg"]
      const allDirs = response.data.directory;

      let filteredDirs;
      if (currentPath === "/") {
        // At root, only direct children (no slash) are kept.
        filteredDirs = allDirs.filter((item) => !item.includes("/"));
      } else {
        // For a non-root folder, first ensure currentPath ends with a slash.
        const normalizedPath = currentPath.endsWith("/")
          ? currentPath
          : currentPath + "/";
        // Filter for items that start with the normalizedPath and have no additional slash
        filteredDirs = allDirs.filter((item) => {
          if (!item.startsWith(normalizedPath)) return false;
          const remainder = item.slice(normalizedPath.length);
          return !remainder.includes("/");
        });
      }

      // Map the filtered directories to folder objects.
      const fetchedDirectories = filteredDirs.map((fullPath) => {
        const name = fullPath.split("/").pop();
        return {
          path: fullPath, // full path is our unique key
          name,
          type: "folder",
        };
      });

      // Filtering files similarly:
      const allFiles = response.data.files || [];
      let filteredFiles;
      if (currentPath === "/") {
        // At root, only include files with no slash in their path.
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

      // Map the filtered files to file objects.
      const fetchedFiles = filteredFiles.map((file) => {
        const name = file.path.split("/").pop();
        return {
          path: file.path,
          name,
          type: file.type, // e.g., "txt", "pdf", etc.
        };
      });

      // Combine directories and files into one array.
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

  // Three-dots menu functions
  const toggleMenu = (itemPath, e) => {
    e.stopPropagation();
    setMenuItemPath((prev) => (prev === itemPath ? null : itemPath));
  };

  // Open folder: use the "show" endpoint to fetch its contents.
  // Even if the folder is empty, update the currentPath.
  const handleOpen = async (itemPath, itemType) => {
    if (itemType === "folder") {
      setCurrentPath(itemPath);
      setMenuItemPath(null);
    }
  };

  const handleDelete = async (itemPath, itemType) => {
    if (!window.confirm(`Are you sure you want to delete this ${itemType}?`))
      return;

    try {
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

      setItems((prevItems) =>
        prevItems.filter((i) => i.path !== itemPath)
      );
    } catch (error) {
      console.error(`Error deleting ${itemType}:`, error);
      setErrorMessage(
        `An error occurred while deleting the ${itemType}.`
      );
    }
  };

  // "Back" button: navigate to the parent directory
  const handleBack = () => {
    if (currentPath === "/") return;
    let p = currentPath.split("/");
    p.pop();
    let newPath = p.join("/");
    if (newPath === "") {
      newPath = "/";
    }
    setCurrentPath(newPath);
  };

  // Download file feature
  const handleDownload = async (item) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/files/${teamId}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { path: item.path },
          responseType: "blob", // Important for downloading files
        }
      );
      // Create a blob from the response data
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

  // Upload file feature
  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Determine original file name
    const originalName = file.name;

    // Filter items in the current directory
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

    // Check for duplicate by comparing file names
    if (currentItems.some((item) => item.name === originalName)) {
      setErrorMessage("File already exists");
      return;
    }

    // Build formData including the original file name
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", currentPath); // Send the current directory path
    formData.append("name", originalName); // Send the original file name to the API
    console.log(file, currentPath, originalName);

    try {
      const response = await axios.post(
        `http://localhost:8000/api/files/${teamId}/store`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Let axios set the appropriate Content-Type for multipart/form-data
          },
        }
      );
      setConfirmationMessage(
        response.data.message || "File uploaded successfully!"
      );

      // Manually construct the file object using the original file name
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
        type: extension.replace(".", "").toLowerCase(), // e.g., "pdf" or "txt"
      };

      setItems((prevItems) => [...prevItems, newFile]);
    } catch (error) {
      console.error("Error uploading file:", error);
      setErrorMessage(
        error.response?.data?.error ||
          "An error occurred while uploading the file."
      );
    }
    // Clear the file input so the same file can be re-uploaded if needed.
    e.target.value = "";
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Toggle the add dialog and clear messages
  const toggleAddDialog = () => {
    setShowAddDialog((prev) => !prev);
    setConfirmationMessage("");
    setErrorMessage("");
    setIsCreatingFolder(false);
    setNewFolderName("");
  };

  // Render icon based on type
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
              onClick={() => handleOpen(item.path, item.type)}
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
