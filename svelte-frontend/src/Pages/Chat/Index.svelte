<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { teamId } from '$lib/stores/team.js';
  import { user } from '$lib/stores/auth.js';
  import { api } from '$lib/api/client.js';
  import Avatar from '$lib/components/Avatar.svelte';

  let channels = [];
  let activeChannel = null;
  let messages = [];
  let newMessage = '';
  let showCreateDialog = false;
  let newChannelName = '';
  let replyTo = null;
  let showDeleteModal = false;
  let deleteChannelId = null;
  let channelMenuId = null;
  let editChannelId = null;
  let editChannelName = '';

  onMount(async () => {
    if (!$teamId) { goto('/teams'); return; }
    await loadChannels();
  });

  async function loadChannels() {
    try {
      const data = await api(`/chats/${$teamId}/index`);
      channels = data.chats || data || [];
    } catch (err) { console.error(err); }
  }

  async function selectChannel(ch) {
    activeChannel = ch;
    channelMenuId = null;
    try {
      const data = await api(`/chats/${ch.id}/getMessages`);
      messages = data.messages || data || [];
    } catch (err) { console.error(err); messages = []; }
  }

  async function createChannel() {
    if (!newChannelName.trim()) return;
    try {
      await api(`/chats/${$teamId}/store`, { method: 'POST', body: { name: newChannelName } });
      newChannelName = '';
      showCreateDialog = false;
      await loadChannels();
    } catch (err) { console.error(err); }
  }

  async function sendMessage() {
    if (!newMessage.trim() || !activeChannel) return;
    try {
      const body = { content: newMessage };
      if (replyTo) body.reply_id = replyTo.id;
      await api(`/chats/${activeChannel.id}/sendMessages`, { method: 'POST', body });
      newMessage = '';
      replyTo = null;
      await selectChannel(activeChannel);
    } catch (err) { console.error(err); }
  }

  async function deleteMessage(msgId) {
    try {
      await api(`/chats/${msgId}/deleteMessage`, { method: 'DELETE' });
      await selectChannel(activeChannel);
    } catch (err) { console.error(err); }
  }

  async function askAI() {
    if (!newMessage.trim() || !activeChannel) return;
    try {
      await api(`/chats/${activeChannel.id}/ask`, { method: 'POST', body: { message: newMessage } });
      newMessage = '';
      await selectChannel(activeChannel);
    } catch (err) { console.error(err); }
  }

  async function deleteChannel(id) {
    try {
      await api(`/chats/${id}`, { method: 'DELETE' });
      showDeleteModal = false;
      deleteChannelId = null;
      if (activeChannel?.id === id) { activeChannel = null; messages = []; }
      await loadChannels();
    } catch (err) { console.error(err); }
  }

  async function renameChannel() {
    if (!editChannelName.trim()) return;
    try {
      await api(`/chats/${editChannelId}`, { method: 'PUT', body: { name: editChannelName } });
      editChannelId = null;
      editChannelName = '';
      await loadChannels();
    } catch (err) { console.error(err); }
  }
</script>

<svelte:head><title>Chat — Platform-IO</title></svelte:head>

