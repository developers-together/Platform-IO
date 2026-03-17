<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { teamId } from '$lib/stores/team.js';
  import { api } from '$lib/api/client.js';

  let folders = [];
  let files = [];
  let activeFolder = null;
  let newFolderName = '';
  let showNewFolder = false;
  let aiPrompt = '';
  let aiFileName = '';
  let showAiCreate = false;

  onMount(async () => {
    if (!$teamId) { goto('/teams'); return; }
    await loadData();
  });

  async function loadData() {
    try {
      const [fData, fiData] = await Promise.all([
        api(`/folders/${$teamId}/index`).catch(() => []),
        api(`/files/${$teamId}/index`).catch(() => []),
      ]);
      folders = fData.folders || fData || [];
      files = fiData.files || fiData || [];
    } catch (err) { console.error(err); }
  }

  async function createFolder() {
    if (!newFolderName.trim()) return;
    try {
      await api(`/folders/${$teamId}/store`, { method: 'POST', body: { name: newFolderName } });
      newFolderName = '';
      showNewFolder = false;
      await loadData();
    } catch (err) { console.error(err); }
  }

  async function deleteFolder(id) {
    try {
      await api(`/folders/${id}/delete`, { method: 'DELETE' });
      if (activeFolder?.id === id) activeFolder = null;
      await loadData();
    } catch (err) { console.error(err); }
  }

  async function uploadFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    if (activeFolder) formData.append('folder_id', activeFolder.id);
    try {
      await api(`/files/${$teamId}/store`, { method: 'POST', body: formData });
      await loadData();
    } catch (err) { console.error(err); }
  }

  async function deleteFile(id) {
    try {
      await api(`/files/${id}/delete`, { method: 'DELETE' });
      await loadData();
    } catch (err) { console.error(err); }
  }

  async function downloadFile(id) {
    window.open(`/api/files/${$teamId}/download?file_id=${id}`, '_blank');
  }

  async function aiCreateFile() {
    if (!aiPrompt.trim() || !aiFileName.trim()) return;
    try {
      await api(`/files/${$teamId}/aicreate`, {
        method: 'POST',
        body: { prompt: aiPrompt, filename: aiFileName },
      });
      aiPrompt = '';
      aiFileName = '';
      showAiCreate = false;
      await loadData();
    } catch (err) { console.error(err); }
  }

  function getFilesForFolder(folderId) {
    return files.filter(f => f.folder_id === folderId);
  }

  $: displayFiles = activeFolder ? getFilesForFolder(activeFolder.id) : files;
</script>

<svelte:head><title>Files — Platform-IO</title></svelte:head>

