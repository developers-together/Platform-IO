<svelte:options runes={false} />

<script lang="ts">
    import AppHead from '@/components/AppHead.svelte';
    import Avatar from '@/legacy/lib/components/Avatar.svelte';
    import AppLayout from '@/layouts/AppLayout.svelte';

    // Props are provided by UserController::profile and UserController::show.
    export let user_data: {
        id?: number;
        name?: string | null;
        email?: string | null;
        job?: string | null;
        phone?: string | null;
        gender?: string | null;
        timezone?: string | null;
        profile?: string | null;
        created_at?: string | null;
    } | null = null;

    export let contacts: Array<{
        id?: number;
        name?: string | null;
        email?: string | null;
        phone?: string | null;
    }> = [];

    $: safeContacts = Array.isArray(contacts) ? contacts : [];

    function formatDate(dateValue?: string | null): string {
        if (!dateValue) {
            return 'N/A';
        }

        const parsed = new Date(dateValue);
        if (Number.isNaN(parsed.getTime())) {
            return 'N/A';
        }

        return parsed.toLocaleDateString();
    }
</script>

<AppHead title="Profile" />

<AppLayout>
    <div class="profile-page" data-test="user-profile-page">
        <div class="profile-grid">
            <section class="panel user-card" data-test="user-profile-summary">
                <div class="user-header">
                    <Avatar
                        name={user_data?.name || 'User'}
                        size={84}
                        background="0052d4"
                        color="fff"
                    />
                    <div>
                        <h1>{user_data?.name || 'Unknown user'}</h1>
                        <p>{user_data?.email || 'No email provided'}</p>
                    </div>
                </div>

                <div class="meta-grid">
                    <div class="meta-item">
                        <span>Member since</span>
                        <strong>{formatDate(user_data?.created_at)}</strong>
                    </div>
                    <div class="meta-item">
                        <span>Job</span>
                        <strong>{user_data?.job || 'Not set'}</strong>
                    </div>
                    <div class="meta-item">
                        <span>Phone</span>
                        <strong>{user_data?.phone || 'Not set'}</strong>
                    </div>
                    <div class="meta-item">
                        <span>Timezone</span>
                        <strong>{user_data?.timezone || 'Not set'}</strong>
                    </div>
                </div>

                <!-- Keep settings entry point visible for editing account data. -->
                <a class="settings-link" href="/settings/profile">
                    Edit Profile Settings
                </a>
            </section>

            <section class="panel contacts-card" data-test="user-profile-contacts">
                <h2>Contacts</h2>
                <p class="subtitle">People connected to this profile.</p>

                {#if safeContacts.length === 0}
                    <p class="empty-copy">No contacts were found for this profile.</p>
                {:else}
                    <ul class="contacts-list">
                        {#each safeContacts as contact, index (`contact-${index}`)}
                            <li class="contact-item">
                                <div>
                                    <strong>{contact.name || 'Unnamed contact'}</strong>
                                    <span>{contact.email || 'No email'}</span>
                                </div>
                                <span class="phone">{contact.phone || 'No phone'}</span>
                            </li>
                        {/each}
                    </ul>
                {/if}
            </section>
        </div>
    </div>
</AppLayout>

<style>
    .profile-page {
        padding: 1.25rem;
        min-height: 100%;
        background: #f5f7fb;
    }

    .profile-grid {
        max-width: 980px;
        margin: 0 auto;
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .panel {
        background: white;
        border-radius: 16px;
        border: 1px solid #e6ebf2;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
        padding: 1.1rem;
    }

    .user-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .user-header h1 {
        margin: 0;
        color: #0f172a;
        font-size: 1.35rem;
    }

    .user-header p {
        margin: 0.35rem 0 0;
        color: #64748b;
        font-size: 0.94rem;
    }

    .meta-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.65rem;
    }

    .meta-item {
        border-radius: 10px;
        background: #f8fafc;
        padding: 0.72rem 0.8rem;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
    }

    .meta-item span {
        color: #64748b;
        font-size: 0.8rem;
    }

    .meta-item strong {
        color: #0f172a;
        font-size: 0.88rem;
        font-weight: 600;
    }

    .settings-link {
        margin-top: 0.95rem;
        display: inline-flex;
        text-decoration: none;
        color: white;
        background: linear-gradient(135deg, #2b5ce7, #0052d4);
        border-radius: 10px;
        padding: 0.64rem 0.86rem;
        font-size: 0.86rem;
        font-weight: 600;
    }

    .contacts-card h2 {
        margin: 0;
        color: #0f172a;
        font-size: 1.05rem;
    }

    .subtitle {
        margin: 0.4rem 0 1rem;
        color: #64748b;
        font-size: 0.88rem;
    }

    .contacts-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.55rem;
    }

    .contact-item {
        border-radius: 10px;
        background: #f8fafc;
        padding: 0.74rem 0.8rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.8rem;
    }

    .contact-item strong {
        display: block;
        color: #0f172a;
        font-size: 0.9rem;
    }

    .contact-item span {
        color: #64748b;
        font-size: 0.82rem;
    }

    .phone {
        white-space: nowrap;
    }

    .empty-copy {
        margin: 0;
        color: #64748b;
        font-style: italic;
        font-size: 0.88rem;
    }

    @media (max-width: 900px) {
        .profile-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
