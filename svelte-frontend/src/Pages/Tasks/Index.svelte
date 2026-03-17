<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { teamId } from '$lib/stores/team.js';
  import { api } from '$lib/api/client.js';

  let tasks = [];
  let completedTasks = [];
  let newTaskTitle = '';
  let expandedId = null;
  let editingTask = null;
  let confirmDeleteId = null;
  let completedOpen = false;

  onMount(async () => {
    if (!$teamId) { goto('/teams'); return; }
    await loadTasks();
  });

  async function loadTasks() {
    try {
      const res = await api(`/tasks/${$teamId}/index`);
      // Backend uses paginate() → { data: [...], current_page, ... }
      const all = Array.isArray(res) ? res : (res.data || []);
      tasks = all.filter(t => !t.completed);
      completedTasks = all.filter(t => t.completed);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  }

  async function addTask() {
    if (!newTaskTitle.trim()) return;
    try {
      await api(`/tasks/${$teamId}/store`, {
        method: 'POST',
        body: { title: newTaskTitle, completed: false },
      });
      newTaskTitle = '';
      await loadTasks();
    } catch (err) {
      console.error('Add task failed:', err);
    }
  }

  async function deleteTask(id) {
    try {
      await api(`/tasks/${id}/delete`, { method: 'DELETE' });
      confirmDeleteId = null;
      await loadTasks();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }

  async function toggleComplete(task) {
    try {
      await api(`/tasks/${task.id}/update`, {
        method: 'PUT',
        body: { title: task.title, description: task.description, completed: !task.completed, stared: task.stared, end: task.end, start: task.start, category: task.category },
      });
      await loadTasks();
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  }

  async function toggleStar(task) {
    try {
      await api(`/tasks/${task.id}/update`, {
        method: 'PUT',
        body: { title: task.title, description: task.description, completed: task.completed, stared: !task.stared, end: task.end, start: task.start, category: task.category },
      });
      await loadTasks();
    } catch (err) {
      console.error('Star failed:', err);
    }
  }

  async function saveEdit() {
    if (!editingTask) return;
    try {
      await api(`/tasks/${editingTask.id}/update`, {
        method: 'PUT',
        body: { title: editingTask.title, description: editingTask.description, completed: editingTask.completed, stared: editingTask.stared, end: editingTask.end, start: editingTask.start, category: editingTask.category },
      });
      editingTask = null;
      await loadTasks();
    } catch (err) {
      console.error('Save edit failed:', err);
    }
  }
</script>

<svelte:head>
  <title>Tasks — Platform-IO</title>
</svelte:head>

<div class="tasks-page">
  <div class="tasks-header">
    <h1>Tasks</h1>
  </div>

  <div class="tasks-group">
    <div class="tasks-list">
      {#each tasks as task (task.id)}
        {#if editingTask && editingTask.id === task.id}
          <div class="task-edit-form">
            <div class="task-edit-content">
              <div class="edit-field">
                <label>Title</label>
                <input class="task-edit-input" bind:value={editingTask.title} />
              </div>
              <div class="edit-field">
                <label>Description</label>
                <textarea class="task-edit-description" bind:value={editingTask.description}></textarea>
              </div>
              <div class="edit-field">
                <label>Due Date</label>
                <input type="date" class="task-edit-due" bind:value={editingTask.end} />
              </div>
            </div>
            <div class="edit-form-actions">
              <button class="save-button" on:click={saveEdit}>Save</button>
              <button class="cancel-button" on:click={() => { editingTask = null; }}>Cancel</button>
            </div>
          </div>
        {:else}
          <div class="task-row" class:starred={task.stared}>
            <div class="task-content">
              <div class="task-left">
                <button class="check-button" on:click={() => toggleComplete(task)}>
                  <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
                </button>
                <span class="task-title">{task.title}</span>
              </div>

              <div class="task-center">
                {#if task.end}
                  <span class="due-label">Due:</span>{task.end}
                {/if}
              </div>

              <div class="task-right">
                <button class="caret-button" on:click={() => expandedId = expandedId === task.id ? null : task.id}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points={expandedId === task.id ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}/></svg>
                </button>
                <span class="star-icon" class:active={task.stared} role="button" tabindex="0" on:click={() => toggleStar(task)} on:keydown={(e) => { if (e.key === 'Enter') toggleStar(task); }}>★</span>
                <span class="edit-icon" role="button" tabindex="0" on:click={() => { editingTask = {...task}; }} on:keydown={(e) => { if (e.key === 'Enter') editingTask = {...task}; }}>✏️</span>
                <span class="delete-icon" role="button" tabindex="0" on:click={() => { confirmDeleteId = task.id; }} on:keydown={(e) => { if (e.key === 'Enter') confirmDeleteId = task.id; }}>🗑️</span>
              </div>
            </div>

            {#if confirmDeleteId === task.id}
              <div class="confirm-dialog">
                <span>Delete?</span>
                <div class="confirm-buttons">
                  <button class="confirm-yes" on:click={() => deleteTask(task.id)}>Yes</button>
                  <button class="confirm-no" on:click={() => { confirmDeleteId = null; }}>No</button>
                </div>
              </div>
            {/if}

            {#if expandedId === task.id}
              <div class="task-extra">
                <p>{task.description || 'No description'}</p>
              </div>
            {/if}
          </div>
        {/if}
      {/each}
    </div>
  </div>

  <!-- Completed Section -->
  <div class="completed-section">
    <div class="completed-header" on:click={() => { completedOpen = !completedOpen; }} role="button" tabindex="0" on:keydown={(e) => { if (e.key === 'Enter') completedOpen = !completedOpen; }}>
      <span>Completed ({completedTasks.length})</span>
      <span>{completedOpen ? '▲' : '▼'}</span>
    </div>
    {#if completedOpen}
      <div class="completed-list">
        {#each completedTasks as task (task.id)}
          <div class="completed-task">
            <span class="completed-icon" role="button" tabindex="0" on:click={() => toggleComplete(task)} on:keydown={(e) => { if (e.key === 'Enter') toggleComplete(task); }}>✅</span>
            <span>{task.title}</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Add Task Bar -->
  <div class="add-task-container">
    <input
      type="text"
      placeholder="Add a new task..."
      bind:value={newTaskTitle}
      on:keydown={(e) => { if (e.key === 'Enter') addTask(); }}
    />
    <button class="add-button" on:click={addTask}>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    </button>
  </div>
</div>

<style>
  .tasks-page { padding: 1rem; height: calc(100vh - 60px); display: flex; flex-direction: column; background: #f9fafc; width: 100%; overflow: hidden; }
  .tasks-header h1 { font-size: 2rem; color: #2d3748; font-weight: 600; margin-bottom: 20px; }
  .tasks-group { flex: 1; overflow-y: auto; padding-bottom: 1rem; }
  .tasks-list { display: flex; flex-direction: column; gap: 0.8rem; }

  .task-row { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; position: relative; box-shadow: 0 2px 4px rgba(0,0,0,0.04); animation: slideIn 0.3s ease both; transition: var(--transition); }
  .task-row.starred { border: 2px solid #f6e05e; background-color: #fffcf0; box-shadow: 0 2px 8px rgba(246,224,94,0.15); }

  .task-content { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
  .task-left { display: flex; align-items: center; gap: 0.5rem; }
  .task-title { font-weight: 700; font-size: 1rem; color: #2d3748; }
  .task-center { flex: 1; text-align: center; color: #a0aec0; font-size: 0.95rem; }
  .task-right { display: flex; gap: 0.6rem; align-items: center; }
  .due-label { font-weight: 500; margin-right: 4px; }

  .check-button { background: none; border: none; cursor: pointer; padding: 0; }
  .check-icon { color: #cbd5e0; transition: var(--transition); }
  .check-button:hover .check-icon { color: #4299e1; transform: scale(1.1); }

  .caret-button { background: none; border: none; cursor: pointer; color: #718096; transition: transform 0.2s ease; padding: 0; }
  .caret-button:hover { transform: scale(1.2); }

  .star-icon, .edit-icon, .delete-icon { font-size: 1.3rem; cursor: pointer; transition: var(--transition); }
  .star-icon:hover { transform: scale(1.2); color: #f6ad55; }
  .star-icon.active { color: #f6ad55; }
  .edit-icon:hover { color: #4299e1; transform: scale(1.1); }
  .delete-icon:hover { color: #f56565; transform: scale(1.1); }

  .confirm-dialog { position: relative; background: white; padding: 0.8rem 1rem; border-radius: 8px; box-shadow: var(--shadow-light); display: flex; gap: 1rem; align-items: center; border: 1px solid #e2e8f0; height: 60px; width: 260px; z-index: 1000; margin-top: 8px; }
  .confirm-buttons { display: flex; gap: 0.5rem; }
  .confirm-yes, .confirm-no { padding: 0.4rem 0.6rem; border: 2px solid; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 600; color: white; }
  .confirm-yes { background: #48bb78; }
  .confirm-no { background: #f56565; }
  .confirm-yes:hover { border-color: #48bb78; background: white; color: #48bb78; }
  .confirm-no:hover { border-color: #f56565; background: white; color: #f56565; }

  .task-extra { margin-top: 0.8rem; padding-top: 0.8rem; border-top: 1px solid #e2e8f0; animation: fadeIn 0.3s ease; }
  .task-extra p { margin: 0; font-size: 0.95rem; color: #4a5568; }

  .completed-section { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; margin-top: auto; box-shadow: 0 2px 4px rgba(0,0,0,0.04); overflow: hidden; }
  .completed-header { display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 0.8rem 1rem; background: #f8f9fa; border-radius: 8px; transition: background 0.2s ease; }
  .completed-header:hover { background: #f1f3f5; }
  .completed-list { display: flex; flex-direction: column; gap: 0.6rem; margin-top: 0.5rem; }
  .completed-task { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #48bb78; }
  .completed-icon { cursor: pointer; font-size: 1.4rem; transition: transform 0.2s ease; }
  .completed-icon:hover { transform: scale(1.1); }

  .add-task-container { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1rem 1.5rem; display: flex; gap: 1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.08); margin-top: 1rem; }
  .add-task-container input { flex: 1; padding: 0.8rem 1.2rem; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem; background: #f8f9fa; transition: var(--transition); }
  .add-task-container input:focus { border-color: #4299e1; outline: none; background: #fff; box-shadow: var(--shadow-focus); }
  .add-button { background: #0052d4; color: white; border: none; padding: 0.8rem 1.4rem; border-radius: 8px; cursor: pointer; transition: var(--transition); display: flex; align-items: center; }
  .add-button:hover { background: #0041ac; transform: scale(1.1); }

  .task-edit-form { padding: 1rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; display: flex; flex-direction: column; gap: 1rem; }
  .task-edit-content { display: flex; flex-direction: column; gap: 1rem; }
  .edit-field { display: flex; flex-direction: column; gap: 6px; }
  .edit-field label { font-size: 0.9rem; color: #4a5568; font-weight: 600; }
  .task-edit-input, .task-edit-due, .task-edit-description { padding: 0.8rem; border: 1px solid #cbd5e0; border-radius: 8px; font-size: 1rem; color: #2d3748; }
  .task-edit-description { min-height: 80px; resize: vertical; }
  .edit-form-actions { display: flex; gap: 1rem; justify-content: flex-end; }
  .save-button, .cancel-button { background: #4dabf7; color: white; padding: 0.8rem 1.4rem; border-radius: 8px; cursor: pointer; transition: var(--transition); }
  .save-button:hover, .cancel-button:hover { background: #0041ac; transform: scale(1.1); }

  @keyframes slideIn {
    from { transform: translateX(20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
</style>
