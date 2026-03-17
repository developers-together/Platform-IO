<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { teamId } from '$lib/stores/team.js';
  import { sidebarOpen } from '$lib/stores/ui.js';
  import { api } from '$lib/api/client.js';

  let chatSessions = [];
  let activeSession = null;
  let messages = [];
  let input = '';
  let isLoading = false;
  let newSessionName = '';
  let showNewSession = false;
  let editSessionId = null;
  let editSessionName = '';

  onMount(async () => {
    if (!$teamId) { goto('/teams'); return; }
    $sidebarOpen = false;
    await loadSessions();
  });

  async function loadSessions() {
    try {
      const data = await api(`/ai_chats/${$teamId}/index`);
      chatSessions = data.chats || data || [];
    } catch (err) { console.error(err); }
  }

  async function selectSession(session) {
    activeSession = session;
    try {
      const data = await api(`/ai_chats/${session.id}/history`);
      messages = data.messages || data || [];
    } catch (err) { console.error(err); messages = []; }
  }

  async function createSession() {
    if (!newSessionName.trim()) return;
    try {
      await api(`/ai_chats/${$teamId}/store`, { method: 'POST', body: { name: newSessionName } });
      newSessionName = '';
      showNewSession = false;
      await loadSessions();
    } catch (err) { console.error(err); }
  }

  async function deleteSession(id) {
    try {
      await api(`/ai_chats/${id}`, { method: 'DELETE' });
      if (activeSession?.id === id) { activeSession = null; messages = []; }
      await loadSessions();
    } catch (err) { console.error(err); }
  }

  async function renameSession() {
    if (!editSessionName.trim()) return;
    try {
      await api(`/ai_chats/${editSessionId}/update`, { method: 'PUT', body: { name: editSessionName } });
      editSessionId = null;
      editSessionName = '';
      await loadSessions();
    } catch (err) { console.error(err); }
  }

  async function sendMessage() {
    if (!input.trim() || !activeSession || isLoading) return;
    const prompt = input;
    input = '';
    isLoading = true;
    messages = [...messages, { role: 'user', content: prompt }];

    try {
      const data = await api(`/ai_chats/${activeSession.id}/send`, {
        method: 'POST',
        body: { prompt },
      });
      messages = [...messages, { role: 'assistant', content: data.response || data.content || 'No response' }];
    } catch (err) {
      messages = [...messages, { role: 'assistant', content: 'Error: ' + err.message }];
    } finally {
      isLoading = false;
    }
  }

  async function webSearch() {
    if (!input.trim() || !activeSession || isLoading) return;
    const query = input;
    input = '';
    isLoading = true;
    messages = [...messages, { role: 'user', content: `🔍 ${query}` }];

    try {
      const data = await api(`/ai_chats/${activeSession.id}/websearch`, {
        method: 'POST',
        body: { query },
      });
      messages = [...messages, { role: 'assistant', content: data.response || data.result || 'No results' }];
    } catch (err) {
      messages = [...messages, { role: 'assistant', content: 'Search error: ' + err.message }];
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head><title>AI Assistant — Platform-IO</title></svelte:head>

<div class="ai-page">
  <!-- Left: Sessions -->
  <div class="ai-sidebar">
    <div class="ai-sidebar-header">
      <h3>🤖 AI Chats</h3>
      <button on:click={() => showNewSession = !showNewSession}>+</button>
    </div>

    {#if showNewSession}
      <div class="new-session-input">
        <input placeholder="Session name" bind:value={newSessionName} on:keydown={(e) => { if (e.key === 'Enter') createSession(); }} />
        <button on:click={createSession}>Create</button>
      </div>
    {/if}

    <ul class="session-list">
      {#each chatSessions as session (session.id)}
        <li class:active={activeSession?.id === session.id} on:click={() => selectSession(session)} role="button" tabindex="0" on:keydown={(e) => { if (e.key === 'Enter') selectSession(session); }}>
          {#if editSessionId === session.id}
            <div class="edit-session">
              <input bind:value={editSessionName} on:keydown={(e) => { if (e.key === 'Enter') renameSession(); }} />
              <button on:click={renameSession}>✓</button>
            </div>
          {:else}
            <span>{session.name}</span>
            <div class="session-actions">
              <button on:click|stopPropagation={() => { editSessionId = session.id; editSessionName = session.name; }}>✏️</button>
              <button on:click|stopPropagation={() => deleteSession(session.id)}>🗑️</button>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  </div>

  <!-- Center: Messages -->
  <div class="ai-chat">
    {#if activeSession}
      <div class="ai-header">
        <h2>{activeSession.name}</h2>
      </div>

      <div class="ai-messages">
        {#each messages as msg, i}
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
        <button on:click={sendMessage} disabled={isLoading}>📤</button>
        <button on:click={webSearch} disabled={isLoading} title="Web Search">🔍</button>
      </div>
    {:else}
      <div class="no-session">
        <p>Select or create an AI chat session</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .ai-page { display: grid; grid-template-columns: 260px 1fr; height: 100vh; background: var(--gray-100); }

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
</style>
