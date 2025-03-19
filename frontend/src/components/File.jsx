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
          // Passing currentPath so backend might use it if needed:
          params: { path: currentPath },
        }
      );
  
      const allItems = response.data.directory; // e.g. ["1", "1/2", "1/2/gg"]
  
      let filtered = [];
  
      if (currentPath === "/") {
        // At root, we show only items with no slash – direct children only.
        filtered = allItems.filter((item) => !item.includes("/"));
      } else {
        // For a non-root currentPath, normalize it (ensure it ends with a slash)
        const normalizedPath = currentPath.endsWith("/") ? currentPath : currentPath + "/";
        // Filter for items that start with normalizedPath AND whose remainder doesn't include a slash.
        filtered = allItems.filter((item) => {
          if (!item.startsWith(normalizedPath)) return false;
          // Remove the normalized prefix; if there’s no further slash, it's an immediate child.
          const remainder = item.slice(normalizedPath.length);
          return !remainder.includes("/");
        });
      }
  
      // Map the filtered full paths into objects.
      // We use the full path as our unique key.
      const fetchedItems = filtered.map((fullPath) => {
        // For display, take the last segment (split by "/")
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
  
    // Ensure currentPath ends with a slash.
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
      if(path == "/")path +=folderName;
      else path = path += "/"+folderName;
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
  const handleOpen = async (itemPath) => {
    // try {
    //   const response = await axios.get(
    //     `http://localhost:8000/api/folders/${teamId}/show/`,
    //     {
    //       headers: {
    //         Authorization: `Bearer ${token}`,
    //         "Content-Type": "application/json",
    //       },
    //       params: { path: itemPath },
    //     }
    //   );
    //   // console.log(itemPath, response);
    //   // Map the returned full paths into items.
    //   const newItems = (response.data.folders || []).map((fullPath) => {
    //     return {
    //       path: fullPath, // use the full path directly
    //       name: fullPath.split("/").pop(),
    //       type: "folder",
    //     };
    //   });
    //   console.log("newitems: ",newItems);
    //   console.log(itemPath);
    //   // Set the currentPath exactly to the folder you just opened.
      setCurrentPath(itemPath);
      setMenuItemPath(null);
    // } catch (error) {
    //   console.error("Error opening folder:", error);
    //   setErrorMessage("An error occurred while opening the folder.");
    // }
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

  const handleShare = (itemPath) => {
    console.log("Share folder at path:", itemPath);
    setMenuItemPath(null);
  };

  // "Back" button: navigate to the parent directory
  const handleBack = () => {
    if (currentPath === "/") return; // already at root
    let p = currentPath.split("/");
    p.pop();
    let newPath = p.join("/");
    if(newPath===""){
      newPath="/";
    }
    setCurrentPath(newPath);
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
              <button
                className="add-dialog-item3"
                onClick={() => console.log("Add File")}
              >
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
            <div key={item.path}
            className="item-card"
            onClick={() => handleOpen(item.path)}
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
                    onClick={() =>
                      console.log("Download item:", item.path)
                    }
                  >
                    <IoMdDownload /> Download
                  </button>
                  <button
                    className="item-menu-item delete-item"
                    onClick={() => handleDelete(item.path)}
                  >
                    <MdDelete /> Delete
                  </button>
                  <button
                    className="item-menu-item share-item"
                    onClick={() => handleShare(item.path)}
                  >
                    Share
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