<div class="chat-page-container">
  <!-- Left Panel -->
  <div class="left-panel">
    <div class="panel-heading-container">
      <h3 class="panel-heading">Channels</h3>
      <button class="add-channel-btn" on:click={() => showCreateDialog = !showCreateDialog}>+</button>
    </div>

    {#if showCreateDialog}
      <div class="create-channel-dialog">
        <input placeholder="Channel name" bind:value={newChannelName} on:keydown={(e) => { if (e.key === 'Enter') createChannel(); }} />
        <div class="dialog-actions">
          <button on:click={createChannel}>Create</button>
          <button on:click={() => showCreateDialog = false}>Cancel</button>
        </div>
      </div>
    {/if}

    <div class="left-card-content">
      <ul>
        {#each channels as ch (ch.id)}
          <li class:active-chat={activeChannel?.id === ch.id} on:click={() => selectChannel(ch)} role="button" tabindex="0" on:keydown={(e) => { if (e.key === 'Enter') selectChannel(ch); }}>
            {#if editChannelId === ch.id}
              <div class="channel-edit-container">
                <input class="task-edit-input" bind:value={editChannelName} on:keydown={(e) => { if (e.key === 'Enter') renameChannel(); }} />
                <button on:click={renameChannel}>Save</button>
              </div>
            {:else}
              <span>{ch.name}</span>
              <div class="channel-actions">
                <button class="channel-menu-btn" on:click|stopPropagation={() => channelMenuId = channelMenuId === ch.id ? null : ch.id}>⋯</button>
                {#if channelMenuId === ch.id}
                  <div class="channel-menu">
                    <button on:click|stopPropagation={() => { editChannelId = ch.id; editChannelName = ch.name; channelMenuId = null; }}>✏️ Rename</button>
                    <button on:click|stopPropagation={() => { deleteChannelId = ch.id; showDeleteModal = true; channelMenuId = null; }}>🗑️ Delete</button>
                  </div>
                {/if}
              </div>
            {/if}
          </li>
        {/each}
      </ul>
    </div>
  </div>

  <!-- Center: Chat Messages -->
  <div class="chat-center2">
    {#if activeChannel}
      <div class="chat-header3">
        <h3># {activeChannel.name}</h3>
      </div>

      <div class="chat-messages2">
        {#each messages as msg (msg.id)}
          <div class="chat-message2">
            <Avatar name={msg.user?.name || 'U'} size={42} background="0052d4" color="fff" />
            <div class="msg-body">
              <div class="msg-header">
                <span class="msg-user">{msg.user?.name || 'User'}</span>
                <span class="msg-time">{new Date(msg.created_at).toLocaleTimeString()}</span>
              </div>
              {#if msg.reply_id}
                <div class="reply-container">
                  <span class="reply-text">↩ Reply</span>
                </div>
              {/if}
              <p class="msg-text">{msg.content}</p>
              {#if msg.image}
                <img class="uploaded-image" src={msg.image} alt="attachment" />
              {/if}
              <div class="msg-actions">
                <button on:click={() => { replyTo = msg; }}>↩</button>
                <button on:click={() => deleteMessage(msg.id)}>🗑️</button>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <div class="chat-input">
        {#if replyTo}
          <div class="reply-preview">
            <span>Replying to {replyTo.user?.name || 'User'}: {replyTo.content?.slice(0, 50)}</span>
            <button class="cancel-reply1" on:click={() => replyTo = null}>✕</button>
          </div>
        {/if}
        <div class="chat-input-row">
          <input placeholder="Type a message..." bind:value={newMessage} on:keydown={(e) => { if (e.key === 'Enter') sendMessage(); }} />
          <button on:click={sendMessage}>📤</button>
          <button on:click={askAI} title="Ask AI">🤖</button>
        </div>
      </div>
    {:else}
      <div class="no-channel">
        <p>Select a channel to start chatting</p>
      </div>
    {/if}
  </div>

  {#if showDeleteModal}
    <div class="modal-overlay" on:click|self={() => showDeleteModal = false} role="presentation">
      <div class="modal-content">
        <p>Delete this channel?</p>
        <div class="modal-actions">
          <button class="btn confirm-btn" on:click={() => deleteChannel(deleteChannelId)}>Delete</button>
          <button class="btn cancel-btn" on:click={() => showDeleteModal = false}>Cancel</button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .chat-page-container { display: grid; grid-template-columns: 250px 1fr; gap: 20px; height: 100vh; padding: 20px; background: #f9fafc; }
  .left-panel { display: flex; flex-direction: column; gap: 10px; }
  .panel-heading-container { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #e2e3e3; border-radius: 20px; }
  .panel-heading { margin: 0; font-size: 1rem; font-weight: 600; color: #333; }
  .add-channel-btn { background: none; border: none; color: #0052d4; font-size: 1.5rem; cursor: pointer; padding: 0; transition: var(--transition); }
  .add-channel-btn:hover { transform: scale(1.2); }

  .create-channel-dialog { background: #fff; border: 1px solid #e2e3e3; border-radius: 20px; padding: 12px; }
  .create-channel-dialog input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 12px; font-size: 0.95rem; }
  .dialog-actions { display: flex; gap: 8px; justify-content: flex-end; }
  .dialog-actions button { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-weight: 500; }
  .dialog-actions button:first-child { background: #0052d4; color: white; }
  .dialog-actions button:last-child { background: #f0f0f0; color: #333; }

  .left-card-content { background: #fff; padding: 12px 16px; display: flex; flex-direction: column; gap: 6px; border-radius: 20px; border: 1px solid #e2e3e3; min-height: 200px; }
  .left-card-content ul { list-style: none; margin: 0; padding: 0; }
  .left-card-content li { padding: 10px; border-radius: 8px; font-size: 1rem; transition: background 0.2s, transform 0.2s; color: #333; cursor: pointer; display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; }
  .left-card-content li:hover { background: #f0f0f0; transform: translateX(4px); }
  .active-chat { background-color: #e3f2fd !important; font-weight: 600; }

  .channel-actions { position: relative; }
  .channel-menu-btn { background: none; border: none; padding: 4px; cursor: pointer; color: #666; font-size: 1.2rem; }
  .channel-menu-btn:hover { color: #0052d4; }
  .channel-menu { position: absolute; right: 0; top: 25px; background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 8px; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.2); min-width: 140px; }
  .channel-menu button { display: flex; align-items: center; gap: 8px; width: 100%; padding: 8px; background: none; border: none; cursor: pointer; color: #333; font-size: 0.9rem; }
  .channel-menu button:hover { background: #f5f5f5; border-radius: 4px; }

  .channel-edit-container { display: flex; align-items: center; gap: 8px; width: 100%; }
  .channel-edit-container input { flex: 1; padding: 6px; border: 1px solid #ddd; border-radius: 4px; }
  .channel-edit-container button { background: #0052d4; color: white; padding: 6px 12px; border-radius: 4px; font-weight: 500; }

  .chat-center2 { display: flex; flex-direction: column; overflow: hidden; }
  .chat-header3 { background: #e2e3e3; padding: 12px 18px; display: flex; justify-content: space-between; align-items: center; border-radius: 20px; }
  .chat-header3 h3 { margin: 0; flex: 1; }

  .chat-messages2 { flex: 1; padding: 16px; overflow-y: auto; background: #fafafa; display: flex; flex-direction: column; gap: 12px; scrollbar-width: thin; border: 1px solid #e2e3e3; border-radius: 20px; margin: 10px 0; }

  .chat-message2 { display: flex; gap: 14px; align-items: flex-start; }
  .msg-body { background: #fff; border-radius: 10px; padding: 10px 14px; flex: 1; box-shadow: 0 2px 6px rgba(0,0,0,0.06); position: relative; }
  .msg-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
  .msg-user { font-weight: 600; color: #333; }
  .msg-time { font-size: 0.85rem; color: #777; }
  .msg-text { margin-bottom: 6px; color: #444; line-height: 1.4; }
  .uploaded-image { max-width: 100%; max-height: 200px; border-radius: 8px; margin-top: 6px; }

  .msg-actions { display: none; position: absolute; right: 12px; bottom: 8px; gap: 6px; }
  .msg-body:hover .msg-actions { display: flex; }
  .msg-actions button { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: #0052d4; }
  .msg-actions button:hover { transform: scale(1.1); }

  .reply-container { background: #e3f2fd; border-left: 3px solid #0052d4; border-radius: 6px; padding: 8px 12px; margin: 8px 0; font-size: 0.9rem; color: #37474f; }
  .reply-preview { display: flex; align-items: center; background: #f2f3f5; padding: 8px 12px; border-radius: 10px; gap: 8px; font-size: 0.9rem; color: #555; position: relative; }
  .cancel-reply1 { position: absolute; right: 8px; background: none !important; border: none; color: #0052d4; cursor: pointer; font-size: 1rem; }

  .chat-input { display: flex; flex-direction: column; gap: 8px; padding: 14px 18px; background: #e2e3e3; border-radius: 20px; }
  .chat-input-row { display: flex; align-items: center; gap: 10px; width: 100%; }
  .chat-input input { flex: 1; padding: 10px 14px; border: 1px solid #ccc; border-radius: 8px; transition: border 0.2s; }
  .chat-input input:focus { border: 1px solid #0052d4; outline: none; box-shadow: var(--shadow-focus); }
  .chat-input button { background: none; border: none; font-size: 1.4rem; cursor: pointer; color: #0052d4; }
  .chat-input button:hover { color: #003c9f; transform: scale(1.1); }

  .no-channel { display: flex; align-items: center; justify-content: center; height: 100%; color: var(--gray-500); font-size: 1.1rem; }

  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; }
  .modal-content { background: white; padding: 2rem; border-radius: 12px; width: 300px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
  .modal-actions { margin-top: 1rem; display: flex; justify-content: center; gap: 1rem; }
  .btn { padding: 0.5rem 1rem; border: none; border-radius: 6px; cursor: pointer; }
  .confirm-btn { background: #ef4444; color: white; }
  .confirm-btn:hover { background: #dc2626; }
  .cancel-btn { background: #e2e8f0; color: #1e293b; }
  .cancel-btn:hover { background: #cbd5e0; }
</style>
