<svelte:options runes={false} />

<script>
  import { onMount, onDestroy } from 'svelte';
  import Avatar from '@/legacy/lib/components/Avatar.svelte';
  import AppHead from '@/components/AppHead.svelte';
  import AppLayout from '@/layouts/AppLayout.svelte';

  // Preview mode keeps Teams UI visible while backend work is still in progress.
  // TODO(back-end): swap this mock list with /api/user/teams and remove preview locking.
  const FEATURE_STATUS_NOTE = 'Teams is currently in preview mode. Backend actions are temporarily disabled.';

  let teams = [
    {
      id: 101,
      name: 'Core Platform',
      projectname: 'Platform-IO',
      description: 'Main product delivery team',
      code: 'CORE01',
    },
    {
      id: 102,
      name: 'Growth Squad',
      projectname: 'Activation Funnel',
      description: 'Onboarding and retention experiments',
      code: 'GRWTH2',
    },
    {
      id: 103,
      name: 'Design Ops',
      projectname: 'UI Refresh',
      description: 'Component systems and UX quality',
      code: 'UXOPS3',
    },
  ];
  let menuTeamId = null;
  let showTeamCode = false;
  let showAddDialog = false;
  let joinCode = '';
  let teamName = '';
  let projectName = '';
  let teamDescription = '';
  let leaveModalTeamId = null;

  // Rotating fan icon state
  let fanRotation = 0;
  let fanHovered = false;
  let fanFastMode = false;
  let animationFrame;
  let prevTime = null;

  function animateFan(time) {
    if (prevTime === null) prevTime = time;
    const delta = time - prevTime;
    prevTime = time;
    const normalSpeed = 360 / 5000;
    const hoverSpeed = 360 / 2500;
    const clickSpeed = 360 / 1000;
    const speed = fanFastMode ? clickSpeed : (fanHovered ? hoverSpeed : normalSpeed);
    fanRotation = (fanRotation + speed * delta) % 360;
    animationFrame = requestAnimationFrame(animateFan);
  }

  onMount(() => {
    animationFrame = requestAnimationFrame(animateFan);
  });

  onDestroy(() => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
  });

  // TODO(back-end): restore team selection persistence once team backend is fully active.
  function goToDashboard(id) {
    void id;
  }

  function toggleTeamMenu(id, e) {
    e.stopPropagation();
    menuTeamId = menuTeamId === id ? null : id;
    showTeamCode = false;
  }

  function handleShowCode(id, e) {
    e.stopPropagation();
    menuTeamId = id;
    showTeamCode = true;
  }

  function handleLeaveTeam(id, e) {
    e.stopPropagation();
    leaveModalTeamId = id;
  }

  // TODO(back-end): wire this to DELETE /api/team/{id}/delete.
  async function confirmLeaveTeam(id) {
    void id;
    menuTeamId = null;
    showTeamCode = false;
    leaveModalTeamId = null;
  }

  // TODO(back-end): wire this to POST /api/team/joinTeam.
  async function joinTeam() {
    if (!joinCode.trim()) return;
    joinCode = '';
    showAddDialog = false;
  }

  // TODO(back-end): wire this to POST /api/team/create.
  async function createTeam() {
    if (!teamName.trim() || !projectName.trim() || !teamDescription.trim()) return;
    teamName = ''; projectName = ''; teamDescription = '';
    showAddDialog = false;
  }

  function closeAddDialog() {
    showAddDialog = false;
    joinCode = ''; teamName = ''; projectName = ''; teamDescription = '';
  }

  // Fan icon SVG path
  const fanPath = 'M258.6 0c-1.7 0-3.4.1-5.1.5C168 17 115.6 102.3 130.5 189.3c2.9 17 8.4 32.9 15.9 47.4L32 224l-2.6 0C13.2 224 0 237.2 0 253.4c0 1.7.1 3.4.5 5.1C17 344 102.3 396.4 189.3 381.5c17-2.9 32.9-8.4 47.4-15.9L224 480l0 2.6c0 16.2 13.2 29.4 29.4 29.4 1.7 0 3.4-.1 5.1-.5C344 495 396.4 409.7 381.5 322.7c-2.9-17-8.4-32.9-15.9-47.4L480 288l2.6 0c16.2 0 29.4-13.2 29.4-29.4 0-1.7-.1-3.4-.5-5.1C495 168 409.7 115.6 322.7 130.5c-17 2.9-32.9 8.4-47.4 15.9L288 32l0-2.6C288 13.2 274.8 0 258.6 0zM256 224a32 32 0 1 1 0 64 32 32 0 1 1 0-64z';
