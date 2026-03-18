<svelte:options runes={false} />

<script lang="ts">
    import { Form, page } from '@inertiajs/svelte';
    import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
    import AppHead from '@/components/AppHead.svelte';
    import Avatar from '@/legacy/lib/components/Avatar.svelte';
    import DeleteUser from '@/components/DeleteUser.svelte';
    import TextLink from '@/components/TextLink.svelte';
    import AppLayout from '@/layouts/AppLayout.svelte';
    import { profileEdit } from '@/lib/appRoutes';
    import { send } from '@/routes/verification';
    import type { BreadcrumbItem } from '@/types';

    // Props come from Settings/ProfileController@edit.
    export let mustVerifyEmail = false;
    export let status = '';
    export let teams: Array<{
        id: number;
        name: string;
        projectname?: string | null;
        description?: string | null;
    }> = [];

    const breadcrumbItems: BreadcrumbItem[] = [
        {
            title: 'Profile',
            href: profileEdit(),
        },
    ];

    // Shared auth payload comes from HandleInertiaRequests middleware.
    $: authUser = $page.props.auth?.user;
    // Guard against malformed payloads and keep rendering resilient.
    $: safeTeams = Array.isArray(teams) ? teams : [];

    const hasErrors = (errors: Record<string, string | undefined>) =>
        Boolean(errors?.name || errors?.email);

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

