<svelte:options runes={false} />

<script>
  import { goto } from '@/legacy/app/navigation';
  import { teamId } from '@/legacy/lib/stores/team.js';
  import { api } from '@/legacy/lib/api/client.js';
  import { onMount } from 'svelte';
  import AppHead from '@/components/AppHead.svelte';
  import AppLayout from '@/layouts/AppLayout.svelte';

  // Workspace status note shown to users so the flow is explicit while backend work continues.
  const PREVIEW_NOTICE = 'Tasks, Calendar, Teams, Files, and AI are currently running in UI preview mode.';

  // Preview-only data for unfinished modules.
  // TODO(back-end): replace these with API-driven data once those endpoints are complete.
  let tasks = [
    { id: 'preview-1', title: 'Sprint planning board', dueDate: '2026-03-21' },
    { id: 'preview-2', title: 'Bug triage checklist', dueDate: '2026-03-24' },
    { id: 'preview-3', title: 'Release notes draft', dueDate: '2026-03-26' },
  ];
  let suggestions = [
    { text: 'Summarize this week’s blockers into one digest', index: 0 },
    { text: 'Generate stand-up highlights from team activity', index: 1 },
    { text: 'Draft a handoff note for unfinished issues', index: 2 },
  ];
  let events = [
    { id: 'preview-e1', startTime: '10:00', endTime: '10:45', title: 'Weekly planning', desc: 'Preview event from calendar module' },
    { id: 'preview-e2', startTime: '13:00', endTime: '13:30', title: 'Design sync', desc: 'Preview event from calendar module' },
    { id: 'preview-e3', startTime: '15:30', endTime: '16:00', title: 'QA review', desc: 'Preview event from calendar module' },
  ];
  let calendarTasks = [
    { end: '2026-03-21' },
    { end: '2026-03-24' },
    { end: '2026-03-26' },
  ];
  let chatGroups = [];
  let chatStatusMessage = 'Loading recent chat...';
  let teamBootstrapAttempted = false;

  onMount(async () => {
    await fetchChats();
  });

  // This function keeps dashboard/chat usable even when team selection UI is in preview mode.
  // TODO(back-end): once Teams flow is fully restored, this can be simplified to trust selected team.
  async function ensureTeamContext() {
    if ($teamId) {
      return $teamId;
    }

    if (teamBootstrapAttempted) {
      return null;
    }

    teamBootstrapAttempted = true;

    try {
      const teamResponse = await api('/user/teams');
      const teams = Array.isArray(teamResponse)
        ? teamResponse
        : (teamResponse?.teams || teamResponse?.data || []);

      const firstTeamId = Number(teams[0]?.id);
      if (Number.isFinite(firstTeamId) && firstTeamId > 0) {
        $teamId = firstTeamId;
        return firstTeamId;
      }
    } catch (err) {
      console.error('Unable to bootstrap team context for dashboard chat preview:', err);
    }

    return null;
  }

  async function fetchChats() {
    const activeTeamId = await ensureTeamContext();

    if (!activeTeamId) {
      chatGroups = [];
      chatStatusMessage = 'Chat is ready, but no team context was found yet.';
      return;
    }

    try {
      const channelsRes = await api(`/chats/${activeTeamId}/index`);
      const channels = Array.isArray(channelsRes)
        ? channelsRes
        : (channelsRes?.data || channelsRes?.chats || []);
      const groupData = [];
      for (const channel of channels.slice(0, 2)) {
        try {
          const msgRes = await api(`/chats/${channel.id}/getMessages`);
          const allMsgs = Array.isArray(msgRes)
            ? msgRes
            : (msgRes?.data || msgRes?.messages || []);
          const lastTwo = allMsgs.slice(-2);
          groupData.push({
            name: channel.name,
            isOpen: false,
            messages: lastTwo.map(m => ({ user: m.user_name, text: m.message })),
          });
        } catch (e) { console.error(`Error fetching msgs for ${channel.id}:`, e); }
      }
      chatGroups = groupData;
      chatStatusMessage = groupData.length ? '' : 'No recent channels were found for this team.';
    } catch (err) {
      console.error('Error fetching chats:', err);
      chatGroups = [];
      chatStatusMessage = 'Could not load chat preview right now.';
    }
  }

  function toggleGroup(index) {
    chatGroups = chatGroups.map((g, i) => i === index ? { ...g, isOpen: !g.isOpen } : g);
  }

  // Calendar data
  $: today = new Date();
  $: currentMonth = today.getMonth();
  $: currentYear = today.getFullYear();
  $: days = Array.from(
    { length: new Date(currentYear, currentMonth + 1, 0).getDate() },
    (_, i) => i + 1,
  );
  $: eventDays = calendarTasks.reduce((acc, t) => {
    if (t.end) {
      const d = new Date(t.end);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        const dayNum = d.getDate();
        if (!acc.includes(dayNum)) acc.push(dayNum);
      }
    }
    return acc;
  }, []);