</script>

<AppHead title="Teams" />

<AppLayout>
<div class="teams-page">
  <p class="feature-preview-banner" data-test="teams-preview-banner">{FEATURE_STATUS_NOTE}</p>
  <div class="feature-preview-disabled" aria-disabled="true" inert>
  <!-- Header -->
  <div class="teams-header">
    <button
      type="button"
      class="fan-icon-container"
      on:mouseenter={() => fanHovered = true}
      on:mouseleave={() => fanHovered = false}
      on:click={() => fanFastMode = !fanFastMode}
      aria-label="Toggle fan animation speed"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="60" height="60" fill="currentColor" style="transform: rotate({fanRotation}deg); cursor: pointer;">
        <path d={fanPath} />
      </svg>
    </button>
    <h2 class="teams-headline">Which team do you want to log into?</h2>
  </div>

  <!-- Cards container -->
  <div class="teams-cards-container" data-test="teams-cards-container">
    {#each teams as team (team.id)}
      <div class="team-card" data-test={`team-card-${team.id}`}>
        <div class="team-avatar-container">
          <!-- Square, full-width avatar banner for each team card -->
          <Avatar
            name={team.name}
            fill={true}
            options={{ background: '0052d4', color: 'fff', bold: true, rounded: false }}
            className="team-avatar"
          />
          <button type="button" class="team-menu-btn" aria-label={`Open actions for ${team.name}`} on:click={(e) => toggleTeamMenu(team.id, e)}>&#8942;</button>
        </div>
        <div class="team-info">
          <div class="info-item"><span class="info-title">Team Name:</span><span class="info-value">{team.name}</span></div>
          <div class="info-item"><span class="info-title">Project:</span><span class="info-value">{team.projectname}</span></div>
          <div class="info-item"><span class="info-title">Description:</span><span class="info-value">{team.description}</span></div>
        </div>

        {#if menuTeamId === team.id && !showTeamCode}
          <div class="team-menu-dialog">
            <button type="button" class="team-menu-item" on:click={(e) => handleShowCode(team.id, e)}>Show Code</button>
            <button type="button" class="team-menu-item2" on:click={(e) => handleLeaveTeam(team.id, e)}>Leave</button>
          </div>
        {/if}

        {#if menuTeamId === team.id && showTeamCode}
          <div class="team-code-dialog">
            <p>Team Code: {team.code}</p>
            <button type="button" on:click={() => { menuTeamId = null; showTeamCode = false; }}>Close</button>
          </div>
        {/if}
      </div>
    {/each}

    <!-- Add card -->
    <button type="button" class="team-card add-card" data-test="teams-add-card" on:click={() => showAddDialog = true}>
      <div class="add-card-content">
        <span class="plus-icon">+</span>
        <p>Add</p>
      </div>
    </button>
  </div>

  <!-- Add Dialog -->
  {#if showAddDialog}
    <div class="add-dialog-overlay" data-test="teams-add-dialog">
      <div class="add-dialog-content2">
        <button type="button" class="close-dialog-btn" aria-label="Close add team dialog" on:click={closeAddDialog}>&times;</button>
        <div class="join-create-options">
          <div class="join-team-box">
            <h3>Join Team</h3>
            <input maxlength="6" type="text" placeholder="Team Code" bind:value={joinCode} class="join-input" />
            <button type="button" class="join-btn" on:click={joinTeam}>Join</button>
          </div>
          <div class="create-team-box">
            <h3>Create Team</h3>
            <input type="text" placeholder="Team Name" bind:value={teamName} class="create-input" />
            <input type="text" placeholder="Project Name" bind:value={projectName} class="create-input" />
            <input type="text" placeholder="Team Description" bind:value={teamDescription} class="create-input" />
            <button type="button" class="create-btn" on:click={createTeam}>Create</button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Leave Modal -->
  {#if leaveModalTeamId}
    <div class="modal-overlay">
      <div class="modal-content">
        <h3>Leave Team</h3>
        <p>Are you sure you want to leave this team?</p>
        <div class="modal-actions">
          <button type="button" on:click={() => confirmLeaveTeam(leaveModalTeamId)} class="btn confirm-btn">Yes, Leave</button>
          <button type="button" on:click={() => leaveModalTeamId = null} class="btn cancel-btn">Don't Leave</button>
        </div>
      </div>
    </div>
  {/if}
  </div>
</div>
</AppLayout>

<style>
  /* Teams page — exact React CSS */
  .teams-page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    font-family: Arial, sans-serif;
    padding: 1rem;
    background: url('/bg.png') center center no-repeat;
    background-size: cover;
  }

  .feature-preview-banner {
    margin: 0.75rem 1rem 0;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid #f0d27a;
    background: #fff6db;
    color: #6a5000;
    font-size: 0.95rem;
    font-weight: 500;
    z-index: 2;
  }

  .feature-preview-disabled {
    pointer-events: none;
    opacity: 0.88;
    filter: saturate(0.9);
  }

  .teams-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
    justify-content: center;
    background: transparent;
  }

  .fan-icon-container {
    width: 60px; height: 60px;
    display: inline-flex; align-items: center; justify-content: center;
    cursor: pointer; transition: opacity 0.2s ease;
    border: none; background: transparent; padding: 0;
  }
  .fan-icon-container:hover { opacity: 0.8; }
  .fan-icon-container :global(svg path) {
    fill: #8e44ad !important;
    stroke: #fff !important;
    stroke-width: 0.5px !important;
    paint-order: fill stroke !important;
    vector-effect: non-scaling-stroke;
  }

  .teams-headline { font-size: 1.8rem; margin: 0; color: #fff; font-weight: 600; }

  .teams-cards-container {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.5rem; padding: 2rem 3rem; flex: 1; overflow-y: auto;
    background: rgba(255,255,255,0.3); border: 1px solid rgba(255,255,255,0.4);
    border-radius: 50px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin: 1rem;
  }

  .team-card {
    background: #fff; border: 1px solid #e5e7eb; border-radius: 1rem;
    overflow: hidden; transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    display: flex; flex-direction: column; position: relative; height: 300px;
  }
  .team-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,82,212,0.2); }

  .team-avatar-container {
    position: relative;
    height: 52%;
    min-height: 150px;
    overflow: hidden;
    background: linear-gradient(135deg, #0052d4, #4364f7);
  }
  :global(.team-avatar) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 0;
  }

  .team-menu-btn {
    position: absolute; top: 8px; right: 8px; background: transparent;
    border: none; font-size: 2rem; font-weight: bold; color: #fff;
    cursor: pointer; z-index: 2; transition: color 0.2s;
  }
  .team-menu-btn:hover { color: #000; }

  .team-info { padding: 0.5rem; text-align: center; flex-grow: 1; display: flex; flex-direction: column; justify-content: center; }
  .info-item { display: flex; align-items: center; gap: 0.5rem; margin: 0.4rem 0; }
  .info-title { font-size: 0.8rem; font-weight: 400; color: #4b5563; min-width: 80px; text-align: left; }
  .info-value { font-size: 1rem; font-weight: 700; color: #2d3748; text-align: center; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .team-menu-dialog {
    position: absolute; top: 50px; right: 8px; background: #fff;
    border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.5rem;
    box-shadow: 0 6px 16px rgba(0,0,0,0.15); animation: fadeIn 0.2s ease-out;
    display: flex; flex-direction: column; gap: 6px; z-index: 10; width: 150px;
  }
  .team-menu-item, .team-menu-item2 {
    background: #f3f4f6; border: none; padding: 6px 8px; border-radius: 0.5rem;
    cursor: pointer; font-size: 0.85rem; transition: background 0.2s; text-align: left; color: #2d3748;
  }
  .team-menu-item:hover { background: #e2e8f0; }
  .team-menu-item2 { background: #ef4444; color: #fff; }
  .team-menu-item2:hover { background: #b91c1c; }

  .team-code-dialog {
    position: absolute; top: 40px; right: 8px; background: #fff;
    border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.8rem;
    box-shadow: 0 6px 16px rgba(0,0,0,0.15); animation: fadeIn 0.2s ease-out;
    display: flex; flex-direction: column; gap: 8px; text-align: center; z-index: 10;
  }
  .team-code-dialog p { margin: 0; font-weight: 600; color: #333; }
  .team-code-dialog button { padding: 6px 10px; background: #0052d4; color: #fff; border: none; border-radius: 6px; font-size: 0.85rem; cursor: pointer; transition: background 0.2s; }
  .team-code-dialog button:hover { background: #0041ac; }

  .add-card {
    border: 2px dashed #d1d5db; border-radius: 1rem; color: #6b7280;
    display: flex; align-items: center; justify-content: center; padding: 1rem;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
  }
  .add-card:hover { transform: translateY(-2px); border: 2px dashed #0052d4; }
  .add-card-content { display: flex; flex-direction: column; align-items: center; font-size: 0.9rem; }
  .plus-icon { font-size: 2rem; font-weight: 600; margin-bottom: 0.2rem; color: #999; }

  .add-dialog-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5); display: flex; align-items: center;
    justify-content: center; animation: fadeIn 0.2s ease-out; z-index: 9999;
  }
  .add-dialog-content2 {
    background: #fff; border-radius: 1rem; padding: 1.5rem; width: 600px;
    max-width: 90%; box-shadow: 0 8px 30px rgba(0,0,0,0.2);
    position: relative; display: flex; flex-direction: column; gap: 1rem;
  }
  .close-dialog-btn {
    background: transparent; border: none; font-size: 1.5rem; color: #666;
    position: absolute; top: 1rem; right: 1rem; cursor: pointer; transition: color 0.2s;
  }
  .close-dialog-btn:hover { color: #333; }

  .join-create-options { display: flex; flex-direction: row; gap: 3rem; justify-content: space-between; }
  .join-team-box, .create-team-box { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
  .join-team-box h3, .create-team-box h3 { margin: 0; color: #2d3748; font-size: 1.1rem; text-align: center; font-weight: 600; }
  .join-input, .create-input { padding: 0.6rem; border: 1px solid #ddd; border-radius: 0.5rem; font-size: 0.9rem; transition: border-color 0.2s; }
  .create-input:focus { outline: none; border-color: #4dabf7; box-shadow: 0 0 0 2px rgba(77,171,247,0.1); }
  .join-input:focus { outline: none; border-color: #c98bff; }
  .join-btn, .create-btn { padding: 0.6rem; border-radius: 0.5rem; border: none; cursor: pointer; font-size: 0.9rem; transition: background 0.2s, transform 0.2s; font-weight: 600; color: #fff; }
  .join-btn { background: #8e2de2; }
  .join-btn:hover { background: #671da7; transform: translateY(-2px); }
  .create-btn { background: #0052d4; }
  .create-btn:hover { background: #0041ac; transform: translateY(-2px); box-shadow: 0 0 0 3px rgba(77,171,247,0.1); }

  /* Leave modal */
  .modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5); display: flex; align-items: center;
    justify-content: center; z-index: 9999;
  }
  .modal-content {
    background: #fff; border-radius: 12px; padding: 2rem; text-align: center;
    box-shadow: 0 8px 30px rgba(0,0,0,0.2); max-width: 400px; width: 90%;
  }
  .modal-content h3 { margin: 0 0 10px; }
  .modal-content p { margin: 0 0 20px; color: #666; }
  .modal-actions { display: flex; gap: 10px; justify-content: center; }
  .btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; }
  .confirm-btn { background: #ef4444; color: #fff; }
  .confirm-btn:hover { background: #b91c1c; }
  .cancel-btn { background: #e2e8f0; color: #333; }
  .cancel-btn:hover { background: #cbd5e0; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
