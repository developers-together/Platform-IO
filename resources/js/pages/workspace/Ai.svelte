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
    import { Input } from '@/components/ui/input';
    import AppLayout from '@/layouts/AppLayout.svelte';
    import {
        createAiChat,
        deleteAiChat,
        fetchAiChats,
        fetchAiHistory,
        renameAiChat,
        sendAiPrompt,
        webSearchAi,
    } from '@/lib/api/ai';
    import {
        createAiGeneratedFile,
        editAiGeneratedFile,
    } from '@/lib/api/files';
    import { fetchUserTeams } from '@/lib/api/teams';
    import {
        MAX_CHAT_IMAGE_SIZE_BYTES,
        isSafeHttpUrl,
        validateUploadFile,
    } from '@/lib/security';
    import {
        initializeWorkspaceTeam,
        setWorkspaceTeam,
        workspaceState,
    } from '@/lib/workspace.svelte';
    import { workspaceAi } from '@/lib/appRoutes';
    import type {
        AiChatSummary,
        AiHistoryMessage,
        BreadcrumbItem,
        TeamSummary,
    } from '@/types';

    type PromptMode = 'chat' | 'websearch' | 'create-file' | 'edit-file';
    type UiHistoryEntry = AiHistoryMessage & {
        createdAtLabel: string | null;
        safeAttachmentUrl: string | null;
    };

    const BLOCKED_IMAGE_MIME_TYPES = ['image/svg+xml'];
    const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'AI Assistant',
            href: workspaceAi(),
        },
    ];

    const workspace = workspaceState();

    let teams = $state<TeamSummary[]>([]);
    let selectedTeamId = $state<number | null>(workspace.selectedTeamId);

    let chats = $state<AiChatSummary[]>([]);
    let selectedChatId = $state<number | null>(null);
    let history = $state<AiHistoryMessage[]>([]);

    let loading = $state(true);
    let loadingHistory = $state(false);
    let busyAction = $state<
        | ''
        | 'create-chat'
        | 'rename-chat'
        | 'delete-chat'
        | 'send-prompt'
        | 'refresh-history'
    >('');

    let promptMode = $state<PromptMode>('chat');
    let prompt = $state('');
    let selectedImage = $state<File | null>(null);

    let newChatName = $state('');
    let renameChatName = $state('');
    let fileCreatePath = $state('/');
    let editFilePath = $state('/');

    let error = $state('');
    let success = $state('');

    let imageInput = $state<HTMLInputElement | null>(null);

    const maxVisibleHistory = 120;
    let showAllHistory = $state(false);

    const activeChat = $derived(
        chats.find((chat) => chat.id === selectedChatId) ?? null,
    );

    const historyEntries = $derived.by((): UiHistoryEntry[] =>
        history.map((item) => {
            const createdAtMs = item.createdAt
                ? Date.parse(item.createdAt)
                : Number.NaN;
            const safeAttachmentUrl =
                item.imageUrl && isSafeHttpUrl(item.imageUrl)
                    ? item.imageUrl
                    : null;

            return {
                ...item,
                createdAtLabel: Number.isNaN(createdAtMs)
                    ? null
                    : dateTimeFormatter.format(createdAtMs),
                safeAttachmentUrl,
            };
        }),
    );

    const visibleHistoryEntries = $derived.by(() => {
        if (showAllHistory) return historyEntries;
        if (historyEntries.length <= maxVisibleHistory) return historyEntries;
        return historyEntries.slice(-maxVisibleHistory);
    });

    const hiddenHistoryCount = $derived.by(() =>
        Math.max(historyEntries.length - visibleHistoryEntries.length, 0),
    );

    const clearNotices = () => {
        error = '';
        success = '';
    };

    const getErrorMessage = (err: unknown): string => {
        if (err instanceof Error) {
            return err.message;
        }

        return 'Request failed.';
    };

    const resetPromptInput = () => {
        prompt = '';
        selectedImage = null;
        if (imageInput) {
            imageInput.value = '';
        }
    };

    const loadHistory = async (chatId: number) => {
        loadingHistory = true;
        clearNotices();

        try {
            history = await fetchAiHistory(chatId);
        } catch (err) {
            history = [];
            error = getErrorMessage(err);
        } finally {
            loadingHistory = false;
        }
    };

    const loadChats = async (teamId: number) => {
        clearNotices();

        try {
            chats = await fetchAiChats(teamId);
            if (chats.length === 0) {
                selectedChatId = null;
                renameChatName = '';
                history = [];
                return;
            }

            const persisted = chats.find((chat) => chat.id === selectedChatId);
            selectedChatId = persisted ? persisted.id : chats[0].id;
            renameChatName =
                chats.find((chat) => chat.id === selectedChatId)?.name ?? '';

            await loadHistory(selectedChatId);
        } catch (err) {
            chats = [];
            selectedChatId = null;
            renameChatName = '';
            history = [];
            error = getErrorMessage(err);
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

            if (selectedTeamId) {
                await loadChats(selectedTeamId);
            }
        } catch (err) {
            teams = [];
            selectedTeamId = null;
            chats = [];
            history = [];
            selectedChatId = null;
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

        chats = [];
        selectedChatId = null;
        history = [];
        showAllHistory = false;

        if (!selectedTeamId) {
            return;
        }

        await loadChats(selectedTeamId);
    };

    const selectChat = async (chatId: number) => {
        if (selectedChatId === chatId) {
            return;
        }

        selectedChatId = chatId;
        renameChatName = chats.find((chat) => chat.id === chatId)?.name ?? '';
        showAllHistory = false;
        await loadHistory(chatId);
    };

    const createNewChat = async () => {
        clearNotices();
        if (!selectedTeamId) {
            error = 'Select a team first.';
            return;
        }

        if (!newChatName.trim()) {
            error = 'Chat name is required.';
            return;
        }

        busyAction = 'create-chat';
        try {
            const created = await createAiChat(
                selectedTeamId,
                newChatName.trim(),
            );
            newChatName = '';

            if (created) {
                chats = [...chats, created].sort((a, b) =>
                    a.name.localeCompare(b.name),
                );
                selectedChatId = created.id;
                renameChatName = created.name;
                history = [];
                success = 'AI chat created.';
            } else {
                await loadChats(selectedTeamId);
                success = 'AI chat created.';
            }
        } catch (err) {
            error = getErrorMessage(err);
        } finally {
            busyAction = '';
        }
    };

    const renameCurrentChat = async () => {
        clearNotices();
        if (!selectedChatId) {
            error = 'Select a chat first.';
            return;
        }

        if (!renameChatName.trim()) {
            error = 'New chat name is required.';
            return;
        }

        busyAction = 'rename-chat';
        try {
            const updated = await renameAiChat(
                selectedChatId,
                renameChatName.trim(),
            );
            const fallbackName = renameChatName.trim();

            chats = chats.map((chat) =>
                chat.id === selectedChatId
                    ? {
                          ...chat,
                          name: updated?.name ?? fallbackName,
                      }
                    : chat,
            );

            success = 'AI chat renamed.';
        } catch (err) {
            error = getErrorMessage(err);
        } finally {
            busyAction = '';
        }
    };

    const deleteCurrentChat = async () => {
        clearNotices();
        if (!selectedChatId) {
            error = 'Select a chat first.';
            return;
        }

        const confirmed = window.confirm('Delete this AI chat?');
        if (!confirmed) {
            return;
        }

        busyAction = 'delete-chat';
        try {
            const chatId = selectedChatId;
            await deleteAiChat(chatId);
            chats = chats.filter((chat) => chat.id !== chatId);

            if (chats.length === 0) {
                selectedChatId = null;
                history = [];
                renameChatName = '';
            } else {
                selectedChatId = chats[0].id;
                renameChatName = chats[0].name;
                await loadHistory(chats[0].id);
            }

            success = 'AI chat deleted.';
        } catch (err) {
            error = getErrorMessage(err);
        } finally {
            busyAction = '';
        }
    };

    const ensureChat = async (): Promise<number | null> => {
        if (selectedChatId) {
            return selectedChatId;
        }

        if (!selectedTeamId) {
            return null;
        }

        const created = await createAiChat(selectedTeamId, 'New AI Chat');
        if (!created) {
            return null;
        }

        chats = [...chats, created].sort((a, b) =>
            a.name.localeCompare(b.name),
        );
        selectedChatId = created.id;
        renameChatName = created.name;
        return created.id;
    };

    const onImageSelect = (event: Event) => {
        const target = event.currentTarget as HTMLInputElement;
        const file = target.files?.[0] ?? null;

        if (!file) {
            selectedImage = null;
            return;
        }

        const validationError = validateUploadFile(
            file,
            MAX_CHAT_IMAGE_SIZE_BYTES,
            ['image/'],
            BLOCKED_IMAGE_MIME_TYPES,
        );

        if (validationError) {
            error = validationError;
            target.value = '';
            selectedImage = null;
            return;
        }

        selectedImage = file;
        clearNotices();
    };

    const sendPromptAction = async () => {
        clearNotices();
        const promptText = prompt.trim();

        if (!promptText) {
            error = 'Prompt is required.';
            return;
        }

        if (!selectedTeamId) {
            error = 'Select a team first.';
            return;
        }

        busyAction = 'send-prompt';

        try {
            if (promptMode === 'create-file') {
                const filename = await createAiGeneratedFile(
                    selectedTeamId,
                    promptText,
                    fileCreatePath,
                );

                success = filename
                    ? `AI created file: ${filename}`
                    : 'AI file request completed.';
                resetPromptInput();
                return;
            }

            if (promptMode === 'edit-file') {
                await editAiGeneratedFile(
                    selectedTeamId,
                    editFilePath,
                    promptText,
                );
                success = 'AI file edit request completed.';
                resetPromptInput();
                return;
            }

            const chatId = await ensureChat();
            if (!chatId) {
                error = 'Unable to create or select an AI chat.';
                return;
            }

            const response =
                promptMode === 'websearch'
                    ? await webSearchAi(chatId, promptText)
                    : await sendAiPrompt(chatId, promptText, selectedImage);

            if (response) {
                history = [...history, response];
                success =
                    promptMode === 'websearch'
                        ? 'Web search response received.'
                        : 'AI response received.';
            } else {
                await loadHistory(chatId);
            }

            resetPromptInput();
        } catch (err) {
            error = getErrorMessage(err);
        } finally {
            busyAction = '';
        }
    };

    const refreshHistory = async () => {
        clearNotices();
        if (!selectedChatId) {
            error = 'Select a chat first.';
            return;
        }

        busyAction = 'refresh-history';
        await loadHistory(selectedChatId);
        busyAction = '';
    };

    onMount(async () => {
        await loadWorkspace();
    });
</script>

<AppHead title="Workspace AI" />

<AppLayout {breadcrumbs}>
    <div
        class="fx-stagger flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
        data-test="ai-page"
    >
        <Card>
            <CardHeader>
                <CardTitle>AI Workspace Context</CardTitle>
                <CardDescription>
                    Select a team and manage AI chat sessions tied to existing
                    backend endpoints.
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

                <label class="flex flex-col gap-1 text-sm">
                    <span class="font-medium">Create AI chat</span>
                    <div class="flex gap-2">
                        <Input
                            placeholder="Chat name"
                            bind:value={newChatName}
                        />
                        <Button
                            variant="outline"
                            disabled={busyAction === 'create-chat' ||
                                !selectedTeamId}
                            onClick={createNewChat}
                        >
                            {busyAction === 'create-chat'
                                ? 'Creating...'
                                : 'Create'}
                        </Button>
                    </div>
                </label>

                <div class="rounded-md border bg-muted/30 p-3 text-sm">
                    <p>
                        <span class="font-semibold">Chats:</span>
                        {chats.length}
                    </p>
                    <p>
                        <span class="font-semibold">Selected:</span>
                        {activeChat?.name || 'None'}
                    </p>
                </div>
            </CardContent>
        </Card>

        {#if error}
            <p class="text-sm text-red-600">{error}</p>
        {/if}

        {#if success}
            <p class="text-sm text-emerald-600">{success}</p>
        {/if}

        <div class="grid flex-1 gap-4 xl:grid-cols-[300px_1fr]">
            <Card>
                <CardHeader>
                    <CardTitle>AI Chats</CardTitle>
                    <CardDescription>Select a session.</CardDescription>
                </CardHeader>
                <CardContent class="space-y-3 text-sm">
                    {#if chats.length === 0}
                        <p class="text-muted-foreground">No AI chats yet.</p>
                    {:else}
                        {#each chats as chat (chat.id)}
                            <button
                                type="button"
                                class="w-full rounded-md border p-2 text-left {selectedChatId ===
                                chat.id
                                    ? 'border-primary bg-primary/5'
                                    : ''}"
                                onclick={() => selectChat(chat.id)}
                            >
                                {chat.name}
                            </button>
                        {/each}
                    {/if}

                    <label class="flex flex-col gap-1">
                        <span class="font-medium">Rename selected chat</span>
                        <div class="flex gap-2">
                            <Input
                                bind:value={renameChatName}
                                disabled={!selectedChatId}
                            />
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={!selectedChatId ||
                                    busyAction === 'rename-chat'}
                                onClick={renameCurrentChat}
                            >
                                Save
                            </Button>
                        </div>
                    </label>

                    <Button
                        variant="destructive"
                        disabled={!selectedChatId ||
                            busyAction === 'delete-chat'}
                        onClick={deleteCurrentChat}
                    >
                        {busyAction === 'delete-chat'
                            ? 'Deleting...'
                            : 'Delete chat'}
                    </Button>
                </CardContent>
            </Card>

            <Card class="flex min-h-[420px] flex-1 flex-col">
                <CardHeader>
                    <CardTitle>Conversation</CardTitle>
                    <CardDescription>
                        {#if activeChat}
                            {activeChat.name}
                        {:else}
                            Create or select a chat to start.
                        {/if}
                    </CardDescription>
                </CardHeader>
                <CardContent class="flex flex-1 flex-col gap-3">
                    <div class="flex gap-2">
                        <Button
                            size="sm"
                            variant={promptMode === 'chat'
                                ? 'default'
                                : 'outline'}
                            onClick={() => {
                                promptMode = 'chat';
                            }}
                        >
                            Chat
                        </Button>
                        <Button
                            size="sm"
                            variant={promptMode === 'websearch'
                                ? 'default'
                                : 'outline'}
                            onClick={() => {
                                promptMode = 'websearch';
                            }}
                        >
                            Web Search
                        </Button>
                        <Button
                            size="sm"
                            variant={promptMode === 'create-file'
                                ? 'default'
                                : 'outline'}
                            onClick={() => {
                                promptMode = 'create-file';
                            }}
                        >
                            AI File Create
                        </Button>
                        <Button
                            size="sm"
                            variant={promptMode === 'edit-file'
                                ? 'default'
                                : 'outline'}
                            onClick={() => {
                                promptMode = 'edit-file';
                            }}
                        >
                            AI File Edit
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={!selectedChatId ||
                                busyAction === 'refresh-history'}
                            onClick={refreshHistory}
                        >
                            {busyAction === 'refresh-history'
                                ? 'Refreshing...'
                                : 'Refresh'}
                        </Button>
                    </div>

                    {#if promptMode === 'create-file'}
                        <label class="flex flex-col gap-1 text-sm">
                            <span class="font-medium"
                                >Target path for generated file</span
                            >
                            <Input
                                bind:value={fileCreatePath}
                                placeholder="/"
                            />
                        </label>
                    {:else if promptMode === 'edit-file'}
                        <label class="flex flex-col gap-1 text-sm">
                            <span class="font-medium"
                                >Target file path to edit</span
                            >
                            <Input bind:value={editFilePath} placeholder="/" />
                        </label>
                    {/if}

                    <div
                        class="flex-1 space-y-3 overflow-y-auto rounded-md border p-3"
                    >
                        {#if loadingHistory}
                            <p class="text-sm text-muted-foreground">
                                Loading history...
                            </p>
                        {:else if historyEntries.length === 0}
                            <p class="text-sm text-muted-foreground">
                                No history yet.
                            </p>
                        {:else}
                            {#if hiddenHistoryCount > 0}
                                <div class="flex justify-center">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            showAllHistory = true;
                                        }}
                                    >
                                        Show {hiddenHistoryCount} earlier
                                        {hiddenHistoryCount === 1
                                            ? ' entry'
                                            : ' entries'}
                                    </Button>
                                </div>
                            {:else if showAllHistory &&
                            historyEntries.length > maxVisibleHistory}
                                <div class="flex justify-center">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            showAllHistory = false;
                                        }}
                                    >
                                        Show recent entries only
                                    </Button>
                                </div>
                            {/if}

                            {#each visibleHistoryEntries as item (item.id)}
                                <div
                                    class="space-y-2 rounded-md border p-3 text-sm"
                                >
                                    <div
                                        class="flex flex-wrap items-center gap-2"
                                    >
                                        <Badge variant="outline">User</Badge>
                                        <span class="font-medium"
                                            >{item.userName}</span
                                        >
                                        {#if item.createdAtLabel}
                                            <span
                                                class="text-xs text-muted-foreground"
                                            >
                                                {item.createdAtLabel}
                                            </span>
                                        {/if}
                                    </div>
                                    <p class="whitespace-pre-wrap break-words">
                                        {item.prompt}
                                    </p>

                                    {#if item.safeAttachmentUrl}
                                        <a
                                            href={item.safeAttachmentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            referrerpolicy="no-referrer"
                                            class="text-xs text-blue-600 underline"
                                        >
                                            Open image attachment
                                        </a>
                                    {:else if item.imageUrl}
                                        <p class="text-xs text-amber-600">
                                            Attachment blocked because the URL
                                            is unsafe.
                                        </p>
                                    {/if}

                                    <div class="mt-3 border-t pt-2">
                                        <div
                                            class="mb-1 flex items-center gap-2"
                                        >
                                            <Badge>AI</Badge>
                                        </div>
                                        <p
                                            class="whitespace-pre-wrap break-words"
                                        >
                                            {item.response}
                                        </p>
                                    </div>
                                </div>
                            {/each}
                        {/if}
                    </div>

                    <div class="space-y-2 rounded-md border p-3">
                        <textarea
                            class="fx-input min-h-[92px] w-full rounded-md border border-input bg-background p-2 text-sm"
                            bind:value={prompt}
                            placeholder={promptMode === 'create-file'
                                ? 'Describe the file to generate...'
                                : promptMode === 'edit-file'
                                  ? 'Describe the file edits to apply...'
                                  : 'Ask AI anything...'}
                        ></textarea>

                        <div class="flex flex-wrap items-center gap-2">
                            <input
                                bind:this={imageInput}
                                type="file"
                                class="hidden"
                                accept="image/*"
                                onchange={onImageSelect}
                            />
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={promptMode !== 'chat'}
                                onClick={() => imageInput?.click()}
                            >
                                Attach image
                            </Button>

                            <Button
                                size="sm"
                                disabled={busyAction === 'send-prompt'}
                                onClick={sendPromptAction}
                            >
                                {busyAction === 'send-prompt'
                                    ? 'Sending...'
                                    : 'Submit'}
                            </Button>

                            {#if selectedImage}
                                <span class="text-xs text-muted-foreground">
                                    Attached: {selectedImage.name}
                                </span>
                            {/if}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
</AppLayout>
