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

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const token = localStorage.getItem("token");
  const teamId = localStorage.getItem("teamId");
  useEffect(() => {
    axios.get(`http://localhost:8000/api/tasks/${teamId}/index`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      .then((response) => {
        // console.log(response.data);
        if (!response.data || !response.data.data) {
          console.error("Unexpected API response:", response.data);
          return;
        }
  
        const formattedTasks = response.data.data.map((task) => ({
          id: task.id,
          text: task.title || "Untitled Task",
          completed: task.completed ?? false,
          starred: task.stared ?? false,
          editing: false,
        })).sort((a, b) => b.starred - a.starred);
  
        setTasks(formattedTasks.filter((task) => !task.completed));
        setCompleted(formattedTasks.filter((task) => task.completed));
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
      });
  }, []);
  
  

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
  
    try {
      const response = await axios.post(
        `http://localhost:8000/api/tasks/${teamId}/store`,
        {
          title: newTask.trim(),
          description: newTask.trim(), // Assuming description is the same as the title
          stared: false, // Matches backend field name
          start: new Date().toISOString().slice(0, 19).replace("T", " "), // Current timestamp
          end: null, // No specific end date
          completed: false,
          category: "General", // Default category (adjust as needed)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Bearer token for authentication
            Accept: "application/json", // Ensures JSON response
            "Content-Type": "application/json",
          },
        }
      );
  
      const newTaskData = response.data; // Assuming API returns the created task
  
      const formattedTask = {
        id: newTaskData.id,
        text: newTaskData.title,
        completed: newTaskData.completed ?? false,
        starred: newTaskData.stared ?? false, // Convert to frontend format
        editing: false,
      };
  
      setTasks((prev) => [...prev, formattedTask].sort((a, b) => b.starred - a.starred));
      setNewTask("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };
  

  const handleEditTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, editing: true } : t))
    );
  };

  const handleEditSave = async (id, newText) => {
    if(!newText.trim()) return;
    try {
      await axios.put(
        `http://localhost:8000/api/tasks/${id}/update`,
        {
          title: newText,
          description: newText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, text: newText, editing: false } : task)));
      setCompleted((prev) => prev.map((task) => (task.id === id ? { ...task, text: newText, editing: false } : task)));
    } catch (error) {
      console.error("Error editing task:", error);
    }
  };

  // const handleStar = (id) => {
  //   setTasks((prev) =>
  //     prev
  //       .map((t) => (t.id === id ? { ...t, starred: !t.starred } : t))
  //       .sort((a, b) => b.starred - a.starred)
  //   );
  // };
  const handleCompleteTask = async (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    try {
      const response = await axios.put(
        `http://localhost:8000/api/tasks/${id}/update`,
        {
          title: task.text,
          description: task.text,
          completed: true,
          stared: task.starred,
          start: new Date().toISOString().slice(0, 19).replace("T", " "),
          end: null,
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
  const handleUncompleteTask = async (id) => {
    const task = completed.find((t) => t.id === id);
    if (!task) return;

    try {
      await axios.put(
        `http://localhost:8000/api/tasks/${id}/update`,
        {
          title: task.text,
          description: task.text,
          completed: false,
          stared: task.starred,
          start: new Date().toISOString().slice(0, 19).replace("T", " "),
          end: null,
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
  const handleStar = async (id) => {
    const task = tasks.find((t) => t.id === id) || completed.find((t) => t.id === id);
    if (!task) return;

    try {
      await axios.put(
        `http://localhost:8000/api/tasks/${id}/update`,
        {
          title: task.text,
          description: task.text,
          completed: task.completed,
          stared: !task.starred,
          start: new Date().toISOString().slice(0, 19).replace("T", " "),
          end: null,
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
        const updatedTasks = prev.map((t) => (t.id === id ? { ...t, starred: !t.starred } : t));
        return updatedTasks.sort((a, b) => b.starred - a.starred);
      });

      setCompleted((prev) => {
        const updatedCompleted = prev.map((t) => (t.id === id ? { ...t, starred: !t.starred } : t));
        return updatedCompleted.sort((a, b) => b.starred - a.starred);
      });
    } catch (error) {
      console.error("Error updating starred status:", error);
    }
  };
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
          {tasks.map((task) => (
            <div
              className={`task-row ${task.starred ? "starred" : ""} ${
                deletingId === task.id ? "deleting" : ""
              }`}
              key={task.id}
            >
              <div className="task-content">
                <button
                  className="check-button"
                  onClick={() => handleCompleteTask(task.id)}
                  aria-label="Complete task"
                >
                  <FiCircle className="check-icon" />
                </button>

                {task.editing ? (
                  <input
                    className="task-edit-input"
                    defaultValue={task.text}
                    autoFocus
                    onBlur={(e) => handleEditSave(task.id, e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      handleEditSave(task.id, e.target.value)
                    }
                  />
                ) : (
                  <span className="task-text">{task.text}</span>
                )}

                <div className="task-actions">
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
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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
                  <span className="completed-text">{task.text}</span>
                </div>
              ))
            ) : (
              <div className="empty-state">No completed tasks yet</div>
            )}
          </div>
        )}
      </div>

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
