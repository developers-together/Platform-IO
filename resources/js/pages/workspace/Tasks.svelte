<script lang="ts">
    import { onMount } from 'svelte';
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
        createTask,
        deleteTask,
        fetchTeamTasks,
        updateTask,
    } from '@/lib/api/tasks';
    import { fetchUserTeams } from '@/lib/api/teams';
    import {
        initializeWorkspaceTeam,
        setWorkspaceTeam,
        workspaceState,
    } from '@/lib/workspace.svelte';
    import { workspaceTasks } from '@/lib/appRoutes';
    import type {
        BreadcrumbItem,
        TaskSummary,
        TaskUpdatePayload,
        TeamSummary,
    } from '@/types';

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Tasks',
            href: workspaceTasks(),
        },
    ];

    const workspace = workspaceState();
    let teams = $state<TeamSummary[]>([]);
    let selectedTeamId = $state<number | null>(workspace.selectedTeamId);

    let loading = $state(true);
    let busyTaskId = $state<number | null>(null);
    let busyAction = $state<'create' | 'update' | 'delete' | ''>('');

    let tasks = $state<TaskSummary[]>([]);
    let error = $state('');
    let success = $state('');

    let newTaskTitle = $state('');
    let newTaskDescription = $state('');
    let newTaskDueDate = $state('');

    let showCompleted = $state(false);
    let expandedTaskIds = $state<number[]>([]);
    let editingTaskId = $state<number | null>(null);
    let editingTitle = $state('');
    let editingDescription = $state('');
    let editingDueDate = $state('');
    let confirmDeleteTaskId = $state<number | null>(null);
    let editedTaskId = $state<number | null>(null);

    const parseDate = (value: string | null): Date | null => {
        if (!value) return null;
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const toDateInputValue = (value: string | null): string => {
        const parsed = parseDate(value);
        if (!parsed) {
            return '';
        }

        const pad = (part: number) => String(part).padStart(2, '0');
        const year = parsed.getFullYear();
        const month = pad(parsed.getMonth() + 1);
        const day = pad(parsed.getDate());
        const hour = pad(parsed.getHours());
        const minute = pad(parsed.getMinutes());
        return `${year}-${month}-${day}T${hour}:${minute}`;
    };

    const formatDate = (value: string | null): string => {
        const parsed = parseDate(value);
        if (!parsed) return 'No date';

        return parsed.toLocaleString([], {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const sortTasks = (list: TaskSummary[]): TaskSummary[] =>
        [...list].sort((a, b) => {
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
        });

    const buildUpdatePayload = (
        task: TaskSummary,
        overrides: Partial<TaskUpdatePayload>,
    ): TaskUpdatePayload => ({
        title: task.title,
        description: task.description,
        completed: task.completed,
        stared: task.starred,
        start: task.startAt,
        end: task.endAt,
        category: 'General',
        ...overrides,
    });

    const activeTasks = $derived(
        sortTasks(tasks.filter((task) => !task.completed)),
    );
    const completedTasks = $derived(
        sortTasks(tasks.filter((task) => task.completed)),
    );

    const getMessage = (err: unknown): string => {
        if (err instanceof Error) return err.message;
        return 'Request failed.';
    };

    const clearMessages = () => {
        error = '';
        success = '';
    };

    const setEditedPulse = (taskId: number) => {
        editedTaskId = taskId;
        setTimeout(() => {
            if (editedTaskId === taskId) {
                editedTaskId = null;
            }
        }, 1100);
    };

    const clearEditState = () => {
        editingTaskId = null;
        editingTitle = '';
        editingDescription = '';
        editingDueDate = '';
    };

    const loadTasks = async () => {
        if (!selectedTeamId) {
            tasks = [];
            return;
        }

        loading = true;
        clearMessages();

        try {
            tasks = await fetchTeamTasks(selectedTeamId);
        } catch (err) {
            tasks = [];
            error = getMessage(err);
        } finally {
            loading = false;
        }
    };

    const loadTeamsAndTasks = async () => {
        loading = true;

        try {
            teams = await fetchUserTeams();
            const stored = initializeWorkspaceTeam();
            const selected = teams.find((team) => team.id === stored);
            selectedTeamId = selected ? selected.id : (teams[0]?.id ?? null);
            setWorkspaceTeam(selectedTeamId);
            await loadTasks();
        } catch (err) {
            teams = [];
            selectedTeamId = null;
            tasks = [];
            error = getMessage(err);
            loading = false;
        }
    };

    const selectTeam = async (event: Event) => {
        const target = event.currentTarget as HTMLSelectElement;
        const value = Number(target.value);
        selectedTeamId = Number.isFinite(value) && value > 0 ? value : null;
        setWorkspaceTeam(selectedTeamId);
        clearEditState();
        expandedTaskIds = [];
        confirmDeleteTaskId = null;
        await loadTasks();
    };

    const createNewTask = async () => {
        clearMessages();

        if (!selectedTeamId) {
            error = 'Select a team first.';
            return;
        }

        if (!newTaskTitle.trim()) {
            error = 'Task title is required.';
            return;
        }

        busyAction = 'create';
        busyTaskId = -1;
        try {
            const created = await createTask(selectedTeamId, {
                title: newTaskTitle.trim(),
                description: newTaskDescription.trim(),
                end: newTaskDueDate || null,
            });

            if (created) {
                tasks = [created, ...tasks];
                setEditedPulse(created.id);
            }

            newTaskTitle = '';
            newTaskDescription = '';
            newTaskDueDate = '';
            success = 'Task created successfully.';
        } catch (err) {
            error = getMessage(err);
        } finally {
            busyAction = '';
            busyTaskId = null;
        }
    };

    const toggleExpand = (taskId: number) => {
        if (expandedTaskIds.includes(taskId)) {
            expandedTaskIds = expandedTaskIds.filter((id) => id !== taskId);
        } else {
            expandedTaskIds = [...expandedTaskIds, taskId];
        }
    };

    const startEditTask = (task: TaskSummary) => {
        clearMessages();
        editingTaskId = task.id;
        editingTitle = task.title;
        editingDescription = task.description;
        editingDueDate = toDateInputValue(task.endAt);
        confirmDeleteTaskId = null;
    };

    const saveTaskEdit = async () => {
        clearMessages();

        if (!editingTaskId) {
            error = 'Choose a task to edit.';
            return;
        }

        if (!editingTitle.trim()) {
            error = 'Task title is required.';
            return;
        }

        const sourceTask = tasks.find((task) => task.id === editingTaskId);
        if (!sourceTask) {
            error = 'Task no longer exists.';
            clearEditState();
            return;
        }

        busyAction = 'update';
        busyTaskId = editingTaskId;
        try {
            const updated = await updateTask(
                sourceTask.id,
                buildUpdatePayload(sourceTask, {
                    title: editingTitle.trim(),
                    description: editingDescription.trim(),
                    end: editingDueDate || null,
                }),
            );

            tasks = tasks.map((task) =>
                task.id === sourceTask.id
                    ? (updated ?? {
                          ...task,
                          title: editingTitle.trim(),
                          description: editingDescription.trim(),
                          endAt: editingDueDate || null,
                      })
                    : task,
            );

            setEditedPulse(sourceTask.id);
            clearEditState();
            success = 'Task updated.';
        } catch (err) {
            error = getMessage(err);
        } finally {
            busyAction = '';
            busyTaskId = null;
        }
    };

    const toggleCompleted = async (task: TaskSummary) => {
        clearMessages();
        busyAction = 'update';
        busyTaskId = task.id;

        try {
            const updated = await updateTask(
                task.id,
                buildUpdatePayload(task, {
                    completed: !task.completed,
                }),
            );

            tasks = tasks.map((currentTask) =>
                currentTask.id === task.id
                    ? (updated ?? {
                          ...currentTask,
                          completed: !currentTask.completed,
                      })
                    : currentTask,
            );
            setEditedPulse(task.id);
        } catch (err) {
            error = getMessage(err);
        } finally {
            busyAction = '';
            busyTaskId = null;
        }
    };

    const toggleStarred = async (task: TaskSummary) => {
        clearMessages();
        busyAction = 'update';
        busyTaskId = task.id;

        try {
            const updated = await updateTask(
                task.id,
                buildUpdatePayload(task, {
                    stared: !task.starred,
                }),
            );

            tasks = tasks.map((currentTask) =>
                currentTask.id === task.id
                    ? (updated ?? {
                          ...currentTask,
                          starred: !currentTask.starred,
                      })
                    : currentTask,
            );
            setEditedPulse(task.id);
        } catch (err) {
            error = getMessage(err);
        } finally {
            busyAction = '';
            busyTaskId = null;
        }
    };

    const requestDeleteTask = (taskId: number) => {
        confirmDeleteTaskId = taskId;
    };

    const removeTask = async (taskId: number) => {
        clearMessages();
        busyAction = 'delete';
        busyTaskId = taskId;

        try {
            await deleteTask(taskId);
            tasks = tasks.filter((task) => task.id !== taskId);
            confirmDeleteTaskId = null;
            if (editingTaskId === taskId) {
                clearEditState();
            }
            success = 'Task deleted.';
        } catch (err) {
            error = getMessage(err);
        } finally {
            busyAction = '';
            busyTaskId = null;
        }
    };

    onMount(async () => {
        await loadTeamsAndTasks();
    });
</script>

<AppHead title="Workspace Tasks" />

<AppLayout {breadcrumbs}>
    <div
        class="fx-stagger flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
        data-test="tasks-page"
    >
        <Card>
            <CardHeader>
                <CardTitle>Task Board</CardTitle>
                <CardDescription>
                    Full workflow parity: create, edit, expand, star, complete,
                    and delete tasks.
                </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="grid gap-3 lg:grid-cols-6">
                    <label class="flex flex-col gap-1 text-sm lg:col-span-2">
                        <span class="font-medium">Team</span>
                        <select
                            class="fx-input h-10 rounded-md border border-input bg-background px-3"
                            disabled={teams.length === 0}
                            value={selectedTeamId ?? ''}
                            onchange={selectTeam}
                        >
                            {#if teams.length === 0}
                                <option value="">No teams available</option>
                            {:else}
                                {#each teams as team (team.id)}
                                    <option value={team.id}>{team.name}</option>
                                {/each}
                            {/if}
                        </select>
                    </label>

                    <label class="flex flex-col gap-1 text-sm lg:col-span-2">
                        <span class="font-medium">Task title</span>
                        <input
                            class="fx-input h-10 rounded-md border border-input bg-background px-3"
                            placeholder="Add a new task..."
                            value={newTaskTitle}
                            oninput={(event) => {
                                const target =
                                    event.currentTarget as HTMLInputElement;
                                newTaskTitle = target.value;
                            }}
                        />
                    </label>

                    <label class="flex flex-col gap-1 text-sm lg:col-span-1">
                        <span class="font-medium">Due date</span>
                        <input
                            type="datetime-local"
                            class="fx-input h-10 rounded-md border border-input bg-background px-3"
                            value={newTaskDueDate}
                            oninput={(event) => {
                                const target =
                                    event.currentTarget as HTMLInputElement;
                                newTaskDueDate = target.value;
                            }}
                        />
                    </label>

                    <div class="flex items-end lg:col-span-1">
                        <Button
                            class="w-full"
                            disabled={busyAction === 'create' ||
                                !selectedTeamId}
                            onClick={createNewTask}
                        >
                            {busyAction === 'create'
                                ? 'Creating...'
                                : 'Create Task'}
                        </Button>
                    </div>
                </div>

                <label class="flex flex-col gap-1 text-sm">
                    <span class="font-medium">Description</span>
                    <textarea
                        class="fx-input min-h-20 rounded-md border border-input bg-background px-3 py-2"
                        placeholder="Optional task details"
                        value={newTaskDescription}
                        oninput={(event) => {
                            const target =
                                event.currentTarget as HTMLTextAreaElement;
                            newTaskDescription = target.value;
                        }}
                    ></textarea>
                </label>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Active Tasks ({activeTasks.length})</CardTitle>
                <CardDescription>
                    Star priority tasks, open details, and edit inline.
                </CardDescription>
            </CardHeader>
            <CardContent class="space-y-3">
                {#if loading}
                    <p class="text-sm text-muted-foreground">
                        Loading active tasks...
                    </p>
                {:else if activeTasks.length === 0}
                    <p class="text-sm text-muted-foreground">
                        No active tasks.
                    </p>
                {:else}
                    {#each activeTasks as task (task.id)}
                        {#if editingTaskId === task.id}
                            <div
                                class="space-y-3 rounded-md border p-3 text-sm"
                            >
                                <div class="grid gap-3 lg:grid-cols-3">
                                    <label class="flex flex-col gap-1">
                                        <span class="font-medium">Title</span>
                                        <input
                                            class="fx-input h-10 rounded-md border border-input bg-background px-3"
                                            value={editingTitle}
                                            oninput={(event) => {
                                                const target =
                                                    event.currentTarget as HTMLInputElement;
                                                editingTitle = target.value;
                                            }}
                                        />
                                    </label>
                                    <label class="flex flex-col gap-1">
                                        <span class="font-medium">Due date</span
                                        >
                                        <input
                                            type="datetime-local"
                                            class="fx-input h-10 rounded-md border border-input bg-background px-3"
                                            value={editingDueDate}
                                            oninput={(event) => {
                                                const target =
                                                    event.currentTarget as HTMLInputElement;
                                                editingDueDate = target.value;
                                            }}
                                        />
                                    </label>
                                    <div
                                        class="flex items-end justify-start gap-2 lg:justify-end"
                                    >
                                        <Button
                                            size="sm"
                                            disabled={busyTaskId === task.id}
                                            onClick={saveTaskEdit}
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={busyTaskId === task.id}
                                            onClick={clearEditState}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                                <label class="flex flex-col gap-1">
                                    <span class="font-medium">Description</span>
                                    <textarea
                                        class="fx-input min-h-24 rounded-md border border-input bg-background px-3 py-2"
                                        value={editingDescription}
                                        oninput={(event) => {
                                            const target =
                                                event.currentTarget as HTMLTextAreaElement;
                                            editingDescription = target.value;
                                        }}
                                    ></textarea>
                                </label>
                            </div>
                        {:else}
                            <div
                                class="rounded-md border p-3 text-sm {task.starred
                                    ? 'border-amber-400 bg-amber-500/5'
                                    : ''} {editedTaskId === task.id
                                    ? 'ring-1 ring-emerald-500'
                                    : ''}"
                            >
                                <div
                                    class="mb-2 flex flex-wrap items-start justify-between gap-2"
                                >
                                    <div class="space-y-1">
                                        <div class="flex items-center gap-2">
                                            <p class="font-medium">
                                                {task.title}
                                            </p>
                                            {#if task.starred}
                                                <Badge>Starred</Badge>
                                            {/if}
                                        </div>
                                        {#if task.endAt}
                                            <p class="text-muted-foreground">
                                                Due: {formatDate(task.endAt)}
                                            </p>
                                        {/if}
                                    </div>
                                    <div class="flex flex-wrap gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={busyTaskId === task.id}
                                            onClick={() =>
                                                toggleCompleted(task)}
                                        >
                                            Complete
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={busyTaskId === task.id}
                                            onClick={() => toggleStarred(task)}
                                        >
                                            {task.starred ? 'Unstar' : 'Star'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={busyTaskId === task.id}
                                            onClick={() => startEditTask(task)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                toggleExpand(task.id)}
                                        >
                                            {expandedTaskIds.includes(task.id)
                                                ? 'Hide'
                                                : 'Details'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            disabled={busyTaskId === task.id}
                                            onClick={() =>
                                                requestDeleteTask(task.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>

                                {#if confirmDeleteTaskId === task.id}
                                    <div
                                        class="mb-2 flex items-center gap-2 rounded-md border border-red-300 bg-red-500/10 p-2 text-xs"
                                    >
                                        <span>Delete this task?</span>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            disabled={busyTaskId === task.id}
                                            onClick={() => removeTask(task.id)}
                                        >
                                            Confirm
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={busyTaskId === task.id}
                                            onClick={() => {
                                                confirmDeleteTaskId = null;
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                {/if}

                                {#if expandedTaskIds.includes(task.id)}
                                    <div
                                        class="space-y-1 rounded-md border bg-muted/30 p-2 text-xs"
                                    >
                                        <p>
                                            <span class="font-semibold"
                                                >Description:</span
                                            >
                                            {task.description ||
                                                'No description'}
                                        </p>
                                        <p>
                                            <span class="font-semibold"
                                                >Created:</span
                                            >
                                            {formatDate(task.createdAt)}
                                        </p>
                                        <p>
                                            <span class="font-semibold"
                                                >Due:</span
                                            >
                                            {formatDate(task.endAt)}
                                        </p>
                                    </div>
                                {/if}
                            </div>
                        {/if}
                    {/each}
                {/if}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Completed Tasks ({completedTasks.length})</CardTitle>
                <CardDescription>
                    Expand to review finished work and re-open tasks.
                </CardDescription>
            </CardHeader>
            <CardContent class="space-y-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        showCompleted = !showCompleted;
                    }}
                >
                    {showCompleted ? 'Hide Completed' : 'Show Completed'}
                </Button>

                {#if showCompleted}
                    {#if completedTasks.length === 0}
                        <p class="text-sm text-muted-foreground">
                            No completed tasks yet.
                        </p>
                    {:else}
                        {#each completedTasks as task (task.id)}
                            <div
                                class="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm"
                            >
                                <div>
                                    <p class="font-medium">{task.title}</p>
                                    <p class="text-xs text-muted-foreground">
                                        Completed item
                                    </p>
                                </div>
                                <div class="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={busyTaskId === task.id}
                                        onClick={() => toggleCompleted(task)}
                                    >
                                        Re-open
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={busyTaskId === task.id}
                                        onClick={() => toggleStarred(task)}
                                    >
                                        {task.starred ? 'Unstar' : 'Star'}
                                    </Button>
                                </div>
                            </div>
                        {/each}
                    {/if}
                {/if}
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
