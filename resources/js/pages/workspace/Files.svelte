<script lang="ts">
    import { onMount } from 'svelte';
    import AppHead from '@/components/AppHead.svelte';
    import { Button } from '@/components/ui/button';
    import {
        Card,
        CardContent,
        CardDescription,
        CardHeader,
        CardTitle,
    } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import AppLayout from '@/layouts/AppLayout.svelte';
    import {
        createFolder,
        deleteFile,
        deleteFolder,
        downloadFile,
        listWorkspaceEntries,
        uploadFile,
    } from '@/lib/api/files';
    import { fetchUserTeams } from '@/lib/api/teams';
    import {
        MAX_FILE_UPLOAD_SIZE_BYTES,
        normalizeWorkspacePath,
        validateUploadFile,
    } from '@/lib/security';
    import {
        initializeWorkspaceTeam,
        setWorkspaceTeam,
        workspaceState,
    } from '@/lib/workspace.svelte';
    import { workspaceFiles } from '@/lib/appRoutes';
    import type { BreadcrumbItem, TeamSummary, WorkspaceEntry } from '@/types';

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Files',
            href: workspaceFiles(),
        },
    ];

    const workspace = workspaceState();

    let teams = $state<TeamSummary[]>([]);
    let selectedTeamId = $state<number | null>(workspace.selectedTeamId);

    let currentPath = $state('/');
    let entries = $state<WorkspaceEntry[]>([]);

    let loading = $state(true);
    let busyAction = $state<'' | 'create-folder' | 'upload-file' | 'refresh'>(
        '',
    );

    let newFolderName = $state('');
    let error = $state('');
    let success = $state('');

    let fileInput = $state<HTMLInputElement | null>(null);

    const breadcrumbSegments = $derived.by(() => {
        const normalized = normalizeWorkspacePath(currentPath);
        if (normalized === '/') {
            return [] as { label: string; path: string }[];
        }

        const parts = normalized.split('/').filter(Boolean);
        return parts.map((part, index) => ({
            label: part,
            path: `/${parts.slice(0, index + 1).join('/')}`,
        }));
    });

    const clearNotices = () => {
        error = '';
        success = '';
    };

    const getErrorMessage = (err: unknown): string => {
        if (err instanceof Error) {
            return err.message;
        }

        return 'Action failed.';
    };

    const loadEntries = async () => {
        if (!selectedTeamId) {
            entries = [];
            return;
        }

        busyAction = 'refresh';
        clearNotices();

        try {
            entries = await listWorkspaceEntries(selectedTeamId, currentPath);
        } catch (err) {
            entries = [];
            error = getErrorMessage(err);
        } finally {
            busyAction = '';
        }
    };

    const loadWorkspace = async () => {
        loading = true;
        clearNotices();

        try {
            teams = await fetchUserTeams();
            const persistedTeamId = initializeWorkspaceTeam();
            const persistedTeam = teams.find(
                (team) => team.id === persistedTeamId,
            );

            selectedTeamId = persistedTeam
                ? persistedTeam.id
                : (teams[0]?.id ?? null);
            setWorkspaceTeam(selectedTeamId);

            currentPath = '/';
            await loadEntries();
        } catch (err) {
            teams = [];
            selectedTeamId = null;
            entries = [];
            error = getErrorMessage(err);
        } finally {
            loading = false;
        }
    };

    const selectTeam = async (event: Event) => {
        const target = event.currentTarget as HTMLSelectElement;
        const value = Number(target.value);

        selectedTeamId = Number.isFinite(value) && value > 0 ? value : null;
        setWorkspaceTeam(selectedTeamId);

        currentPath = '/';
        await loadEntries();
    };

    const openFolder = async (path: string) => {
        currentPath = normalizeWorkspacePath(path);
        await loadEntries();
    };

    const goBack = async () => {
        if (currentPath === '/') {
            return;
        }

        const parts = normalizeWorkspacePath(currentPath)
            .split('/')
            .filter(Boolean);

        parts.pop();
        currentPath = parts.length > 0 ? `/${parts.join('/')}` : '/';
        await loadEntries();
    };

    const navigateTo = async (path: string) => {
        currentPath = normalizeWorkspacePath(path);
        await loadEntries();
    };

    const createFolderAction = async () => {
        clearNotices();
        if (!selectedTeamId) {
            error = 'Select a team first.';
            return;
        }

        if (!newFolderName.trim()) {
            error = 'Folder name is required.';
            return;
        }

        busyAction = 'create-folder';
        try {
            await createFolder(selectedTeamId, newFolderName, currentPath);
            newFolderName = '';
            success = 'Folder created.';
            await loadEntries();
        } catch (err) {
            error = getErrorMessage(err);
        } finally {
            busyAction = '';
        }
    };

    const removeEntry = async (entry: WorkspaceEntry) => {
        clearNotices();
        if (!selectedTeamId) {
            error = 'Select a team first.';
            return;
        }

        const confirmed = window.confirm(`Delete ${entry.name}?`);
        if (!confirmed) {
            return;
        }

        try {
            if (entry.type === 'folder') {
                await deleteFolder(selectedTeamId, entry.path);
            } else {
                await deleteFile(selectedTeamId, entry.path);
            }
            success = `${entry.type === 'folder' ? 'Folder' : 'File'} deleted.`;
            await loadEntries();
        } catch (err) {
            error = getErrorMessage(err);
        }
    };

    const triggerUpload = () => {
        fileInput?.click();
    };

    const onUploadFile = async (event: Event) => {
        clearNotices();
        if (!selectedTeamId) {
            error = 'Select a team first.';
            return;
        }

        const target = event.currentTarget as HTMLInputElement;
        const file = target.files?.[0] ?? null;

        if (!file) {
            return;
        }

        const fileError = validateUploadFile(file, MAX_FILE_UPLOAD_SIZE_BYTES);
        if (fileError) {
            error = fileError;
            target.value = '';
            return;
        }

        busyAction = 'upload-file';
        try {
            await uploadFile(selectedTeamId, file, currentPath);
            success = 'File uploaded.';
            await loadEntries();
        } catch (err) {
            error = getErrorMessage(err);
        } finally {
            busyAction = '';
            target.value = '';
        }
    };

    const downloadEntry = async (entry: WorkspaceEntry) => {
        clearNotices();
        if (!selectedTeamId) {
            error = 'Select a team first.';
            return;
        }

        try {
            const result = await downloadFile(selectedTeamId, entry.path);
            const objectUrl = URL.createObjectURL(result.blob);

            const anchor = document.createElement('a');
            anchor.href = objectUrl;
            anchor.download = result.filename;
            document.body.append(anchor);
            anchor.click();
            anchor.remove();

            URL.revokeObjectURL(objectUrl);
            success = 'Download started.';
        } catch (err) {
            error = getErrorMessage(err);
        }
    };

    onMount(async () => {
        await loadWorkspace();
    });
