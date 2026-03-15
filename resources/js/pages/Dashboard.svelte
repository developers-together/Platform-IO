<script lang="ts">
    import { Link } from '@inertiajs/svelte';
    import { onMount } from 'svelte';
    import { cubicOut } from 'svelte/easing';
    import { fly } from 'svelte/transition';
    import AppHead from '@/components/AppHead.svelte';
    import { Button } from '@/components/ui/button';
    import {
        Card,
        CardContent,
        CardDescription,
        CardHeader,
        CardTitle,
    } from '@/components/ui/card';
    import AppLayout from '@/layouts/AppLayout.svelte';
    import { fetchChatMessages, fetchTeamChats } from '@/lib/api/chats';
    import {
        fetchTaskSuggestions,
        fetchTeamTasks,
        updateTask,
    } from '@/lib/api/tasks';
    import { fetchUserTeams } from '@/lib/api/teams';
    import {
        dashboard,
        workspaceCalendar,
        workspaceChat,
        workspaceTasks,
    } from '@/lib/appRoutes';
    import {
        initializeWorkspaceTeam,
        setWorkspaceTeam,
        workspaceState,
    } from '@/lib/workspace.svelte';
    import type {
        BreadcrumbItem,
        ChatMessage,
        TaskSuggestion,
        TaskSummary,
        TaskUpdatePayload,
        TeamSummary,
    } from '@/types';

    type RecentChatGroup = {
        id: number;
        name: string;
        isOpen: boolean;
        messages: {
            id: number;
            user: string;
            text: string;
        }[];
    };

    type DashboardSuggestion = TaskSuggestion & {
        localKey: string;
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Workspace Dashboard',
            href: dashboard(),
        },
    ];

    const workspace = workspaceState();
    let teams = $state<TeamSummary[]>([]);
    let selectedTeamId = $state<number | null>(workspace.selectedTeamId);
    let tasks = $state<TaskSummary[]>([]);
    let suggestions = $state<DashboardSuggestion[]>([]);
    let recentChatGroups = $state<RecentChatGroup[]>([]);

    let loadingTeams = $state(true);
    let loadingData = $state(false);
    let error = $state('');
    let success = $state('');
    let pendingTaskIds = $state<number[]>([]);

    const parseDate = (value: string | null): Date | null => {
        if (!value) return null;
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const formatDate = (value: string | null): string => {
        const parsed = parseDate(value);
        if (!parsed) return 'No due date';

        return parsed.toLocaleString([], {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatClock = (value: string | null): string => {
        const parsed = parseDate(value);
        if (!parsed) return '--:--';
        return parsed.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const trimMessage = (value: string): string =>
        value.length > 56 ? `${value.slice(0, 56)}...` : value;

    const getMessage = (err: unknown): string => {
        if (err instanceof Error) return err.message;
        return 'Something went wrong. Please try again.';
    };

    const mapSuggestions = (value: TaskSuggestion[]): DashboardSuggestion[] =>
        value.map((suggestion, index) => ({
            ...suggestion,
            localKey:
                suggestion.id !== null
                    ? `id-${suggestion.id}`
                    : `${suggestion.title}-${index}`,
        }));

    const openTasks = $derived(
        tasks
            .filter((task) => !task.completed)
            .sort((a, b) => {
                if (a.starred !== b.starred) {
                    return a.starred ? -1 : 1;
                }

                const aDue =
                    parseDate(a.endAt)?.getTime() ?? Number.MAX_SAFE_INTEGER;
                const bDue =
                    parseDate(b.endAt)?.getTime() ?? Number.MAX_SAFE_INTEGER;
                if (aDue !== bDue) {
                    return aDue - bDue;
                }

                return b.id - a.id;
            }),
    );

    const completedTasks = $derived(tasks.filter((task) => task.completed));

    const upcomingEvents = $derived(
        openTasks
            .filter((task) => parseDate(task.endAt))
            .slice(0, 3)
            .map((task) => ({
                id: task.id,
                title: task.title,
                description: task.description || 'No description',
                startTime: formatClock(task.startAt ?? task.createdAt),
                endTime: formatClock(task.endAt),
            })),
    );

    const calendarDays = $derived.by(() => {
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        const count = new Date(year, month + 1, 0).getDate();
        return Array.from({ length: count }, (_, index) => index + 1);
    });

    const calendarEventDays = $derived.by(() => {
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        const daySet: number[] = [];

        for (const task of tasks) {
            const endDate = parseDate(task.endAt);
            if (!endDate) {
                continue;
            }

            if (
                endDate.getMonth() === month &&
                endDate.getFullYear() === year &&
                !daySet.includes(endDate.getDate())
            ) {
                daySet.push(endDate.getDate());
            }
        }

        return daySet;
    });

    const setTaskPending = (taskId: number, pending: boolean) => {
        if (pending) {
            if (!pendingTaskIds.includes(taskId)) {
                pendingTaskIds = [...pendingTaskIds, taskId];
            }
            return;
        }

        pendingTaskIds = pendingTaskIds.filter((value) => value !== taskId);
    };

    const buildUpdatePayload = (
        task: TaskSummary,
        completed: boolean,
    ): TaskUpdatePayload => ({
        title: task.title,
        description: task.description,
        completed,
        stared: task.starred,
        start: task.startAt,
        end: task.endAt,
        category: 'General',
    });

    const loadRecentChats = async (teamId: number) => {
        const channels = (await fetchTeamChats(teamId)).slice(0, 4);
        const currentGroups = new Map(
            recentChatGroups.map((group) => [group.id, group]),
        );

        const mapped = await Promise.all(
            channels.map(async (channel) => {
                let channelMessages: ChatMessage[] = [];
                try {
                    channelMessages = await fetchChatMessages(channel.id);
                } catch {
                    channelMessages = [];
                }

                const lastTwo = channelMessages.slice(-2).map((message) => ({
                    id: message.id,
                    user: message.userName,
                    text: trimMessage(message.message || '[Attachment]'),
                }));

                return {
                    id: channel.id,
                    name: channel.name,
                    isOpen: currentGroups.get(channel.id)?.isOpen ?? false,
                    messages: lastTwo,
                } satisfies RecentChatGroup;
            }),
        );

        recentChatGroups = mapped.slice(0, 2);
    };

    const loadTeamData = async (teamId: number) => {
        loadingData = true;
        error = '';
        success = '';

        const [tasksResult, suggestionsResult, chatsResult] =
            await Promise.allSettled([
                fetchTeamTasks(teamId),
                fetchTaskSuggestions(teamId),
                loadRecentChats(teamId),
            ]);

        if (tasksResult.status === 'fulfilled') {
            tasks = tasksResult.value;
        } else {
            tasks = [];
            error = getMessage(tasksResult.reason);
        }

        if (suggestionsResult.status === 'fulfilled') {
            suggestions = mapSuggestions(suggestionsResult.value);
        } else {
            suggestions = [];
            if (!error) {
                error = 'Some dashboard widgets failed to load.';
            }
        }

        if (chatsResult.status === 'rejected') {
            recentChatGroups = [];
            if (!error) {
                error = 'Some dashboard widgets failed to load.';
            }
        }

        loadingData = false;
    };

    const loadTeams = async () => {
        loadingTeams = true;
        error = '';

        try {
            teams = await fetchUserTeams();
            if (teams.length === 0) {
                selectedTeamId = null;
                setWorkspaceTeam(null);
                tasks = [];
                suggestions = [];
                recentChatGroups = [];
                return;
            }

            const initialTeamId = initializeWorkspaceTeam();
            const selectedTeam = teams.find(
                (team) => team.id === initialTeamId,
            );
            selectedTeamId = selectedTeam ? selectedTeam.id : teams[0].id;
            setWorkspaceTeam(selectedTeamId);
            await loadTeamData(selectedTeamId);
        } catch (err) {
            teams = [];
            selectedTeamId = null;
            setWorkspaceTeam(null);
            tasks = [];
            suggestions = [];
            recentChatGroups = [];
            error = getMessage(err);
        } finally {
            loadingTeams = false;
        }
    };

    const handleTeamChange = async (event: Event) => {
        const target = event.currentTarget as HTMLSelectElement;
        const value = Number(target.value);
        if (!value || value === selectedTeamId) return;

        selectedTeamId = value;
        setWorkspaceTeam(value);
        await loadTeamData(value);
    };

    const refreshCurrentTeam = async () => {
        if (!selectedTeamId) return;
        await loadTeamData(selectedTeamId);
    };

    const completeTaskFromDashboard = async (task: TaskSummary) => {
        error = '';
        success = '';
        setTaskPending(task.id, true);

        try {
            const updatedTask = await updateTask(
                task.id,
                buildUpdatePayload(task, true),
            );

            tasks = tasks.map((existingTask) =>
                existingTask.id === task.id
                    ? (updatedTask ?? {
                          ...existingTask,
                          completed: true,
                      })
                    : existingTask,
            );
            success = 'Task marked as completed.';
        } catch (err) {
            error = getMessage(err);
        } finally {
            setTaskPending(task.id, false);
        }
    };

    const toggleChatGroup = (groupId: number) => {
        recentChatGroups = recentChatGroups.map((group) =>
            group.id === groupId ? { ...group, isOpen: !group.isOpen } : group,
        );
    };

    const handleSuggestionAction = (
        localKey: string,
        action: 'accepted' | 'rejected',
    ) => {
        suggestions = suggestions.filter(
            (suggestion) => suggestion.localKey !== localKey,
        );
        success =
            action === 'accepted'
                ? 'Suggestion accepted and cleared from queue.'
                : 'Suggestion rejected and cleared from queue.';
    };

    onMount(async () => {
        await loadTeams();
    });
</script>

<AppHead title="Workspace Dashboard" />

<AppLayout {breadcrumbs}>
    <div
        class="fx-stagger flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
        data-test="dashboard-page"
    >
        <Card>
            <CardHeader>
                <CardTitle>Workspace Context</CardTitle>
                <CardDescription>
                    Select a team to populate dashboard cards with live data.
                </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <label class="flex flex-1 flex-col gap-1 text-sm">
                        <span class="font-medium">Active Team</span>
                        <select
                            class="fx-input h-10 rounded-md border border-input bg-background px-3"
                            disabled={loadingTeams || teams.length === 0}
                            onchange={handleTeamChange}
                            value={selectedTeamId ?? ''}
                        >
                            {#if teams.length === 0}
                                <option value="">No teams found</option>
                            {:else}
                                {#each teams as team (team.id)}
                                    <option value={team.id}>{team.name}</option>
                                {/each}
                            {/if}
                        </select>
                    </label>

                    <Button
                        variant="outline"
                        disabled={!selectedTeamId || loadingData}
                        onClick={refreshCurrentTeam}
                    >
                        {loadingData ? 'Refreshing...' : 'Refresh Data'}
                    </Button>
                </div>
            </CardContent>
        </Card>

        <div class="grid gap-4 xl:grid-cols-3">
            <Card>
                <CardHeader>
                    <CardTitle>
                        <Link href={workspaceTasks()} class="hover:underline">
                            My Tasks
                        </Link>
                    </CardTitle>
                    <CardDescription>
                        Quick completion for top active tasks.
                    </CardDescription>
                </CardHeader>
                <CardContent class="space-y-3">
                    {#if loadingData}
                        <p class="text-sm text-muted-foreground">
                            Loading tasks...
                        </p>
                    {:else if openTasks.length === 0}
                        <p class="text-sm text-muted-foreground">
                            No tasks yet.
                        </p>
                    {:else}
                        {#each openTasks.slice(0, 5) as task (task.id)}
                            <label
                                class="flex items-start gap-3 rounded-md border p-3 text-sm"
                                transition:fly={{
                                    y: 12,
                                    duration: 180,
                                    opacity: 0.2,
                                    easing: cubicOut,
                                }}
                            >
                                <input
                                    type="checkbox"
                                    class="mt-1"
                                    checked={false}
                                    disabled={pendingTaskIds.includes(task.id)}
                                    onchange={() =>
                                        completeTaskFromDashboard(task)}
                                />
                                <span class="flex flex-1 flex-col gap-1">
                                    <span class="font-medium">{task.title}</span
                                    >
                                    <span class="text-xs text-muted-foreground"
                                        >Due: {formatDate(task.endAt)}</span
                                    >
                                </span>
                            </label>
                        {/each}
                    {/if}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        <Link href={workspaceChat()} class="hover:underline">
                            Recent Chat
                        </Link>
                    </CardTitle>
                    <CardDescription>
                        Last messages from top team channels.
                    </CardDescription>
                </CardHeader>
                <CardContent class="space-y-2">
                    {#if loadingData}
                        <p class="text-sm text-muted-foreground">
                            Loading recent chats...
                        </p>
                    {:else if recentChatGroups.length === 0}
                        <p class="text-sm text-muted-foreground">
                            No chats found.
                        </p>
                    {:else}
                        {#each recentChatGroups as group (group.id)}
                            <div class="rounded-md border">
                                <button
                                    type="button"
                                    class="flex w-full items-center justify-between gap-2 p-3 text-left text-sm"
                                    onclick={() => toggleChatGroup(group.id)}
                                >
                                    <span class="font-medium">{group.name}</span
                                    >
                                    <span class="text-xs text-muted-foreground"
                                        >{group.isOpen ? 'Hide' : 'Show'}</span
                                    >
                                </button>
                                {#if group.isOpen}
                                    <div
                                        class="space-y-2 border-t p-3 text-xs"
                                        transition:fly={{
                                            y: 12,
                                            duration: 160,
                                            opacity: 0.2,
                                            easing: cubicOut,
                                        }}
                                    >
                                        {#if group.messages.length === 0}
                                            <p class="text-muted-foreground">
                                                No recent messages.
                                            </p>
                                        {:else}
                                            {#each group.messages as message (message.id)}
                                                <p>
                                                    <span class="font-semibold"
                                                        >{message.user}:</span
                                                    >
                                                    {message.text}
                                                </p>
                                            {/each}
                                        {/if}
                                    </div>
                                {/if}
                            </div>
                        {/each}
                    {/if}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>AI Suggested Actions</CardTitle>
                    <CardDescription>
                        Suggestions from task recommendation endpoint.
                    </CardDescription>
                </CardHeader>
                <CardContent class="space-y-2">
                    {#if loadingData}
                        <p class="text-sm text-muted-foreground">
                            Loading suggestions...
                        </p>
                    {:else if suggestions.length === 0}
                        <p class="text-sm text-muted-foreground">
                            No suggestions yet.
                        </p>
                    {:else}
                        {#each suggestions.slice(0, 5) as suggestion (suggestion.localKey)}
                            <div
                                class="flex items-start justify-between gap-2 rounded-md border p-3 text-sm"
                                transition:fly={{
                                    y: 12,
                                    duration: 180,
                                    opacity: 0.2,
                                    easing: cubicOut,
                                }}
                            >
                                <div class="space-y-1">
                                    <p class="font-medium">
                                        {suggestion.title}
                                    </p>
                                    {#if suggestion.description}
                                        <p
                                            class="text-xs text-muted-foreground"
                                        >
                                            {suggestion.description}
                                        </p>
                                    {/if}
                                </div>
                                <div class="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            handleSuggestionAction(
                                                suggestion.localKey,
                                                'accepted',
                                            )}
                                    >
                                        >Accept</Button
                                    >
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            handleSuggestionAction(
                                                suggestion.localKey,
                                                'rejected',
                                            )}
                                    >
                                        >Reject</Button
                                    >
                                </div>
                            </div>
                        {/each}
                    {/if}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        <Link
                            href={workspaceCalendar()}
                            class="hover:underline"
                        >
                            Calendar
                        </Link>
                    </CardTitle>
                    <CardDescription>
                        Current month with deadline indicators.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="grid grid-cols-7 gap-2 text-xs">
                        {#each calendarDays as day (day)}
                            <div
                                class="flex h-9 items-center justify-center rounded border {calendarEventDays.includes(
                                    day,
                                )
                                    ? 'border-primary bg-primary/10 font-semibold'
                                    : 'border-border'}"
                            >
                                {day}
                            </div>
                        {/each}
                    </div>
                </CardContent>
            </Card>

            <Card class="xl:col-span-2">
                <CardHeader>
                    <CardTitle>
                        <Link
                            href={workspaceCalendar()}
                            class="hover:underline"
                        >
                            Upcoming Events
                        </Link>
                    </CardTitle>
                    <CardDescription>
                        Nearest task deadlines for this team.
                    </CardDescription>
                </CardHeader>
                <CardContent class="space-y-2">
                    {#if loadingData}
                        <p class="text-sm text-muted-foreground">
                            Loading events...
                        </p>
                    {:else if upcomingEvents.length === 0}
                        <p class="text-sm text-muted-foreground">
                            No upcoming events.
                        </p>
                    {:else}
                        {#each upcomingEvents as event (event.id)}
                            <div
                                class="rounded-md border p-3 text-sm hover:bg-muted/40"
                                transition:fly={{
                                    y: 10,
                                    duration: 170,
                                    opacity: 0.2,
                                    easing: cubicOut,
                                }}
                            >
                                <p class="font-medium">{event.title}</p>
                                <p class="text-xs text-muted-foreground">
                                    {event.startTime} - {event.endTime}
                                </p>
                                <p class="text-xs text-muted-foreground">
                                    {event.description}
                                </p>
                            </div>
                        {/each}
                    {/if}
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Snapshot</CardTitle>
                <CardDescription>
                    Current workload summary from selected team.
                </CardDescription>
            </CardHeader>
            <CardContent class="grid gap-3 text-sm md:grid-cols-4">
                <p><span class="font-semibold">Teams:</span> {teams.length}</p>
                <p>
                    <span class="font-semibold">Active tasks:</span>
                    {openTasks.length}
                </p>
                <p>
                    <span class="font-semibold">Completed tasks:</span>
                    {completedTasks.length}
                </p>
                <p>
                    <span class="font-semibold">Suggestions:</span>
                    {suggestions.length}
                </p>
            </CardContent>
        </Card>

        {#if error}
            <p class="text-sm text-red-600">{error}</p>
        {/if}
        {#if success}
            <p class="text-sm text-emerald-600">{success}</p>
        {/if}
    </div>
</AppLayout>
