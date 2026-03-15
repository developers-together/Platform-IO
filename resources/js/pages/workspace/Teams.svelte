<script lang="ts">
    import { Link } from '@inertiajs/svelte';
    import { onMount, tick } from 'svelte';
    import { cubicInOut, cubicOut } from 'svelte/easing';
    import { fly } from 'svelte/transition';
    import AppHead from '@/components/AppHead.svelte';
    import { Badge } from '@/components/ui/badge';
    import { Button } from '@/components/ui/button';
    import {
        Card,
        CardContent,
        CardDescription,
        CardHeader,
        CardTitle,
    } from '@/components/ui/card';
    import AppLayout from '@/layouts/AppLayout.svelte';
    import {
        createTeam,
        deleteTeam,
        fetchUserTeams,
        joinTeam,
    } from '@/lib/api/teams';
    import {
        initializeWorkspaceTeam,
        setWorkspaceTeam,
        workspaceState,
    } from '@/lib/workspace.svelte';
    import { dashboard, workspaceTeams } from '@/lib/appRoutes';
    import type { BreadcrumbItem, TeamSummary } from '@/types';

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Teams',
            href: workspaceTeams(),
        },
    ];

    const workspace = workspaceState();

    let loading = $state(true);
    let teams = $state<TeamSummary[]>([]);
    let selectedTeamId = $state<number | null>(workspace.selectedTeamId);

    let error = $state('');
    let success = $state('');

    let joinCode = $state('');
    let createName = $state('');
    let createProject = $state('');
    let createDescription = $state('');
    let busyAction = $state<'join' | 'create' | `delete-${number}` | null>(
        null,
    );
    let teamFlowMode = $state<'join' | 'create'>('join');
    let teamFlowStep = $state<'form' | 'connecting' | 'success'>('form');
    let teamFlowKey = $state(0);
    let connectedTeamName = $state('');

    const clearMessages = () => {
        error = '';
        success = '';
    };

    const getMessage = (err: unknown): string => {
        if (err instanceof Error) return err.message;
        return 'Unable to finish request.';
    };

    const nextFlowView = (
        step: 'form' | 'connecting' | 'success',
        mode?: 'join' | 'create',
    ) => {
        if (mode) {
            teamFlowMode = mode;
        }
        teamFlowStep = step;
        teamFlowKey += 1;
    };

    const switchTeamFlow = (mode: 'join' | 'create') => {
        if (busyAction === 'join' || busyAction === 'create') {
            return;
        }
        nextFlowView('form', mode);
    };

    const ensureVisibleConnectingStep = async (startedAt: number) => {
        const minVisibleDurationMs = 450;
        const elapsed = Date.now() - startedAt;
        if (elapsed < minVisibleDurationMs) {
            await new Promise((resolve) =>
                setTimeout(resolve, minVisibleDurationMs - elapsed),
            );
        }
    };

    const refreshConnectedTeamName = () => {
        connectedTeamName =
            teams.find((team) => team.id === selectedTeamId)?.name ??
            'your workspace';
    };

    const reloadTeams = async () => {
        loading = true;
        clearMessages();

        try {
            teams = await fetchUserTeams();
            const storedId = initializeWorkspaceTeam();
            const selected = teams.find((team) => team.id === storedId);
            selectedTeamId = selected ? selected.id : (teams[0]?.id ?? null);
            setWorkspaceTeam(selectedTeamId);
        } catch (err) {
            teams = [];
            selectedTeamId = null;
            setWorkspaceTeam(null);
            error = getMessage(err);
        } finally {
            loading = false;
        }
    };

    const selectTeam = (teamId: number) => {
        selectedTeamId = teamId;
        setWorkspaceTeam(teamId);
        success = 'Team selected for workspace context.';
    };

    const submitJoin = async () => {
        clearMessages();
        if (!joinCode.trim()) {
            error = 'Team code is required.';
            return;
        }

        nextFlowView('connecting', 'join');
        await tick();
        const startedAt = Date.now();
        busyAction = 'join';
        try {
            await joinTeam(joinCode.trim().toUpperCase());
            joinCode = '';
            await reloadTeams();
            await ensureVisibleConnectingStep(startedAt);
            refreshConnectedTeamName();
            nextFlowView('success');
            success = 'Joined team successfully.';
        } catch (err) {
            nextFlowView('form', 'join');
            error = getMessage(err);
        } finally {
            busyAction = null;
        }
    };

    const submitCreate = async () => {
        clearMessages();

        if (!createName.trim() || !createProject.trim()) {
            error = 'Team name and project name are required.';
            return;
        }

        nextFlowView('connecting', 'create');
        await tick();
        const startedAt = Date.now();
        busyAction = 'create';
        try {
            await createTeam({
                name: createName.trim(),
                projectname: createProject.trim(),
                description: createDescription.trim(),
            });

            createName = '';
            createProject = '';
            createDescription = '';
            await reloadTeams();
            await ensureVisibleConnectingStep(startedAt);
            refreshConnectedTeamName();
            nextFlowView('success');
            success = 'Team created successfully.';
        } catch (err) {
            nextFlowView('form', 'create');
            error = getMessage(err);
        } finally {
            busyAction = null;
        }
    };

    const removeTeam = async (teamId: number) => {
        clearMessages();
        busyAction = `delete-${teamId}`;

        try {
            await deleteTeam(teamId);
            if (selectedTeamId === teamId) {
                selectedTeamId = null;
                setWorkspaceTeam(null);
            }
            await reloadTeams();
            success = 'Team removed successfully.';
        } catch (err) {
            error = getMessage(err);
        } finally {
            busyAction = null;
        }
    };

    onMount(async () => {
        await reloadTeams();
    });
