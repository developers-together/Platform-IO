import axios from 'axios';
import { useEffect, useState } from 'react';
import { FiCheck, FiCheckCircle, FiChevronDown, FiChevronUp, FiCircle, FiEdit, FiPlus, FiStar, FiTrash2, FiX } from 'react-icons/fi';
import './Taskspage.css';

export default function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [completed, setCompleted] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [showCompleted, setShowCompleted] = useState(true);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        axios
            .get('http://localhost:8000/api/tasks/index')
            .then((response) => {
                const formattedTasks = response.data.map((task) => ({
                    id: task.id || Date.now(),
                    text: task.title || 'Untitled Task',
                    completed: task.completed ?? false,
                    starred: false,
                    editing: false,
                }));
                setTasks(formattedTasks.filter((task) => !task.completed));
                setCompleted(formattedTasks.filter((task) => task.completed));
            })
            .catch((error) => console.error('Error fetching tasks:', error));
    }, []);

    const handleAddTask = () => {
        if (!newTask.trim()) return;
        const newObj = {
            id: Date.now(),
            text: newTask.trim(),
            completed: false,
            starred: false,
            editing: false,
        };
        setTasks((prev) => [...prev, newObj].sort((a, b) => b.starred - a.starred));

        axios.post('http://localhost:8000/api/tasks/store', {
            title: newObj.text,
            description: newObj.text || null,
            due_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
            date: new Date().toISOString().slice(0, 19).replace('T', ' '),
            colour: 'red',
            completed: false,
            team_id: '1',
        });

        setNewTask('');
    };

    const handleDeleteTask = (id) => {
        setDeletingId(id);
        setTimeout(() => {
            setTasks((prev) => prev.filter((t) => t.id !== id));
            setCompleted((prev) => prev.filter((t) => t.id !== id));
            setConfirmDeleteId(null);
            setDeletingId(null);

            axios.delete('http://localhost:8000/api/tasks/destroy', {
                data: { task_id: id },
                headers: { 'Content-Type': 'application/json' },
            });
        }, 300);
    };

    const handleCompleteTask = (id) => {
        const found = tasks.find((t) => t.id === id);
        if (!found) return;
        setTasks((prev) => prev.filter((t) => t.id !== id));
        setCompleted((prev) => [found, ...prev]);
    };

    const handleUncompleteTask = (id) => {
        const found = completed.find((t) => t.id === id);
        if (!found) return;
        setCompleted((prev) => prev.filter((t) => t.id !== id));
        setTasks((prev) => [...prev, found].sort((a, b) => b.starred - a.starred));
    };

    const handleEditTask = (id) => {
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, editing: true } : t)));
    };

    const handleEditSave = (id, newText) => {
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, text: newText, editing: false } : t)));
    };

    const handleStar = (id) => {
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, starred: !t.starred } : t)).sort((a, b) => b.starred - a.starred));
    };

    return (
        <div className="tasks-page">
            <header className="tasks-header">
                <h1>Team Name - Project Name</h1>
            </header>

            <div className="tasks-group">
                <div className="tasks-list">
                    {tasks.map((task) => (
                        <div className={`task-row ${task.starred ? 'starred' : ''} ${deletingId === task.id ? 'deleting' : ''}`} key={task.id}>
                            <div className="task-content">
                                <button className="check-button" onClick={() => handleCompleteTask(task.id)} aria-label="Complete task">
                                    <FiCircle className="check-icon" />
                                </button>

                                {task.editing ? (
                                    <input
                                        className="task-edit-input"
                                        defaultValue={task.text}
                                        autoFocus
                                        onBlur={(e) => handleEditSave(task.id, e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleEditSave(task.id, e.target.value)}
                                    />
                                ) : (
                                    <span className="task-text">{task.text}</span>
                                )}

                                <div className="task-actions">
                                    <FiStar className={`star-icon ${task.starred ? 'active' : ''}`} onClick={() => handleStar(task.id)} />
                                    <FiEdit className="edit-icon" onClick={() => handleEditTask(task.id)} />
                                    <FiTrash2 className="delete-icon" onClick={() => setConfirmDeleteId(task.id)} />
                                    {confirmDeleteId === task.id && (
                                        <div className="confirm-dialog">
                                            <span>Delete this task?</span>
                                            <div className="confirm-buttons">
                                                <button className="confirm-yes" onClick={() => handleDeleteTask(task.id)}>
                                                    <FiCheck />
                                                </button>
                                                <button className="confirm-no" onClick={() => setConfirmDeleteId(null)}>
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
                <div className="completed-header" onClick={() => setShowCompleted(!showCompleted)}>
                    <span>Completed Tasks ({completed.length})</span>
                    {showCompleted ? <FiChevronUp /> : <FiChevronDown />}
                </div>
                {showCompleted && (
                    <div className="completed-list">
                        {completed.length > 0 ? (
                            completed.map((task) => (
                                <div className="completed-task" key={task.id}>
                                    <FiCheckCircle className="completed-icon" onClick={() => handleUncompleteTask(task.id)} />
                                    <span className="completed-text">{task.text}</span>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">No completed tasks yet</div>
                        )}
                    </div>
                )}
            </div>

            <div className="add-task-container">
                <input
                    type="text"
                    placeholder="Add a new task..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                />
                <button className="add-button" onClick={handleAddTask}>
                    <FiPlus />
                </button>
            </div>
        </div>
    );
}