<div class="file-page">
  <div class="file-sidebar">
    <div class="file-sidebar-header">
      <h3>📁 Folders</h3>
      <button on:click={() => showNewFolder = !showNewFolder}>+</button>
    </div>

    {#if showNewFolder}
      <div class="new-folder-input">
        <input placeholder="Folder name" bind:value={newFolderName} on:keydown={(e) => { if (e.key === 'Enter') createFolder(); }} />
        <button on:click={createFolder}>Create</button>
      </div>
    {/if}

    <ul class="folder-list">
      <li class:active={!activeFolder} on:click={() => { activeFolder = null; }} role="button" tabindex="0" on:keydown={(e) => { if (e.key === 'Enter') activeFolder = null; }}>
        📂 All Files
      </li>
      {#each folders as folder (folder.id)}
        <li class:active={activeFolder?.id === folder.id} on:click={() => { activeFolder = folder; }} role="button" tabindex="0" on:keydown={(e) => { if (e.key === 'Enter') activeFolder = folder; }}>
          <span>📂 {folder.name}</span>
          <button class="delete-folder-btn" on:click|stopPropagation={() => deleteFolder(folder.id)}>🗑️</button>
        </li>
      {/each}
    </ul>
  </div>

  <div class="file-content">
    <div class="file-toolbar">
      <h2>{activeFolder ? activeFolder.name : 'All Files'}</h2>
      <div class="toolbar-actions">
        <label class="upload-btn">
          📤 Upload
          <input type="file" on:change={uploadFile} style="display:none" />
        </label>
        <button class="ai-create-btn" on:click={() => showAiCreate = !showAiCreate}>🤖 AI Create</button>
      </div>
    </div>

    {#if showAiCreate}
      <div class="ai-create-form">
        <input placeholder="File name" bind:value={aiFileName} />
        <textarea placeholder="Describe what the file should contain..." bind:value={aiPrompt}></textarea>
        <button on:click={aiCreateFile}>Create with AI</button>
      </div>
    {/if}

    <div class="file-grid">
      {#each displayFiles as file (file.id)}
        <div class="file-card">
          <div class="file-icon">📄</div>
          <span class="file-name">{file.name || file.filename}</span>
          <div class="file-actions">
            <button on:click={() => downloadFile(file.id)} title="Download">⬇️</button>
            <button on:click={() => deleteFile(file.id)} title="Delete">🗑️</button>
          </div>
        </div>
      {:else}
        <div class="empty-files">No files yet</div>
      {/each}
    </div>
  </div>
</div>

<style>
  .file-page { display: grid; grid-template-columns: 250px 1fr; height: 100vh; background: var(--gray-100); }

  .file-sidebar { padding: 20px; border-right: 1px solid var(--gray-300); background: white; display: flex; flex-direction: column; gap: 12px; }
  .file-sidebar-header { display: flex; justify-content: space-between; align-items: center; }
  .file-sidebar-header h3 { font-size: 1.1rem; color: var(--gray-800); }
  .file-sidebar-header button { background: var(--brand-blue); color: white; border-radius: var(--radius-sm); padding: 4px 10px; font-size: 1rem; }

  .new-folder-input { display: flex; gap: 8px; }
  .new-folder-input input { flex: 1; padding: 8px; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); }
  .new-folder-input button { background: var(--brand-blue); color: white; padding: 8px 12px; border-radius: var(--radius-sm); }

  .folder-list { display: flex; flex-direction: column; gap: 4px; }
  .folder-list li { padding: 10px 12px; border-radius: var(--radius-md); cursor: pointer; transition: var(--transition); display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; }
  .folder-list li:hover { background: #f0f0f0; }
  .folder-list li.active { background: #e3f2fd; font-weight: 600; }
  .delete-folder-btn { background: none; border: none; cursor: pointer; opacity: 0; transition: opacity 0.2s; }
  .folder-list li:hover .delete-folder-btn { opacity: 1; }

  .file-content { padding: 20px; overflow-y: auto; }
  .file-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .file-toolbar h2 { font-size: 1.5rem; color: var(--gray-800); }
  .toolbar-actions { display: flex; gap: 10px; }

  .upload-btn, .ai-create-btn { background: var(--brand-blue); color: white; padding: 8px 16px; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; transition: var(--transition); font-size: 0.9rem; display: inline-flex; align-items: center; gap: 6px; }
  .upload-btn:hover, .ai-create-btn:hover { background: var(--brand-blue-hover); }

  .ai-create-form { background: white; border: 1px solid var(--gray-300); border-radius: var(--radius-lg); padding: 16px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 10px; }
  .ai-create-form input, .ai-create-form textarea { padding: 10px; border: 1px solid var(--gray-300); border-radius: var(--radius-md); }
  .ai-create-form textarea { min-height: 80px; resize: vertical; }
  .ai-create-form button { background: var(--brand-blue); color: white; padding: 10px 20px; border-radius: var(--radius-md); font-weight: 600; align-self: flex-end; }

  .file-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
  .file-card { background: white; border: 1px solid var(--gray-300); border-radius: var(--radius-lg); padding: 16px; display: flex; flex-direction: column; align-items: center; gap: 8px; transition: var(--transition); animation: fadeIn 0.3s ease; }
  .file-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-light); }
  .file-icon { font-size: 2rem; }
  .file-name { font-size: 0.85rem; color: var(--gray-700); text-align: center; word-break: break-word; }
  .file-actions { display: flex; gap: 6px; }
  .file-actions button { background: none; border: none; cursor: pointer; font-size: 1rem; transition: var(--transition); }
  .file-actions button:hover { transform: scale(1.2); }
  .empty-files { grid-column: 1 / -1; text-align: center; color: var(--gray-500); padding: 40px; }

  @media (max-width: 768px) {
    .file-page { grid-template-columns: 1fr; }
    .file-sidebar { border-right: none; border-bottom: 1px solid var(--gray-300); }
  }
</style>
