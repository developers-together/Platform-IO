// resources/js/components/TasksPage.jsx
import { useState } from 'react';
import { FiCheckSquare, FiChevronDown, FiChevronUp, FiEdit2, FiPlus, FiStar, FiTrash2 } from 'react-icons/fi';
import './TasksPage.css';

export default function TasksPage({ sidebarOpen, setSidebarOpen, currentPage, setCurrentPage }) {
    const [tasks, setTasks] = useState([
        { id: 1, text: 'Build the initial UI', completed: false, starred: true, editing: false },
        { id: 2, text: 'Fix the bugs', completed: false, starred: false, editing: false },
        { id: 3, text: 'Refactor code', completed: false, starred: false, editing: false },
    ]);

    const [completed, setCompleted] = useState([{ id: 101, text: 'Set up repo', completed: true, starred: false, editing: false }]);

    const [newTask, setNewTask] = useState('');
    const [showCompleted, setShowCompleted] = useState(true);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    // add new task
    const handleAddTask = () => {
        if (!newTask.trim()) return;
        const newObj = {
            id: Date.now(),
            text: newTask.trim(),
            completed: false,
            starred: false,
            editing: false,
        };
        setTasks((prev) => {
            const updated = [...prev, newObj];
            // starred tasks at front
            return updated.sort((a, b) => b.starred - a.starred);
        });
        setNewTask('');
    };

    // confirm or cancel delete
    const handleDeleteTask = (id) => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        setCompleted((prev) => prev.filter((t) => t.id !== id));
        setConfirmDeleteId(null);
    };

    // complete a task => move to completed
    const handleCompleteTask = (id) => {
        const found = tasks.find((t) => t.id === id);
        if (!found) return;
        found.completed = true;
        setTasks((prev) => prev.filter((t) => t.id !== id));
        setCompleted((prev) => [found, ...prev]);
    };

    // un-complete a task => move back to tasks
    const handleUncompleteTask = (id) => {
        const found = completed.find((t) => t.id === id);
        if (!found) return;
        found.completed = false;
        setCompleted((prev) => prev.filter((t) => t.id !== id));
        setTasks((prev) => {
            const updated = [...prev, found];
            return updated.sort((a, b) => b.starred - a.starred);
        });
    };

    // edit a task
    const handleEditTask = (id) => {
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, editing: true } : t)));
    };

    // save edit
    const handleEditSave = (id, newText) => {
        setTasks((prev) =>
            prev.map((t) => {
                if (t.id === id) {
                    return { ...t, text: newText, editing: false };
                }
                return t;
            }),
        );
    };

    // star/unstar => reorder tasks
    const handleStar = (id) => {
        setTasks((prev) => {
            const updated = prev.map((t) => {
                if (t.id === id) {
                    return { ...t, starred: !t.starred };
                }
                return t;
            });
            return updated.sort((a, b) => b.starred - a.starred);
        });
    };

    const renderTaskRow = (task) => {
        const { id, text, starred, editing } = task;
        return (
            <div className="task-row glass-card" key={id}>
                <span className="circle-check" onClick={() => handleCompleteTask(id)}></span>

                {editing ? (
                    <input
                        className="task-edit-input"
                        defaultValue={text}
                        autoFocus
                        onBlur={(e) => handleEditSave(id, e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleEditSave(id, e.target.value);
                            }
                        }}
                    />
                ) : (
                    <span className={`task-text ${starred ? 'starred-text' : ''}`}>{text}</span>
                )}

                {/* always show star, hover for edit/trash */}
                <div className="task-icons">
                    <FiStar className={`task-icon star-icon ${starred ? 'starred' : ''}`} onClick={() => handleStar(id)} />
                    <FiEdit2 className="task-icon edit-icon" onClick={() => handleEditTask(id)} />
                    <FiTrash2 className="task-icon delete-icon" onClick={() => setConfirmDeleteId(id)} />
                </div>

                {confirmDeleteId === id && (
                    <div className="confirm-bubble fade-in">
                        <span>Delete task?</span>
                        <button onClick={() => handleDeleteTask(id)}>Yes</button>
                        <button onClick={() => setConfirmDeleteId(null)}>No</button>
                    </div>
                )}
            </div>
        );
    };

    const renderCompletedRow = (task) => (
        <div className="task-row completed glass-card" key={task.id}>
            <FiCheckSquare className="completed-check" onClick={() => handleUncompleteTask(task.id)} />
            <span className="completed-text">{task.text}</span>
        </div>
    );

    return (
        <div className="tasks-page-wrapper">
            <div className="tasks-page-content">
                <header className="tasks-header">Team name - project name</header>

                <div className="tasks-center">{tasks.map((t) => !t.completed && renderTaskRow(t))}</div>

                <div className="completed-section">
                    <div className="completed-header" onClick={() => setShowCompleted(!showCompleted)}>
                        Completed tasks {showCompleted ? <FiChevronUp /> : <FiChevronDown />}
                    </div>
                    {showCompleted && <div className="completed-container">{completed.map((t) => renderCompletedRow(t))}</div>}
                </div>

                <div className="add-task-bar glass-card">
                    <span className="plus-icon" onClick={handleAddTask} title="Add Task">
                        <FiPlus />
                    </span>
                    <input
                        type="text"
                        placeholder="Add a task..."
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddTask();
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