</script>

<AppHead title="Workspace Teams" />

<AppLayout {breadcrumbs}>
    <div
        class="fx-stagger flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
        data-test="teams-page"
    >
        <div class="grid gap-4 xl:grid-cols-3">
            <Card class="xl:col-span-2">
                <CardHeader>
                    <CardTitle>Team Workspace</CardTitle>
                    <CardDescription>
                        Choose the active team used by dashboard, tasks, and
                        calendar.
                    </CardDescription>
                </CardHeader>
                <CardContent class="space-y-3">
                    {#if loading}
                        <p class="text-sm text-muted-foreground">
                            Loading teams...
                        </p>
                    {:else if teams.length === 0}
                        <p class="text-sm text-muted-foreground">
                            You do not belong to any team yet.
                        </p>
                    {:else}
                        <div class="grid gap-3 md:grid-cols-2">
                            {#each teams as team (team.id)}
                                <div
                                    class="rounded-md border p-3 text-sm {selectedTeamId ===
                                    team.id
                                        ? 'border-primary bg-primary/5'
                                        : ''}"
                                >
                                    <div
                                        class="mb-2 flex items-center justify-between"
                                    >
                                        <p class="font-semibold">{team.name}</p>
                                        {#if selectedTeamId === team.id}
                                            <Badge>Active</Badge>
                                        {/if}
                                    </div>
                                    <p class="text-muted-foreground">
                                        {team.projectName || 'No project name'}
                                    </p>
                                    <p
                                        class="mt-2 line-clamp-2 text-muted-foreground"
                                    >
                                        {team.description || 'No description'}
                                    </p>
                                    <div class="mt-3 flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => selectTeam(team.id)}
                                        >
                                            Use Team
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            disabled={busyAction ===
                                                `delete-${team.id}`}
                                            onClick={() => removeTeam(team.id)}
                                        >
                                            {busyAction === `delete-${team.id}`
                                                ? 'Removing...'
                                                : 'Delete'}
                                        </Button>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                    <CardDescription
                        >Current membership context.</CardDescription
                    >
                </CardHeader>
                <CardContent class="space-y-2 text-sm">
                    <p>
                        <span class="font-semibold">Team count:</span>
                        {teams.length}
                    </p>
                    <p>
                        <span class="font-semibold">Selected:</span>
                        {selectedTeamId ? `Team #${selectedTeamId}` : 'None'}
                    </p>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Team Connection Flow</CardTitle>
                <CardDescription>
                    Team onboarding uses a dedicated transition flow. Each step
                    slides down, fades out, and reveals the next step while you
                    connect to a workspace.
                </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="flex flex-wrap gap-2">
                    <Button
                        variant={teamFlowMode === 'join'
                            ? 'default'
                            : 'outline'}
                        disabled={busyAction === 'join' ||
                            busyAction === 'create'}
                        onClick={() => switchTeamFlow('join')}
                    >
                        Join Existing Team
                    </Button>
                    <Button
                        variant={teamFlowMode === 'create'
                            ? 'default'
                            : 'outline'}
                        disabled={busyAction === 'join' ||
                            busyAction === 'create'}
                        onClick={() => switchTeamFlow('create')}
                    >
                        Create New Team
                    </Button>
                </div>

                {#key `${teamFlowMode}-${teamFlowStep}-${teamFlowKey}`}
                    <div
                        class="rounded-md border bg-muted/20 p-4 shadow-sm"
                        in:fly={{
                            y: 24,
                            duration: 260,
                            opacity: 0.15,
                            easing: cubicOut,
                        }}
                        out:fly={{
                            y: 16,
                            duration: 180,
                            opacity: 0,
                            easing: cubicInOut,
                        }}
                    >
                        {#if teamFlowStep === 'form' && teamFlowMode === 'join'}
                            <div class="space-y-3">
                                <h3 class="text-sm font-semibold">
                                    Step 1: Enter team invitation
                                </h3>
                                <label class="flex flex-col gap-1 text-sm">
                                    <span class="font-medium">Team Code</span>
                                    <input
                                        class="fx-input h-10 rounded-md border border-input bg-background px-3"
                                        maxlength="6"
                                        value={joinCode}
                                        oninput={(event) => {
                                            const target =
                                                event.currentTarget as HTMLInputElement;
                                            joinCode = target.value;
                                        }}
                                        placeholder="ABC123"
                                    />
                                </label>
                                <Button
                                    class="w-full"
                                    disabled={busyAction === 'join'}
                                    onClick={submitJoin}
                                >
                                    {busyAction === 'join'
                                        ? 'Joining...'
                                        : 'Start Connection'}
                                </Button>
                            </div>
                        {:else if teamFlowStep === 'form' && teamFlowMode === 'create'}
                            <div class="space-y-3">
                                <h3 class="text-sm font-semibold">
                                    Step 1: Create your team workspace
                                </h3>
                                <label class="flex flex-col gap-1 text-sm">
                                    <span class="font-medium">Team Name</span>
                                    <input
                                        class="fx-input h-10 rounded-md border border-input bg-background px-3"
                                        value={createName}
                                        oninput={(event) => {
                                            const target =
                                                event.currentTarget as HTMLInputElement;
                                            createName = target.value;
                                        }}
                                        placeholder="Platform Builders"
                                    />
                                </label>

                                <label class="flex flex-col gap-1 text-sm">
                                    <span class="font-medium">Project Name</span
                                    >
                                    <input
                                        class="fx-input h-10 rounded-md border border-input bg-background px-3"
                                        value={createProject}
                                        oninput={(event) => {
                                            const target =
                                                event.currentTarget as HTMLInputElement;
                                            createProject = target.value;
                                        }}
                                        placeholder="Platform-IO Remake"
                                    />
                                </label>

                                <label class="flex flex-col gap-1 text-sm">
                                    <span class="font-medium">Description</span>
                                    <textarea
                                        class="fx-input min-h-24 rounded-md border border-input bg-background px-3 py-2"
                                        value={createDescription}
                                        oninput={(event) => {
                                            const target =
                                                event.currentTarget as HTMLTextAreaElement;
                                            createDescription = target.value;
                                        }}
                                        placeholder="Write what this team is building"
                                    ></textarea>
                                </label>

                                <Button
                                    class="w-full"
                                    disabled={busyAction === 'create'}
                                    onClick={submitCreate}
                                >
                                    {busyAction === 'create'
                                        ? 'Creating...'
                                        : 'Start Connection'}
                                </Button>
                            </div>
                        {:else if teamFlowStep === 'connecting'}
                            <div class="space-y-3 text-sm">
                                <h3 class="font-semibold">
                                    Step 2: Connecting you to team workspace
                                </h3>
                                <p class="text-muted-foreground">
                                    Preparing team context, syncing workspace
                                    access, and making this team available for
                                    dashboard, tasks, chat, files, and AI.
                                </p>
                                <div class="team-flow-progress-track">
                                    <div class="team-flow-progress-bar"></div>
                                </div>
                                <p class="text-xs text-muted-foreground">
                                    Please wait while we finish your team
                                    connection.
                                </p>
                            </div>
                        {:else}
                            <div class="space-y-3 text-sm">
                                <h3 class="font-semibold">
                                    Step 3: Team connection complete
                                </h3>
                                <p>
                                    You are now connected to
                                    <span class="font-semibold">
                                        {connectedTeamName || 'your workspace'}
                                    </span>.
                                </p>
                                <p class="text-muted-foreground">
                                    Continue to your dashboard or connect
                                    another team.
                                </p>
                                <div class="flex flex-wrap gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => nextFlowView('form')}
                                    >
                                        Connect Another Team
                                    </Button>
                                    <Button asChild>
                                        {#snippet children(props)}
                                            <Link
                                                {...props}
                                                href={dashboard()}
                                                class={props.class}
                                            >
                                                Go To Dashboard
                                            </Link>
                                        {/snippet}
                                    </Button>
                                </div>
                            </div>
                        {/if}
                    </div>
                {/key}
            </CardContent>
        </Card>

        {#if error}
            <p class="text-sm text-red-600">{error}</p>
        {/if}
        {#if success}
            <p class="text-sm text-green-600">{success}</p>
        {/if}
    </div>
</AppLayout>

<style>
    .team-flow-progress-track {
        position: relative;
        width: 100%;
        height: 0.5rem;
        border-radius: 9999px;
        background: hsl(var(--primary) / 0.2);
        overflow: hidden;
    }

    .team-flow-progress-bar {
        position: absolute;
        top: 0;
        left: 0;
        width: 35%;
        height: 100%;
        border-radius: 9999px;
        background: linear-gradient(
            90deg,
            hsl(var(--primary) / 0.2),
            hsl(var(--primary) / 0.85),
            hsl(var(--primary) / 0.2)
        );
        animation: team-flow-progress 1.2s linear infinite;
    }

    @keyframes team-flow-progress {
        0% {
            transform: translateX(-130%);
        }
        100% {
            transform: translateX(360%);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .team-flow-progress-bar {
            animation-duration: 2.4s;
        }
    }
</style>
