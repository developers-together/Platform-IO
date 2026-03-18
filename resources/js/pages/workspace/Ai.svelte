<svelte:options runes={false} />

<script>
  import AppHead from '@/components/AppHead.svelte';
  import AppLayout from '@/layouts/AppLayout.svelte';

  // Preview mode keeps AI UI visible while backend work is still in progress.
  // TODO(back-end): restore API wiring for sessions, history, and prompt actions.
  const FEATURE_STATUS_NOTE = 'AI module is currently in preview mode. Backend actions are temporarily disabled.';

  let chatSessions = [
    { id: 301, name: 'Sprint Assistant' },
    { id: 302, name: 'Release Writer' },
    { id: 303, name: 'Research Notes' },
  ];
  const previewMessagesBySession = {
    301: [
      { role: 'user', content: 'Summarize this sprint progress.' },
      { role: 'assistant', content: 'Preview response: sprint summary will appear here once backend is enabled.' },
    ],
    302: [
      { role: 'user', content: 'Draft release notes headline.' },
      { role: 'assistant', content: 'Preview response: release note draft support is pending backend integration.' },
    ],
    303: [
      { role: 'user', content: 'Collect blockers from today.' },
      { role: 'assistant', content: 'Preview response: blocker extraction will be available after API completion.' },
    ],
  };
  let activeSession = chatSessions[0];
  let messages = previewMessagesBySession[chatSessions[0].id] || [];
  let input = '';
  let isLoading = false;
  let newSessionName = '';
  let showNewSession = false;
  let editSessionId = null;
  let editSessionName = '';

  // TODO(back-end): wire to GET /api/ai_chats/{teamId}/history.
  async function selectSession(session) {
    activeSession = session;
    messages = previewMessagesBySession[session.id] || [];
  }

  // TODO(back-end): wire to POST /api/ai_chats/{teamId}/store.
  async function createSession() {
    void newSessionName;
  }

  // TODO(back-end): wire to DELETE /api/ai_chats/{id}.
  async function deleteSession(id) {
    void id;
  }

  // TODO(back-end): wire to PUT /api/ai_chats/{id}/update.
  async function renameSession() {
    void editSessionId;
    void editSessionName;
  }

  // TODO(back-end): wire to POST /api/ai_chats/{id}/send.
  async function sendMessage() {
    void input;
    void activeSession;
    void isLoading;
  }

  // TODO(back-end): wire to POST /api/ai_chats/{id}/websearch.
  async function webSearch() {
    void input;
    void activeSession;
    void isLoading;
  }
</script>

<AppHead title="AI Assistant" />

