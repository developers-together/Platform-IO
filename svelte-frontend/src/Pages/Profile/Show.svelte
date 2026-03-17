<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user, token, logout } from '$lib/stores/auth.js';
  import { api } from '$lib/api/client.js';
  import Avatar from '$lib/components/Avatar.svelte';

  let userData = null;
  let teams = [];
  let showDeleteConfirm = false;

  onMount(async () => {
    try {
      const [uData, tData] = await Promise.all([
        api('/user/show').catch(() => null),
        api('/user/teams').catch(() => []),
      ]);
      userData = uData?.user || uData || $user;
      teams = tData.teams || tData || [];
    } catch (err) { console.error(err); }
  });

  async function handleLogout() {
    try {
      await api('/user/logout', { method: 'POST' });
    } catch (err) { /* ignore */ }
    logout();
    goto('/login');
  }

  async function deleteAccount() {
    try {
      await api('/user/delete', { method: 'DELETE' });
      logout();
      goto('/');
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }
</script>

<svelte:head><title>Profile — Platform-IO</title></svelte:head>

<div class="profile-page">
  <div class="profile-container">
    <!-- User Info Card -->
    <div class="profile-card">
      <div class="profile-header">
        <Avatar name={userData?.name || 'User'} size={80} background="0052d4" color="fff" />
        <div class="profile-info">
          <h1>{userData?.name || 'User'}</h1>
          <p class="email">{userData?.email || ''}</p>
          {#if userData?.birthdate}
            <p class="birthdate">🎂 {userData.birthdate}</p>
          {/if}
        </div>
      </div>
    </div>

    <!-- Teams Card -->
    <div class="teams-card">
      <h2>My Teams ({teams.length})</h2>
      <div class="teams-list">
        {#each teams as team (team.id)}
          <div class="team-item">
            <Avatar name={team.name} size={36} background="2b5ce7" color="fff" />
            <div>
              <span class="team-name">{team.name}</span>
              {#if team.projectname}
                <span class="team-project">{team.projectname}</span>
              {/if}
            </div>
          </div>
        {:else}
          <p class="empty">No teams yet</p>
        {/each}
      </div>
    </div>

    <!-- Actions -->
    <div class="actions-card">
      <button class="logout-btn" on:click={handleLogout}>
        Logout
      </button>
      <button class="delete-btn" on:click={() => showDeleteConfirm = true}>
        Delete Account
      </button>
    </div>

    {#if showDeleteConfirm}
      <div class="modal-overlay" on:click|self={() => showDeleteConfirm = false} role="presentation">
        <div class="modal-content">
          <h3>⚠️ Delete Account</h3>
          <p>This action cannot be undone. All your data will be permanently deleted.</p>
          <div class="modal-actions">
            <button class="btn confirm-btn" on:click={deleteAccount}>Delete Forever</button>
            <button class="btn cancel-btn" on:click={() => showDeleteConfirm = false}>Cancel</button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .profile-page {
    padding: 30px;
    background: var(--gray-100);
    min-height: 100vh;
    font-family: var(--font-secondary);
  }

  .profile-container {
    max-width: 700px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .profile-card, .teams-card, .actions-card {
    background: white;
    border-radius: var(--radius-lg);
    padding: 24px;
    box-shadow: var(--shadow-sm);
    animation: fadeIn 0.3s ease;
  }

  .profile-header {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .profile-info h1 {
    font-size: 1.5rem;
    color: var(--gray-800);
    margin-bottom: 4px;
  }
  .email { color: var(--gray-600); font-size: 0.95rem; }
  .birthdate { color: var(--gray-500); font-size: 0.85rem; margin-top: 4px; }

  .teams-card h2 {
    font-size: 1.2rem;
    color: var(--gray-800);
    margin-bottom: 16px;
  }

  .teams-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .team-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--gray-150);
    border-radius: var(--radius-md);
    transition: var(--transition);
  }
  .team-item:hover {
    background: #f0f0f0;
    transform: translateX(4px);
  }
  .team-name { font-weight: 600; color: var(--gray-800); display: block; }
  .team-project { font-size: 0.8rem; color: var(--brand-blue); }
  .empty { color: var(--gray-500); text-align: center; font-style: italic; }

  .actions-card {
    display: flex;
    gap: 12px;
  }

  .logout-btn {
    flex: 1;
    background: var(--gray-800);
    color: white;
    padding: 12px;
    border-radius: var(--radius-md);
    font-weight: 600;
    transition: var(--transition);
  }
  .logout-btn:hover { background: #111827; }

  .delete-btn {
    flex: 1;
    background: var(--error-color);
    color: white;
    padding: 12px;
    border-radius: var(--radius-md);
    font-weight: 600;
    transition: var(--transition);
  }
  .delete-btn:hover { background: #dc2626; }

  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: var(--z-modal); }
  .modal-content { background: white; padding: 2rem; border-radius: var(--radius-lg); width: 380px; text-align: center; box-shadow: 0 8px 30px rgba(0,0,0,0.2); }
  .modal-content h3 { font-size: 1.2rem; margin-bottom: 10px; }
  .modal-content p { color: var(--gray-600); font-size: 0.9rem; margin-bottom: 20px; }
  .modal-actions { display: flex; justify-content: center; gap: 1rem; }
  .btn { padding: 10px 20px; border: none; border-radius: var(--radius-md); cursor: pointer; font-weight: 600; }
  .confirm-btn { background: var(--error-color); color: white; }
  .confirm-btn:hover { background: #dc2626; }
  .cancel-btn { background: var(--gray-300); color: var(--gray-900); }
  .cancel-btn:hover { background: var(--gray-400); }

  @media (max-width: 768px) {
    .profile-page { padding: 16px; }
    .profile-header { flex-direction: column; text-align: center; }
    .actions-card { flex-direction: column; }
  }
</style>