<AppLayout breadcrumbs={breadcrumbItems}>
    <div class="profile-page" data-test="settings-profile-page">
        <div class="profile-grid">
            <!-- Read-only snapshot of the currently authenticated user -->
            <section class="panel profile-summary">
                <div class="summary-header">
                    <Avatar
                        name={authUser?.name || 'User'}
                        size={72}
                        background="0052d4"
                        color="fff"
                    />
                    <div class="summary-main">
                        <h2>{authUser?.name || 'User'}</h2>
                        <p>{authUser?.email || 'No email available'}</p>
                    </div>
                </div>

                <div class="summary-meta">
                    <div class="meta-row">
                        <span>Member Since</span>
                        <strong>{formatDate(authUser?.created_at)}</strong>
                    </div>
                    <div class="meta-row">
                        <span>Email Status</span>
                        <strong>{authUser?.email_verified_at ? 'Verified' : 'Pending verification'}</strong>
                    </div>
                </div>
            </section>

            <!-- Backend-wired profile update form (PATCH settings/profile) -->
            <section class="panel profile-form-panel">
                <h3>Profile Information</h3>
                <p class="panel-subtitle">Update your name and email address.</p>

                <Form
                    {...ProfileController.update.form()}
                    class="profile-form"
                    options={{ preserveScroll: true }}
                >
                    {#snippet children({ errors, processing, recentlySuccessful })}
                        {#if hasErrors(errors)}
                            <div class="error-banner">
                                {errors.name ?? errors.email}
                            </div>
                        {/if}

                        <div class="field-group">
                            <label for="profile-name">Name</label>
                            <input
                                id="profile-name"
                                name="name"
                                type="text"
                                value={authUser?.name ?? ''}
                                autocomplete="name"
                                required
                            />
                            {#if errors.name}
                                <p class="field-error">{errors.name}</p>
                            {/if}
                        </div>

                        <div class="field-group">
                            <label for="profile-email">Email</label>
                            <input
                                id="profile-email"
                                name="email"
                                type="email"
                                value={authUser?.email ?? ''}
                                autocomplete="email"
                                required
                            />
                            {#if errors.email}
                                <p class="field-error">{errors.email}</p>
                            {/if}
                        </div>

                        <!-- Email verification follows Laravel/Fortify flow -->
                        {#if mustVerifyEmail && authUser && !authUser.email_verified_at}
                            <div class="verify-box">
                                <p>Your email address is unverified.</p>
                                <TextLink href={send()} as="button" class="verify-link">
                                    Resend verification email
                                </TextLink>

                                {#if status === 'verification-link-sent'}
                                    <p class="success-inline">
                                        A fresh verification link has been sent.
                                    </p>
                                {/if}
                            </div>
                        {/if}

                        <div class="form-actions">
                            <button
                                type="submit"
                                class="save-button"
                                disabled={processing}
                                data-test="update-profile-button"
                            >
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>

                            {#if recentlySuccessful}
                                <span class="saved-indicator">Saved.</span>
                            {/if}
                        </div>
                    {/snippet}
                </Form>
            </section>

            <!-- Team membership is displayed from server props for now -->
            <section class="panel teams-panel">
                <h3>My Teams</h3>
                <p class="panel-subtitle">Your workspace memberships.</p>

                {#if safeTeams.length === 0}
                    <p class="empty-state">You are not assigned to any teams yet.</p>
                {:else}
                    <ul class="teams-list">
                        {#each safeTeams as team (team.id)}
                            <li class="team-item">
                                <div class="team-dot"></div>
                                <div class="team-copy">
                                    <strong>{team.name}</strong>
                                    <span>{team.projectname || team.description || 'No extra details'}</span>
                                </div>
                            </li>
                        {/each}
                    </ul>
                {/if}
            </section>

            <!-- Existing delete-account flow kept intact -->
            <section class="panel delete-panel">
                <h3>Danger Zone</h3>
                <p class="panel-subtitle">Delete your account permanently.</p>
                <DeleteUser />
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

    .profile-summary,
    .profile-form-panel {
        grid-column: span 1;
    }

    .summary-header {
        display: flex;
        align-items: center;
        gap: 0.9rem;
        margin-bottom: 1rem;
    }

    .summary-main h2 {
        margin: 0;
        font-size: 1.4rem;
        color: #0f172a;
    }

    .summary-main p {
        margin: 0.25rem 0 0;
        color: #64748b;
        font-size: 0.95rem;
    }

    .summary-meta {
        display: grid;
        gap: 0.65rem;
    }

    .meta-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.7rem 0.8rem;
        border-radius: 12px;
        background: #f8fafc;
    }

    .meta-row span {
        color: #475569;
        font-size: 0.88rem;
    }

    .meta-row strong {
        color: #0f172a;
        font-size: 0.88rem;
    }

    .profile-form-panel h3,
    .teams-panel h3,
    .delete-panel h3 {
        margin: 0;
        color: #0f172a;
        font-size: 1.05rem;
    }

    .panel-subtitle {
        margin: 0.35rem 0 1rem;
        color: #64748b;
        font-size: 0.9rem;
    }

    :global(.profile-form) {
        display: flex;
        flex-direction: column;
        gap: 0.9rem;
    }

    .field-group {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
    }

    .field-group label {
        font-size: 0.85rem;
        color: #334155;
        font-weight: 600;
    }

    .field-group input {
        border: 1px solid #d5dbe6;
        border-radius: 10px;
        padding: 0.68rem 0.78rem;
        font-size: 0.95rem;
        color: #0f172a;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .field-group input:focus {
        outline: none;
        border-color: #2b5ce7;
        box-shadow: 0 0 0 3px rgba(43, 92, 231, 0.16);
    }

    .error-banner {
        background: #fff1f2;
        border: 1px solid #fecdd3;
        color: #be123c;
        padding: 0.62rem 0.75rem;
        border-radius: 10px;
        font-size: 0.88rem;
    }

    .field-error {
        margin: 0;
        color: #be123c;
        font-size: 0.82rem;
    }

    .verify-box {
        background: #fefce8;
        border: 1px solid #fef08a;
        border-radius: 10px;
        padding: 0.72rem 0.82rem;
        font-size: 0.86rem;
        color: #854d0e;
    }

    .verify-box p {
        margin: 0;
    }

    :global(.verify-link) {
        margin-top: 0.35rem;
        font-size: 0.86rem;
        font-weight: 600;
    }

    .success-inline {
        margin-top: 0.4rem;
        color: #15803d;
        font-size: 0.82rem;
    }

    .form-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .save-button {
        background: linear-gradient(135deg, #2b5ce7, #0052d4);
        color: white;
        border: none;
        border-radius: 10px;
        padding: 0.72rem 0.95rem;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s ease, opacity 0.2s ease;
    }

    .save-button:hover:not(:disabled) {
        transform: translateY(-1px);
    }

    .save-button:disabled {
        opacity: 0.65;
        cursor: not-allowed;
    }

    .saved-indicator {
        color: #15803d;
        font-size: 0.84rem;
        font-weight: 600;
    }

    .teams-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.55rem;
    }

    .team-item {
        display: flex;
        align-items: flex-start;
        gap: 0.65rem;
        padding: 0.7rem 0.75rem;
        border-radius: 10px;
        background: #f8fafc;
    }

    .team-dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: #2b5ce7;
        margin-top: 0.35rem;
    }

    .team-copy {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
    }

    .team-copy strong {
        color: #0f172a;
        font-size: 0.9rem;
    }

    .team-copy span {
        color: #64748b;
        font-size: 0.82rem;
    }

    .empty-state {
        margin: 0;
        color: #64748b;
        font-size: 0.88rem;
        font-style: italic;
    }

    .delete-panel :global([data-test='delete-user-button']) {
        width: 100%;
    }

    @media (max-width: 900px) {
        .profile-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