<AppLayout>
<div class="ai-page">
  <div class="feature-preview-banner">{FEATURE_STATUS_NOTE}</div>
  <div class="feature-preview-disabled" aria-disabled="true" inert>
  <div class="ai-sidebar">
    <div class="ai-sidebar-header">
      <h3>🤖 AI Chats</h3>
      <button type="button" aria-label="Create AI chat session" on:click={() => showNewSession = !showNewSession}>+</button>
    </div>

    {#if showNewSession}
      <div class="new-session-input">
        <input placeholder="Session name" bind:value={newSessionName} on:keydown={(e) => { if (e.key === 'Enter') createSession(); }} />
        <button type="button" on:click={createSession}>Create</button>
      </div>
    {/if}

    <ul class="session-list">
      {#each chatSessions as session (session.id)}
        <li class:active={activeSession?.id === session.id}>
          {#if editSessionId === session.id}
            <div class="edit-session">
              <input bind:value={editSessionName} on:keydown={(e) => { if (e.key === 'Enter') renameSession(); }} />
              <button type="button" on:click={renameSession}>✓</button>
            </div>
          {:else}
            <button type="button" class="session-row-btn" on:click={() => selectSession(session)}>
              <span>{session.name}</span>
            </button>
            <div class="session-actions">
              <button type="button" aria-label={`Rename ${session.name}`} on:click|stopPropagation={() => { editSessionId = session.id; editSessionName = session.name; }}>✏️</button>
              <button type="button" aria-label={`Delete ${session.name}`} on:click|stopPropagation={() => deleteSession(session.id)}>🗑️</button>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  </div>

  <div class="ai-chat">
    {#if activeSession}
      <div class="ai-header">
        <h2>{activeSession.name}</h2>
      </div>

      <div class="ai-messages">
        {#each messages as msg, i (`${msg.role}-${i}`)}
          <div class="ai-message" class:user={msg.role === 'user'} class:assistant={msg.role === 'assistant'}>
            <div class="msg-role">{msg.role === 'user' ? '👤 You' : '🤖 AI'}</div>
            <div class="msg-content">{msg.content}</div>
          </div>
        {/each}

        {#if isLoading}
          <div class="ai-message assistant">
            <div class="msg-role">🤖 AI</div>
            <div class="msg-content typing">Thinking...</div>
          </div>
        {/if}
      </div>

      <div class="ai-input">
        <input
          placeholder="Ask AI anything..."
          bind:value={input}
          on:keydown={(e) => { if (e.key === 'Enter') sendMessage(); }}
          disabled={isLoading}
        />
        <button type="button" aria-label="Send message" on:click={sendMessage} disabled={isLoading}>📤</button>
        <button type="button" aria-label="Search web" on:click={webSearch} disabled={isLoading} title="Web Search">🔍</button>
      </div>
    {:else}
      <div class="no-session">
        <p>Select or create an AI chat session</p>
      </div>
    {/if}
  </div>
  </div>
</div>
</AppLayout>

<style>
  .ai-page { display: grid; grid-template-columns: 260px 1fr; grid-template-rows: auto 1fr; height: 100vh; background: var(--gray-100); }
  .feature-preview-banner { grid-column: 1 / -1; margin: 12px 20px 0; padding: 12px 16px; border-radius: 12px; border: 1px solid #f0d27a; background: #fff6db; color: #6a5000; font-size: 0.95rem; font-weight: 500; }
  .feature-preview-disabled { grid-column: 1 / -1; display: grid; grid-template-columns: 260px 1fr; min-height: 0; pointer-events: none; opacity: 0.88; filter: saturate(0.9); }

  .ai-sidebar { padding: 20px; border-right: 1px solid var(--gray-300); background: white; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
  .ai-sidebar-header { display: flex; justify-content: space-between; align-items: center; }
  .ai-sidebar-header h3 { font-size: 1.1rem; color: var(--gray-800); }
  .ai-sidebar-header button { background: linear-gradient(135deg, #8e2de2, #2b5ce7); color: white; border-radius: var(--radius-sm); padding: 4px 10px; font-size: 1rem; }

  .new-session-input { display: flex; gap: 8px; }
  .new-session-input input { flex: 1; padding: 8px; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); }
  .new-session-input button { background: var(--brand-blue); color: white; padding: 8px 12px; border-radius: var(--radius-sm); }

  .session-list { display: flex; flex-direction: column; gap: 4px; }
  .session-list li { padding: 10px 12px; border-radius: var(--radius-md); cursor: pointer; transition: var(--transition); display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; }
  .session-list li:hover { background: #f0f0f0; }
  .session-list li.active { background: #e3f2fd; font-weight: 600; }
  .session-row-btn { border: none; background: transparent; padding: 0; text-align: left; flex: 1; cursor: pointer; font-size: 0.9rem; }
  .session-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s; }
  .session-list li:hover .session-actions { opacity: 1; }
  .session-actions button { background: none; border: none; cursor: pointer; font-size: 0.85rem; }

  .edit-session { display: flex; gap: 6px; width: 100%; }
  .edit-session input { flex: 1; padding: 4px 8px; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); }
  .edit-session button { background: var(--brand-blue); color: white; padding: 4px 8px; border-radius: var(--radius-sm); }

  .ai-chat { display: flex; flex-direction: column; overflow: hidden; }
  .ai-header { padding: 16px 20px; background: linear-gradient(135deg, #8e2de2, #2b5ce7); color: white; border-radius: 0; }
  .ai-header h2 { margin: 0; font-size: 1.2rem; }

  .ai-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; }

  .ai-message { background: white; border-radius: var(--radius-lg); padding: 14px 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.04); animation: fadeIn 0.3s ease; }
  .ai-message.user { background: #e3f2fd; margin-left: 40px; }
  .ai-message.assistant { background: white; margin-right: 40px; }

  .msg-role { font-weight: 600; font-size: 0.85rem; margin-bottom: 6px; color: var(--gray-600); }
  .msg-content { color: var(--gray-800); line-height: 1.6; white-space: pre-wrap; }
  .msg-content.typing { color: var(--gray-500); font-style: italic; }

  .ai-input { display: flex; gap: 10px; padding: 16px 20px; background: white; border-top: 1px solid var(--gray-300); }
  .ai-input input { flex: 1; padding: 12px 16px; border: 2px solid var(--gray-300); border-radius: var(--radius-lg); font-size: 1rem; transition: var(--transition); }
  .ai-input input:focus { border-color: #8e2de2; outline: none; box-shadow: 0 0 0 3px rgba(142, 45, 226, 0.1); }
  .ai-input button { background: linear-gradient(135deg, #8e2de2, #2b5ce7); color: white; border-radius: var(--radius-md); padding: 12px 16px; font-size: 1.2rem; transition: var(--transition); }
  .ai-input button:hover:not(:disabled) { transform: scale(1.05); }
  .ai-input button:disabled { opacity: 0.5; }

  .no-session { display: flex; align-items: center; justify-content: center; height: 100%; color: var(--gray-500); font-size: 1.1rem; }

  @media (max-width: 768px) {
    .ai-page { grid-template-columns: 1fr; grid-template-rows: auto 1fr; }
    .feature-preview-disabled { grid-template-columns: 1fr; }
    .ai-sidebar { border-right: none; border-bottom: 1px solid var(--gray-300); }
  }
</style>
