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
  // States for items, menus, messages, and current path
  const [items, setItems] = useState([]);
  const [menuItemPath, setMenuItemPath] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  // Track current directory path (default root)
  const [currentPath, setCurrentPath] = useState("/");

  const helpRef = useRef(null);
  const tooltipRef = useRef(null);
  const fileInputRef = useRef(null);

  const teamId = localStorage.getItem("teamId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Handle click outside (if you add a tooltip later)
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

  // API call to fetch directory data based on currentPath
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
      console.log("index: ", data);
      setItems(data);
    }
    fetchData();
  }, [teamId, token, currentPath]);

  // Create a new folder using the API
  const handleCreateFolder = async () => {
    const folderName = window.prompt("Enter a folder name:");
    if (!folderName) return;
  
    try {
      const response = await axios.post(
        `http://localhost:8000/api/folders/${teamId}/store`,
        {
          name: folderName,
          path: currentPath, // create folder inside currentPath
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      let path = currentPath;
      if (path === "/") path += folderName;
      else path = path + "/" + folderName;
      setConfirmationMessage(response.data.message || "Folder created successfully!");
      const newFolder = {
        path: path,
        name: folderName,
        type: "folder",
      };
      // Add the new folder to the list.
      setItems((prevItems) => [...prevItems, newFolder]);
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

  // "Back" button: navigate to the parent directory
  const handleBack = () => {
    if (currentPath === "/") return; // already at root
    let p = currentPath.split("/");
    p.pop();
    let newPath = p.join("/");
    if(newPath === ""){
      newPath = "/";
    }
    setCurrentPath(newPath);
  };

  // Upload file feature (only changes in this section)
  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", currentPath); // Send the current directory path
    console.log(file,currentPath);
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
      setConfirmationMessage(response.data.message || "File uploaded successfully!");
      // Optionally, update your items state to include the new file.
      const newFile = {
        path: response.data.file.path, // assuming the API returns the file object
        name: response.data.file.path.split("/").pop(),
        type: response.data.file.type,
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
          {/* Display the current path */}
          <p className="current-path">Current Path: {currentPath}</p>
          {currentPath !== "/" && (
            <button className="back-button" onClick={handleBack}>
              Back
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
              <button className="add-dialog-item2" onClick={handleCreateFolder}>
                <FaFolderPlus /> Create Folder
              </button>
              {confirmationMessage && (
                <div className="confirmation-message">{confirmationMessage}</div>
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
          {items.map((item) => (
            <div
              key={item.path}
              className="item-card"
              onClick={() => handleOpen(item.path, item.type)}
            >
              <div className="item-icon">{renderItemIcon(item)}</div>
              <p className="item-name">{item.name}</p>
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
