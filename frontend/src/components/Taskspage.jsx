import axios from "axios";
import { useEffect, useState } from "react";
import {
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiCircle,
  FiEdit,
  FiPlus,
  FiStar,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import "./Taskspage.css";

// Helper function to format the due date in a cleaner style
function formatDueDate(dateStr) {
  if (!dateStr) return "";
  const dateObj = new Date(dateStr);
  // Adjust the options to your preference
  return dateObj.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [newTask, setNewTask] = useState("");

  // Controls whether the "Completed Tasks" section is expanded
  const [showCompleted, setShowCompleted] = useState(false);

  // For delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Which task is in "edit mode"?
  const [currentEditingTask, setCurrentEditingTask] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingDueDate, setEditingDueDate] = useState("");

  // For toggling the details (description, etc.) of each task
  const [expandedTasks, setExpandedTasks] = useState([]);
  const toggleExpand = (id) => {
    setExpandedTasks((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // For animation after a task is edited
  const [editedTaskId, setEditedTaskId] = useState(null);

  // Retrieve token and teamId from localStorage
  const token = localStorage.getItem("token");
  const teamId = localStorage.getItem("teamId");

  // Initial data fetch
  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/tasks/${teamId}/index`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      .then((response) => {
        if (!response.data || !response.data.data) {
          console.error("Unexpected API response:", response.data);
          return;
        }
        const formattedTasks = response.data.data
          .map((task) => ({
            id: task.id,
            title: task.title || "Untitled Task",
            description: task.description || "",
            dueDate: task.end || "",
            completed: task.completed ?? false,
            starred: task.stared ?? false,
          }))
          .sort((a, b) => b.starred - a.starred);

        setTasks(formattedTasks.filter((t) => !t.completed));
        setCompleted(formattedTasks.filter((t) => t.completed));
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
      });
  }, [teamId, token]);

  // Create a new task
  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    try {
      const response = await axios.post(
        `http://localhost:8000/api/tasks/${teamId}/store`,
        {
          title: newTask.trim(),
          // Do NOT copy the title into description; leave description empty
          description: "",
          stared: false,
          start: new Date().toISOString().slice(0, 19).replace("T", " "),
          end: null,
          completed: false,
          category: "General",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      const newTaskData = response.data;
      const formattedTask = {
        id: newTaskData.id,
        title: newTaskData.title,
        description: newTaskData.description || "",
        dueDate: newTaskData.end || "",
        completed: newTaskData.completed ?? false,
        starred: newTaskData.stared ?? false,
      };
      setTasks((prev) =>
        [...prev, formattedTask].sort((a, b) => b.starred - a.starred)
      );
      setNewTask("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // Enter edit mode for a task
  const handleEditTask = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    setCurrentEditingTask(id);
    setEditingTitle(task.title);
    setEditingDescription(task.description);
    setEditingDueDate(task.dueDate);
  };

  // Save the edited task
  const handleEditSave = async () => {
    if (!editingTitle.trim()) return;
    try {
      await axios.put(
        `http://localhost:8000/api/tasks/${currentEditingTask}/update`,
        {
          title: editingTitle,
          description: editingDescription,
          end: editingDueDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      // Update local state
      setTasks((prev) =>
        prev.map((task) =>
          task.id === currentEditingTask
            ? {
                ...task,
                title: editingTitle,
                description: editingDescription,
                dueDate: editingDueDate,
              }
            : task
        )
      );
      setCompleted((prev) =>
        prev.map((task) =>
          task.id === currentEditingTask
            ? {
                ...task,
                title: editingTitle,
                description: editingDescription,
                dueDate: editingDueDate,
              }
            : task
        )
      );
      // Trigger an animation
      setEditedTaskId(currentEditingTask);
      setTimeout(() => setEditedTaskId(null), 1000);

      // Exit edit mode
      setCurrentEditingTask(null);
      setEditingTitle("");
      setEditingDescription("");
      setEditingDueDate("");
    } catch (error) {
      console.error("Error editing task:", error);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setCurrentEditingTask(null);
    setEditingTitle("");
    setEditingDescription("");
    setEditingDueDate("");
  };

  // Mark a task as completed
  const handleCompleteTask = async (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    try {
      await axios.put(
        `http://localhost:8000/api/tasks/${id}/update`,
        {
          title: task.title,
          description: task.description,
          completed: true,
          stared: task.starred,
          start: new Date().toISOString().slice(0, 19).replace("T", " "),
          end: task.dueDate,
          category: "General",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setCompleted((prev) => [...prev, { ...task, completed: true }]);
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  // Mark a completed task as uncompleted
  const handleUncompleteTask = async (id) => {
    const task = completed.find((t) => t.id === id);
    if (!task) return;
    try {
      await axios.put(
        `http://localhost:8000/api/tasks/${id}/update`,
        {
          title: task.title,
          description: task.description,
          completed: false,
          stared: task.starred,
          start: new Date().toISOString().slice(0, 19).replace("T", " "),
          end: task.dueDate,
          category: "General",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      setCompleted((prev) => prev.filter((t) => t.id !== id));
      setTasks((prev) => [...prev, { ...task, completed: false }]);
    } catch (error) {
      console.error("Error uncompleting task:", error);
    }
  };

  // Toggle the "starred" status of a task
  const handleStar = async (id) => {
    const task =
      tasks.find((t) => t.id === id) || completed.find((t) => t.id === id);
    if (!task) return;
    try {
      await axios.put(
        `http://localhost:8000/api/tasks/${id}/update`,
        {
          title: task.title,
          description: task.description,
          completed: task.completed,
          stared: !task.starred,
          start: new Date().toISOString().slice(0, 19).replace("T", " "),
          end: task.dueDate,
          category: "General",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      setTasks((prev) => {
        const updatedTasks = prev.map((t) =>
          t.id === id ? { ...t, starred: !t.starred } : t
        );
        return updatedTasks.sort((a, b) => b.starred - a.starred);
      });
      setCompleted((prev) => {
        const updatedCompleted = prev.map((t) =>
          t.id === id ? { ...t, starred: !t.starred } : t
        );
        return updatedCompleted.sort((a, b) => b.starred - a.starred);
      });
    } catch (error) {
      console.error("Error updating starred status:", error);
    }
  };

  // Delete a task
  const handleDeleteTask = async (id) => {
    setDeletingId(id);
    try {
      await axios.delete(`http://localhost:8000/api/tasks/${id}/delete`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      setTasks((prev) => prev.filter((task) => task.id !== id));
      setCompleted((prev) => prev.filter((task) => task.id !== id));
      setConfirmDeleteId(null);
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="tasks-page">
      <header className="tasks-header">
        <h1>Team Name - Project Name</h1>
      </header>

      <div className="tasks-group">
        <div className="tasks-list">
          {tasks.map((task) =>
            currentEditingTask === task.id ? (
              // EDIT MODE
              <div className="task-row task-edit-form" key={task.id}>
                <div className="task-edit-content">
                  <div className="edit-field">
                    <label htmlFor="title">Title</label>
                    <input
                      id="title"
                      type="text"
                      className="task-edit-input"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      placeholder="Task Title"
                    />
                  </div>

                  <div className="edit-field">
                    <label htmlFor="dueDate">Due Date</label>
                    <input
                      id="dueDate"
                      type="datetime-local"
                      className="task-edit-due"
                      value={editingDueDate}
                      onChange={(e) => setEditingDueDate(e.target.value)}
                    />
                  </div>

                  <div className="edit-field">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      className="task-edit-description"
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      placeholder="Task Description"
                    ></textarea>
                  </div>

                  <div className="edit-form-actions">
                    <button className="save-button" onClick={handleEditSave}>
                      Save
                    </button>
                    <button className="cancel-button" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // NON-EDIT VIEW
              <div
                className={`task-row ${task.starred ? "starred" : ""} ${
                  deletingId === task.id ? "deleting" : ""
                } ${editedTaskId === task.id ? "task-edited" : ""}`}
                key={task.id}
              >
                <div className="task-content">
                  {/* Left side: check circle + bold title */}
                  <div className="task-left">
                    <button
                      className="check-button"
                      onClick={() => handleCompleteTask(task.id)}
                      aria-label="Complete task"
                    >
                      <FiCircle className="check-icon" />
                    </button>
                    <span className="task-title">{task.title}</span>
                  </div>

                  {/* Center: formatted due date in gray */}
                  <div className="task-center">
                    {formatDueDate(task.dueDate)}
                  </div>

                  {/* Right side: caret, star, edit, delete */}
                  <div className="task-right">
                    <button
                      className="caret-button"
                      onClick={() => toggleExpand(task.id)}
                      aria-label="Toggle details"
                    >
                      {expandedTasks.includes(task.id) ? (
                        <FiChevronUp />
                      ) : (
                        <FiChevronDown />
                      )}
                    </button>
                    <FiStar
                      className={`star-icon ${task.starred ? "active" : ""}`}
                      onClick={() => handleStar(task.id)}
                    />
                    <FiEdit
                      className="edit-icon"
                      onClick={() => handleEditTask(task.id)}
                    />
                    <FiTrash2
                      className="delete-icon"
                      onClick={() => setConfirmDeleteId(task.id)}
                    />
                  </div>
                </div>

                {/* Confirm Delete Dialog */}
                {confirmDeleteId === task.id && (
                  <div className="confirm-dialog">
                    <span>Delete this task?</span>
                    <div className="confirm-buttons">
                      <button
                        className="confirm-yes"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <FiCheck />
                      </button>
                      <button
                        className="confirm-no"
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        <FiX />
                      </button>
                    </div>
                  </div>
                )}

                {/* Expanded description area (only if description is not empty) */}
                {expandedTasks.includes(task.id) && task.description && (
                  <div className="task-extra">
                    <p>{task.description}</p>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* Completed Tasks Section */}
      <div className="completed-section">
        <div
          className="completed-header"
          onClick={() => setShowCompleted(!showCompleted)}
        >
          <span>Completed Tasks ({completed.length})</span>
          {showCompleted ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        {showCompleted && (
          <div className="completed-list">
            {completed.length > 0 ? (
              completed.map((task) => (
                <div className="completed-task" key={task.id}>
                  <FiCheckCircle
                    className="completed-icon"
                    onClick={() => handleUncompleteTask(task.id)}
                  />
                  <span className="completed-text">{task.title}</span>
                </div>
              ))
            ) : (
              <div className="empty-state">No completed tasks yet</div>
            )}
          </div>
        )}
      </div>

      {/* Add Task Bar */}
      <footer className="add-task-container">
        <input
          type="text"
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
        />
        <button className="add-button" onClick={handleAddTask}>
          <FiPlus />
        </button>
      </footer>
    </div>
  );
}