</script>

<AppHead title="Workspace Files" />

<AppLayout {breadcrumbs}>
    <div
        class="fx-stagger flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
        data-test="files-page"
    >
        <Card>
            <CardHeader>
                <CardTitle>Team File Workspace</CardTitle>
                <CardDescription>
                    Browse folders and files with the existing backend storage
                    API.
                </CardDescription>
            </CardHeader>
            <CardContent class="grid gap-4 lg:grid-cols-3">
                <label class="flex flex-col gap-1 text-sm">
                    <span class="font-medium">Team</span>
                    <select
                        class="fx-input h-10 rounded-md border border-input bg-background px-3"
                        value={selectedTeamId ?? ''}
                        disabled={loading || teams.length === 0}
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
                    <span class="font-medium"
                        >Create folder in current path</span
                    >
                    <div class="flex gap-2">
                        <Input
                            placeholder="Folder name"
                            bind:value={newFolderName}
                            class="flex-1"
                        />
                        <Button
                            variant="outline"
                            disabled={busyAction === 'create-folder' ||
                                !selectedTeamId}
                            onClick={createFolderAction}
                        >
                            {busyAction === 'create-folder'
                                ? 'Creating...'
                                : 'Create'}
                        </Button>
                        <Button
                            variant="outline"
                            disabled={busyAction === 'upload-file' ||
                                !selectedTeamId}
                            onClick={triggerUpload}
                        >
                            {busyAction === 'upload-file'
                                ? 'Uploading...'
                                : 'Upload'}
                        </Button>
                        <input
                            bind:this={fileInput}
                            type="file"
                            class="hidden"
                            onchange={onUploadFile}
                        />
                    </div>
                </label>

                <div
                    class="rounded-md border bg-muted/30 p-3 text-sm lg:col-span-3"
                >
                    <div class="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            class="text-blue-600 underline"
                            onclick={() => navigateTo('/')}
                        >
                            Root
                        </button>
                        {#each breadcrumbSegments as segment (segment.path)}
                            <span class="text-muted-foreground">/</span>
                            <button
                                type="button"
                                class="text-blue-600 underline"
                                onclick={() => navigateTo(segment.path)}
                            >
                                {segment.label}
                            </button>
                        {/each}
                    </div>

                    <div class="mt-2 flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={currentPath === '/'}
                            onClick={goBack}
                        >
                            Back
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={!selectedTeamId ||
                                busyAction === 'refresh'}
                            onClick={loadEntries}
                        >
                            {busyAction === 'refresh'
                                ? 'Refreshing...'
                                : 'Refresh'}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>

        {#if error}
            <p class="text-sm text-red-600">{error}</p>
        {/if}

        {#if success}
            <p class="text-sm text-emerald-600">{success}</p>
        {/if}

        <Card>
            <CardHeader>
                <CardTitle>Current Path</CardTitle>
                <CardDescription
                    >{normalizeWorkspacePath(currentPath)}</CardDescription
                >
            </CardHeader>
            <CardContent class="space-y-2">
                {#if loading}
                    <p class="text-sm text-muted-foreground">
                        Loading workspace...
                    </p>
                {:else if entries.length === 0}
                    <p class="text-sm text-muted-foreground">
                        No files or folders here.
                    </p>
                {:else}
                    {#each entries as entry (entry.path)}
                        <div
                            class="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3 text-sm"
                        >
                            <div>
                                <p class="font-medium">{entry.name}</p>
                                <p class="text-xs text-muted-foreground">
                                    {entry.path}
                                </p>
                            </div>

                            <div class="flex gap-2">
                                {#if entry.type === 'folder'}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openFolder(entry.path)}
                                    >
                                        Open
                                    </Button>
                                {:else}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => downloadEntry(entry)}
                                    >
                                        Download
                                    </Button>
                                {/if}

                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => removeEntry(entry)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    {/each}
                {/if}
            </CardContent>
        </Card>
    </div>
</AppLayout>
