<svelte:options runes={false} />

<script>
  import AppHead from '@/components/AppHead.svelte';
  import AppLayout from '@/layouts/AppLayout.svelte';

  // Preview mode keeps Files UI visible while backend integration is pending.
  // TODO(back-end): replace these mock datasets with /api/folders and /api/files responses.
  const FEATURE_STATUS_NOTE = 'Shared File System is currently in preview mode. Backend actions are temporarily disabled.';

  let directories = [
    'design',
    'design/icons',
    'engineering',
    'engineering/api',
    'qa',
  ];
  let files = [
    { path: 'design/landing-wireframe.fig', type: 'figma' },
    { path: 'engineering/api/contracts.md', type: 'markdown' },
    { path: 'engineering/release-plan.pdf', type: 'pdf' },
    { path: 'qa/smoke-checklist.txt', type: 'text' },
  ];
  let currentPath = '/';
  let newFolderName = '';
  let showNewFolder = false;
  let aiPrompt = '';
  let aiFileName = '';
  let showAiCreate = false;

  const ROOT = '/';

  function normalize(path) {
    if (!path || path === ROOT) return '';
    return String(path).replace(/^\/+|\/+$/g, '');
  }

  function toDisplayPath(path) {
    const clean = normalize(path);
    return clean ? `/${clean}` : ROOT;
  }

  function getName(path) {
    const clean = normalize(path);
    if (!clean) return 'Root';
    const parts = clean.split('/');
    return parts[parts.length - 1];
  }

  function getParentPath(path) {
    const clean = normalize(path);
    if (!clean) return ROOT;
    const parts = clean.split('/');
    parts.pop();
    return parts.length ? parts.join('/') : ROOT;
  }

  function isImmediateChild(itemPath, parentPath) {
    const item = normalize(itemPath);
    const parent = normalize(parentPath);

    if (!parent) {
      return item.length > 0 && !item.includes('/');
    }

    const prefix = `${parent}/`;
    if (!item.startsWith(prefix)) return false;

    const remainder = item.slice(prefix.length);
    return remainder.length > 0 && !remainder.includes('/');
  }

  // TODO(back-end): wire to POST /api/folders/{teamId}/store.
  async function createFolder() {
    void newFolderName;
    void currentPath;
  }

  // TODO(back-end): wire to DELETE /api/folders/{teamId}/delete.
  async function deleteFolder(path) {
    void path;
  }

  // TODO(back-end): wire to POST /api/files/{teamId}/store.
  async function uploadFile(event) {
    void event;
  }

  // TODO(back-end): wire to DELETE /api/files/{teamId}/delete.
  async function deleteFile(path) {
    void path;
  }

  // TODO(back-end): wire to GET /api/files/{teamId}/download.
  async function downloadFile(path, filename) {
    void path;
    void filename;
  }

  // TODO(back-end): wire to POST /api/files/{teamId}/aicreate.
  async function aiCreateFile() {
    void aiPrompt;
    void aiFileName;
    void currentPath;
  }

  function openFolder(path) {
    currentPath = normalize(path) || ROOT;
  }

  function goUp() {
    currentPath = getParentPath(currentPath);
  }

  $: visibleDirectories = directories
    .filter((dir) => isImmediateChild(dir, currentPath))
    .map((dir) => ({ path: dir, name: getName(dir) }))
    .sort((a, b) => a.name.localeCompare(b.name));

  $: visibleFiles = files
    .filter((file) => isImmediateChild(file.path, currentPath))
    .map((file) => ({
      path: file.path,
      name: getName(file.path),
      type: file.type || 'file',
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
</script>

<AppHead title="Files" />

<AppLayout>
<div class="file-page">
  <div class="feature-preview-banner">{FEATURE_STATUS_NOTE}</div>
  <div class="feature-preview-disabled" aria-disabled="true" inert>
  <div class="file-sidebar">
    <div class="file-sidebar-header">
      <h3>📁 Folders</h3>
      <button on:click={() => (showNewFolder = !showNewFolder)}>+</button>
    </div>

    <div class="path-indicator">{toDisplayPath(currentPath)}</div>

    {#if showNewFolder}
      <div class="new-folder-input">
        <input
          placeholder="Folder name"
          bind:value={newFolderName}
          on:keydown={(e) => {
            if (e.key === 'Enter') createFolder();
          }}
        />
        <button on:click={createFolder}>Create</button>
      </div>
    {/if}

      <ul class="folder-list">
        {#if currentPath !== ROOT}
        <li class="has-nav-button">
          <button type="button" class="folder-nav-btn" on:click={goUp}>⬅ Back</button>
        </li>
      {/if}

      <li class:active={currentPath === ROOT} class="has-nav-button">
        <button type="button" class="folder-nav-btn" on:click={() => openFolder(ROOT)}>📂 Root</button>
      </li>

      {#each visibleDirectories as folder (folder.path)}
        <li class="has-nav-button">
          <button type="button" class="folder-nav-btn folder-name-btn" on:click={() => openFolder(folder.path)}>
            <span>📂 {folder.name}</span>
          </button>
          <button class="delete-folder-btn" on:click|stopPropagation={() => deleteFolder(folder.path)}>🗑️</button>
        </li>
      {/each}

      {#if visibleDirectories.length === 0}
        <li class="empty-entry">No subfolders</li>
      {/if}
    </ul>
  </div>

  <div class="file-content">
    <div class="file-toolbar">
      <h2>{toDisplayPath(currentPath)}</h2>
      <div class="toolbar-actions">
        <label class="upload-btn">
          📤 Upload
          <input type="file" on:change={uploadFile} style="display: none" />
        </label>
        <button class="ai-create-btn" on:click={() => (showAiCreate = !showAiCreate)}>🤖 AI Create</button>
      </div>
    </div>

    {#if showAiCreate}
      <div class="ai-create-form">
        <input placeholder="Preferred file name (optional)" bind:value={aiFileName} />
        <textarea placeholder="Describe what the file should contain..." bind:value={aiPrompt}></textarea>
        <button on:click={aiCreateFile}>Create with AI</button>
      </div>
    {/if}

    <div class="file-grid">
      {#each visibleFiles as file (file.path)}
        <div class="file-card">
          <div class="file-icon">📄</div>
          <span class="file-name">{file.name}</span>
          <div class="file-actions">
            <button on:click={() => downloadFile(file.path, file.name)} title="Download">⬇️</button>
            <button on:click={() => deleteFile(file.path)} title="Delete">🗑️</button>
          </div>
        </div>
      {:else}
        <div class="empty-files">No files in this folder</div>
      {/each}
    </div>
  </div>
  </div>
</div>
</AppLayout>

<style>
  .file-page {
    display: grid;
    grid-template-columns: 250px 1fr;
    grid-template-rows: auto 1fr;
    height: 100vh;
    background: var(--gray-100);
  }

  .feature-preview-banner {
    grid-column: 1 / -1;
    margin: 12px 20px 0;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid #f0d27a;
    background: #fff6db;
    color: #6a5000;
    font-size: 0.95rem;
    font-weight: 500;
  }

  .feature-preview-disabled {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 250px 1fr;
    min-height: 0;
    pointer-events: none;
    opacity: 0.88;
    filter: saturate(0.9);
  }

  .file-sidebar {
    padding: 20px;
    border-right: 1px solid var(--gray-300);
    background: white;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .file-sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .file-sidebar-header h3 {
    font-size: 1.1rem;
    color: var(--gray-800);
  }

  .file-sidebar-header button {
    background: var(--brand-blue);
    color: white;
    border-radius: var(--radius-sm);
    padding: 4px 10px;
    font-size: 1rem;
  }

  .path-indicator {
    font-size: 0.85rem;
    color: var(--gray-600);
    word-break: break-word;
  }

  .new-folder-input {
    display: flex;
    gap: 8px;
  }

  .new-folder-input input {
    flex: 1;
    padding: 8px;
    border: 1px solid var(--gray-300);
    border-radius: var(--radius-sm);
  }

  .new-folder-input button {
    background: var(--brand-blue);
    color: white;
    padding: 8px 12px;
    border-radius: var(--radius-sm);
  }

  .folder-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .folder-list li {
    padding: 10px 12px;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
  }

  .folder-list li:hover {
    background: #f0f0f0;
  }

  .folder-list li.active {
    background: #e3f2fd;
    font-weight: 600;
  }

  .folder-list li.has-nav-button {
    padding: 0;
  }

  .folder-nav-btn {
    width: 100%;
    border: none;
    background: transparent;
    text-align: left;
    padding: 10px 12px;
    font-size: 0.9rem;
    cursor: pointer;
  }

  .folder-name-btn {
    flex: 1;
  }

  .folder-list .empty-entry {
    cursor: default;
    color: var(--gray-500);
    justify-content: center;
    font-style: italic;
  }

  .folder-list .empty-entry:hover {
    background: transparent;
  }

  .delete-folder-btn {
    background: none;
    border: none;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .folder-list li:hover .delete-folder-btn {
    opacity: 1;
  }

  .file-content {
    padding: 20px;
    overflow-y: auto;
  }

  .file-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .file-toolbar h2 {
    font-size: 1.2rem;
    color: var(--gray-800);
    word-break: break-word;
  }

  .toolbar-actions {
    display: flex;
    gap: 10px;
  }

  .upload-btn,
  .ai-create-btn {
    background: var(--brand-blue);
    color: white;
    padding: 8px 16px;
    border-radius: var(--radius-md);
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    font-size: 0.9rem;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .upload-btn:hover,
  .ai-create-btn:hover {
    background: var(--brand-blue-hover);
  }

  .ai-create-form {
    background: white;
    border: 1px solid var(--gray-300);
    border-radius: var(--radius-lg);
    padding: 16px;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .ai-create-form input,
  .ai-create-form textarea {
    padding: 10px;
    border: 1px solid var(--gray-300);
    border-radius: var(--radius-md);
  }

  .ai-create-form textarea {
    min-height: 80px;
    resize: vertical;
  }

  .ai-create-form button {
    background: var(--brand-blue);
    color: white;
    padding: 10px 20px;
    border-radius: var(--radius-md);
    font-weight: 600;
    align-self: flex-end;
  }

  .file-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }

  .file-card {
    background: white;
    border: 1px solid var(--gray-300);
    border-radius: var(--radius-lg);
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    transition: var(--transition);
    animation: fadeIn 0.3s ease;
  }

  .file-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-light);
  }

  .file-icon {
    font-size: 2rem;
  }

  .file-name {
    font-size: 0.85rem;
    color: var(--gray-700);
    text-align: center;
    word-break: break-word;
  }

  .file-actions {
    display: flex;
    gap: 6px;
  }

  .file-actions button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    transition: var(--transition);
  }

  .file-actions button:hover {
    transform: scale(1.2);
  }

  .empty-files {
    grid-column: 1 / -1;
    text-align: center;
    color: var(--gray-500);
    padding: 40px;
  }

  @media (max-width: 768px) {
    .file-page {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr;
    }

    .feature-preview-disabled {
      grid-template-columns: 1fr;
    }

    .file-sidebar {
      border-right: none;
      border-bottom: 1px solid var(--gray-300);
    }
  }
</style>