</script>

<AppHead title="Workspace Dashboard" />

<AppLayout>
<div class="dashboard-page">
  <header class="db-header">
    <h2>Dashboard</h2>
  </header>
  <p class="preview-note">{PREVIEW_NOTICE}</p>

  <div class="dashboard-grid">
    <!-- TASKS CARD -->
    <div class="card tasks-card">
      <button type="button" class="card-title-link" on:click={() => goto('/workspace/tasks')}>
        <span>My Tasks</span> <span class="locked-tag">Preview</span>
      </button>
      <ul>
        {#if tasks.length === 0}
          <li style="color:gray">No tasks yet</li>
        {:else}
          {#each tasks as task (task.id)}
            <li class="task-item" on:click={() => goto('/workspace/tasks')}>
              <div class="task-left" on:click|stopPropagation>
                <input
                  type="checkbox"
                  class="circular-checkbox2"
                  disabled
                  title="Tasks actions are locked until backend implementation is complete."
                />
                <span class="task-name">{task.title}</span>
              </div>
              <span class="task-options">•••</span>
            </li>
          {/each}
        {/if}
      </ul>
    </div>

    <!-- RECENT CHAT CARD -->
    <div class="card chat-card">
      <h3 on:click={() => goto('/workspace/chat')} style="cursor:pointer">Recent Chat</h3>
      <ul>
        {#if chatGroups.length === 0}
          <li style="color:gray">{chatStatusMessage}</li>
        {:else}
          {#each chatGroups as group, idx}
            <li class="chat-group-card">
              <div class="chat-group-header" on:click={() => toggleGroup(idx)}>
                <span class="chat-dot"></span>
                <span class="chat-group-name">{group.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  {#if group.isOpen}
                    <polyline points="18 15 12 9 6 15"/>
                  {:else}
                    <polyline points="6 9 12 15 18 9"/>
                  {/if}
                </svg>
              </div>
              <div class="chat-group-body" class:open={group.isOpen}>
                {#each group.messages as msg}
                  <div class="chat-group-message"><strong>{msg.user}:</strong> {msg.text}</div>
                {/each}
              </div>
            </li>
          {/each}
        {/if}
      </ul>
    </div>

    <!-- AI SUGGESTED ACTIONS CARD -->
    <div class="card ai-card">
      <h3>
        AI Suggested Actions <span class="locked-tag">Preview</span>
      </h3>
      <ul>
        {#if suggestions.length === 0}
          <li style="color:white">No suggestions yet</li>
        {:else}
          {#each suggestions as suggestion}
            <li class="ai-item">
              <span>{suggestion.text}</span>
              <div class="ai-actions">
                <button
                  class="action-btn2 accept"
                  title="AI actions are disabled until backend implementation is complete."
                  disabled
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </button>
                <button
                  class="action-btn2 reject"
                  title="AI actions are disabled until backend implementation is complete."
                  disabled
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </li>
          {/each}
        {/if}
      </ul>
    </div>

    <!-- CALENDAR CARD -->
    <div class="card calendar-card">
      <h3 on:click={() => goto('/workspace/calendar')} style="cursor:pointer">
        Calendar <span class="locked-tag">Preview</span>
      </h3>
      <div class="calendar-grid">
        {#each days as day}
          <div class="calendar-day" on:click={() => goto('/workspace/calendar')} style="cursor:pointer">
            {day}
            {#if eventDays.includes(day)}
              <span class="event-dot"></span>
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <!-- EVENTS CARD -->
    <div class="card events-card">
      <h3 class="events-title" on:click={() => goto('/workspace/calendar')} style="cursor:pointer">
        Upcoming events <span class="locked-tag">Preview</span>
      </h3>
      <ul>
        {#if events.length === 0}
          <li style="color:gray">No upcoming events</li>
        {:else}
          {#each events as evt (evt.id)}
            <li class="event-item" on:click={() => goto('/workspace/calendar')} style="cursor:pointer">
              <div class="event-time-dot">
                <span class="dot"></span>
                <span class="event-time">{evt.startTime}–{evt.endTime}</span>
              </div>
              <div class="event-info">
                <div class="event-title">{evt.title}</div>
                <div class="event-desc">{evt.desc}</div>
              </div>
              <div class="event-options">•••</div>
            </li>
          {/each}
        {/if}
      </ul>
    </div>
  </div>
</div>
</AppLayout>

<style>
  /* === Dashboard Page === */
  .dashboard-page {
    padding: 20px;
    background: #f9fafc;
    height: 100%;
  }
  .db-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }
  .db-header h2 {
    margin: 0;
    font-size: 2rem;
  }

  .preview-note {
    margin: 0 0 18px;
    padding: 10px 14px;
    border-radius: 10px;
    background: #fff6db;
    border: 1px solid #f0d27a;
    color: #6a5000;
    font-size: 0.95rem;
  }

  .locked-tag {
    display: inline-flex;
    align-items: center;
    padding: 2px 9px;
    margin-left: 8px;
    border-radius: 999px;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.22);
    border: 1px solid rgba(255, 255, 255, 0.35);
  }

  /* 3x2 card layout */
  .dashboard-grid {
    display: grid;
    gap: 20px;
    grid-auto-rows: 300px;
    grid-auto-flow: dense;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }

  /* Card styling */
  .card {
    background-color: rgba(255, 255, 255, 0.85);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(8px);
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }
  .card h3 { margin: 0 0 15px; font-size: 1.5rem; }
  .card-title-link {
    margin: 0 0 15px;
    padding: 0;
    border: none;
    background: none;
    font-size: 1.5rem;
    font-weight: 700;
    text-align: left;
    cursor: pointer;
    color: inherit;
  }
  .card ul { list-style: none; margin: 0; padding: 0; flex: 1; overflow-y: auto; }
  .card li { display: flex; align-items: center; margin-bottom: 10px; font-size: 1rem; }

  /* Tasks Card */
  .tasks-card ul { -ms-overflow-style: none; scrollbar-width: none; }
  .tasks-card ul::-webkit-scrollbar { display: none; }
  .task-item {
    display: flex; align-items: center; justify-content: space-between;
    background: #ebecec; border-radius: 8px; padding: 8px 12px;
    margin-bottom: 10px; color: black; transition: background 0.2s; cursor: pointer;
  }
  .task-item:hover { background: #e2e3e3; }
  .task-left { display: flex; align-items: center; gap: 8px; }
  .circular-checkbox2 {
    appearance: none; -webkit-appearance: none; width: 16px; height: 16px;
    border: 2px solid #b9bbbe; border-radius: 50%; outline: none; cursor: pointer;
    display: inline-block; position: relative; transition: border-color 0.2s;
  }
  .circular-checkbox2:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .circular-checkbox2:hover { border-color: #5a5b5c; }
  .circular-checkbox2:checked { border-color: #29b31c; }
  .circular-checkbox2:checked::before {
    content: ''; position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%); width: 8px; height: 8px;
    background-color: #29b31c; border-radius: 50%;
  }
  .circular-checkbox2:checked + .task-name { text-decoration: line-through; color: #888; }
  .task-options { font-size: 1.2rem; cursor: pointer; color: #b9bbbe; transition: 0.2s; }
  .task-options:hover { color: #5a5b5c; }

  /* AI Card — spans 2 rows, gradient */
  .ai-card {
    background: linear-gradient(135deg, #2b5ce7, #8e44ad);
    color: white; grid-row: span 2; grid-column: -2;
    border: 1px solid rgba(255, 255, 255, 0.15);
    position: relative; overflow: hidden;
  }
  .ai-card h3 {
    color: white; font-size: 1.8rem; display: flex; align-items: center;
    gap: 12px; margin-bottom: 20px; position: relative;
  }
  .ai-card h3::before { content: '🤖'; font-size: 2rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
  .ai-card ::-webkit-scrollbar { display: none; }
  .ai-item {
    background: rgba(255,255,255,0.1); padding: 16px; border-radius: 8px;
    margin-bottom: 15px; margin-top: 2px; display: flex; align-items: center;
    justify-content: space-between; backdrop-filter: blur(4px);
    border: 1px solid rgba(255,255,255,0.1); transition: all 0.2s ease;
  }
  .ai-item:hover {
    background: rgba(255,255,255,0.15); box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transform: translateY(-2px);
  }
  .ai-item span { font-weight: 500; letter-spacing: 0.02em; }
  .ai-actions { display: flex; gap: 8px; margin-left: 12px; }
  .action-btn2 {
    padding: 6px; border-radius: 50%; transition: all 0.2s ease;
    background: transparent; border: 1.5px solid currentColor;
    display: flex; align-items: center; justify-content: center; cursor: pointer;
  }
  .action-btn2:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .action-btn2.accept { color: #34d399; border-color: rgba(255,255,255,0.3); }
  .action-btn2.accept:hover { background: #34d399; color: white; border-color: transparent; }
  .action-btn2.reject { color: #f87171; border-color: rgba(255,255,255,0.3); }
  .action-btn2.reject:hover { background: #f87171; color: white; border-color: transparent; }

  /* Calendar Card */
  .calendar-grid {
    display: grid; gap: 5px; grid-template-columns: repeat(7, 1fr);
    min-width: fit-content; min-height: fit-content; width: 100%; height: 100%;
  }
  .calendar-day {
    background: rgba(0,0,0,0.05); border-radius: 8px; padding: 10px;
    text-align: center; position: relative; font-size: 0.8rem; width: 100%; height: 100%;
  }
  .event-dot {
    position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%);
    width: 6px; height: 6px; background-color: #f13e3c; border-radius: 50%;
    pointer-events: none;
  }

  /* Chat Card */
  .chat-card ul { -ms-overflow-style: none; scrollbar-width: none; }
  .chat-card ul::-webkit-scrollbar { display: none; }
  .chat-card ul li { display: block; margin-bottom: 10px; }
  .chat-group-card {
    background: #f1f2f2; border-radius: 8px; overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }
  .chat-group-header {
    background: #ebecec; padding: 10px 14px; display: flex; align-items: center;
    justify-content: left; cursor: pointer; transition: background 0.2s; gap: 6px;
  }
  .chat-group-header:hover { background: #e2e3e3; }
  .chat-group-name { font-weight: 500; color: #333; }
  .chat-group-body {
    background: #f8f7f7; padding: 0 14px; max-height: 0; opacity: 0;
    overflow: hidden; transition: max-height 0.3s ease, opacity 0.3s ease, padding 0.3s ease;
  }
  .chat-group-body.open { max-height: 300px; opacity: 1; padding: 10px 14px; }
  .chat-group-message { margin-bottom: 6px; color: #333; }
  .chat-dot { width: 8px; height: 8px; border-radius: 50%; background: #29b31c; }

  /* Events Card */
  .events-card { -ms-overflow-style: none; scrollbar-width: none; }
  .events-card ::-webkit-scrollbar { display: none; }
  .events-title { margin: 0; font-size: 1.5rem; }
  .events-card ul { list-style: none; margin: 0; padding: 0; }
  .event-item {
    background: #ebecec; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    padding: 12px 16px; display: flex; align-items: center;
    margin-bottom: 12px; transition: background 0.2s;
  }
  .event-item:hover { background: #e2e3e3; }
  .event-time-dot { display: flex; align-items: center; margin-right: 12px; width: 90px; gap: 6px; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: #8e2de2; min-width: 8px; min-height: 8px; }
  .event-time { font-size: 0.9rem; color: #666; }
  .event-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
  .event-title { font-weight: 600; color: #333; }
  .event-desc { font-size: 0.85rem; color: #888; }
  .event-options { font-size: 1.2rem; color: #b9bbbe; cursor: pointer; transition: color 0.2s; padding-left: 10px; }
  .event-options:hover { color: #555; }
</style>
