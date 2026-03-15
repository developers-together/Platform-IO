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
        askChatAi,
        createChat,
        deleteChat,
        deleteChatMessage,
        fetchChatMessages,
        fetchTeamChats,
        renameChat,
        sendChatMessage,
    } from '@/lib/api/chats';
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
    import { workspaceChat } from '@/lib/appRoutes';
    import type {
        BreadcrumbItem,
        ChatChannelSummary,
        ChatMessage,
        TeamSummary,
    } from '@/types';

    type UiChatMessage = ChatMessage & {
        createdAtMs: number;
        createdAtLabel: string | null;
        safeAttachmentUrl: string | null;
    };

    const BLOCKED_IMAGE_MIME_TYPES = ['image/svg+xml'];
    const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Chat',
            href: workspaceChat(),
        },
    ];

    const workspace = workspaceState();

    let teams = $state<TeamSummary[]>([]);
    let selectedTeamId = $state<number | null>(workspace.selectedTeamId);

    let channels = $state<ChatChannelSummary[]>([]);
    let selectedChannelId = $state<number | null>(null);
    let messages = $state<ChatMessage[]>([]);

    let loadingWorkspace = $state(true);
    let loadingMessages = $state(false);
    let busyAction = $state<
        | ''
        | 'create-channel'
        | 'rename-channel'
        | 'delete-channel'
        | 'send-message'
        | 'ask-ai'
        | `delete-message-${number}`
    >('');

    let error = $state('');
    let success = $state('');

    let newChannelName = $state('');
    let renameChannelName = $state('');
    let messageText = $state('');

    let selectedImage = $state<File | null>(null);
    let replyToMessageId = $state<number | null>(null);

    const maxVisibleMessages = 120;
    let showAllMessages = $state(false);

    let fileInput = $state<HTMLInputElement | null>(null);

    const activeChannel = $derived(
        channels.find((channel) => channel.id === selectedChannelId) ?? null,
    );

    const replyTarget = $derived(
        messages.find((message) => message.id === replyToMessageId) ?? null,
    );

    const orderedMessages = $derived.by((): UiChatMessage[] =>
        [...messages]
            .map((message) => {
                const createdAtMsRaw = message.createdAt
                    ? Date.parse(message.createdAt)
                    : Number.NaN;
                const createdAtMs = Number.isNaN(createdAtMsRaw)
                    ? 0
                    : createdAtMsRaw;
                const safeAttachmentUrl =
                    message.imageUrl && isSafeHttpUrl(message.imageUrl)
                        ? message.imageUrl
                        : null;

                return {
                    ...message,
                    createdAtMs,
                    createdAtLabel: Number.isNaN(createdAtMsRaw)
                        ? null
                        : dateTimeFormatter.format(createdAtMs),
                    safeAttachmentUrl,
                };
            })
            .sort((a, b) => {
                if (a.createdAtMs === b.createdAtMs) {
                    return a.id - b.id;
                }

                return a.createdAtMs - b.createdAtMs;
            }),
    );

    const visibleMessages = $derived.by(() => {
        if (showAllMessages) return orderedMessages;
        if (orderedMessages.length <= maxVisibleMessages) return orderedMessages;
        return orderedMessages.slice(-maxVisibleMessages);
    });

    const hiddenMessageCount = $derived.by(() =>
        Math.max(orderedMessages.length - visibleMessages.length, 0),
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

    const resetComposer = () => {
        messageText = '';
        selectedImage = null;
        replyToMessageId = null;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const loadMessages = async (channelId: number) => {
        loadingMessages = true;
        clearNotices();

        try {
            messages = await fetchChatMessages(channelId);
        } catch (err) {
            messages = [];
            error = getErrorMessage(err);
        } finally {
            loadingMessages = false;
        }
    };

    const loadChannels = async (teamId: number) => {
        clearNotices();

        try {
            channels = await fetchTeamChats(teamId);
            if (channels.length === 0) {
                selectedChannelId = null;
                messages = [];
                return;
            }

            const persisted = channels.find(
                (channel) => channel.id === selectedChannelId,
            );
            selectedChannelId = persisted ? persisted.id : channels[0].id;
            renameChannelName =
                channels.find((channel) => channel.id === selectedChannelId)
                    ?.name ?? '';

            await loadMessages(selectedChannelId);
        } catch (err) {
            channels = [];
            selectedChannelId = null;
            messages = [];
            error = getErrorMessage(err);
        }
    };

    const loadWorkspace = async () => {
        loadingWorkspace = true;
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
                await loadChannels(selectedTeamId);
            } else {
                channels = [];
                messages = [];
                selectedChannelId = null;
            }
        } catch (err) {
            teams = [];
            selectedTeamId = null;
            channels = [];
            messages = [];
            selectedChannelId = null;
            error = getErrorMessage(err);
        } finally {
            loadingWorkspace = false;
        }
    };

    const selectTeam = async (event: Event) => {
        const target = event.currentTarget as HTMLSelectElement;
        const value = Number(target.value);

        selectedTeamId = Number.isFinite(value) && value > 0 ? value : null;
        setWorkspaceTeam(selectedTeamId);

        selectedChannelId = null;
        channels = [];
        messages = [];
        showAllMessages = false;

        if (!selectedTeamId) {
            return;
        }

        await loadChannels(selectedTeamId);
    };

    const selectChannel = async (channelId: number) => {
        if (selectedChannelId === channelId) {
            return;
        }

        selectedChannelId = channelId;
        renameChannelName =
            channels.find((channel) => channel.id === channelId)?.name ?? '';
        showAllMessages = false;
        await loadMessages(channelId);
    };

    const createNewChannel = async () => {
        clearNotices();
        if (!selectedTeamId) {
            error = 'Select a team first.';
            return;
        }

        if (!newChannelName.trim()) {
            error = 'Channel name is required.';
            return;
        }

        busyAction = 'create-channel';
        try {
            const created = await createChat(
                selectedTeamId,
                newChannelName.trim(),
            );
            newChannelName = '';

            if (created) {
                channels = [...channels, created].sort((a, b) =>
                    a.name.localeCompare(b.name),
                );
                selectedChannelId = created.id;
                renameChannelName = created.name;
                messages = [];
                success = 'Channel created.';
                await loadMessages(created.id);
            } else {
                await loadChannels(selectedTeamId);
                success = 'Channel created.';
            }
        } catch (err) {
            error = getErrorMessage(err);
        } finally {
            busyAction = '';
        }
    };

    const renameActiveChannel = async () => {
        clearNotices();
        if (!selectedChannelId) {
            error = 'Select a channel first.';
            return;
        }

        if (!renameChannelName.trim()) {
            error = 'New channel name is required.';
            return;
        }

        busyAction = 'rename-channel';
        try {
            const updated = await renameChat(
                selectedChannelId,
                renameChannelName.trim(),
            );

            const fallbackName = renameChannelName.trim();
            channels = channels.map((channel) =>
                channel.id === selectedChannelId
                    ? {
                          ...channel,
                          name: updated?.name ?? fallbackName,
                      }
                    : channel,
            );
            success = 'Channel renamed.';
        } catch (err) {
            error = getErrorMessage(err);
        } finally {
            busyAction = '';
        }
    };

    const removeActiveChannel = async () => {
        clearNotices();
        if (!selectedChannelId) {
            error = 'Select a channel first.';
            return;
        }

        const confirmed = window.confirm(
            'Delete this channel and all its messages?',
        );
        if (!confirmed) {
            return;
        }

        busyAction = 'delete-channel';
        try {
            const channelId = selectedChannelId;
            await deleteChat(channelId);
            channels = channels.filter((channel) => channel.id !== channelId);

            if (channels.length === 0) {
                selectedChannelId = null;
                messages = [];
            } else {
                selectedChannelId = channels[0].id;
                renameChannelName = channels[0].name;
                await loadMessages(channels[0].id);
            }

            success = 'Channel deleted.';
        } catch (err) {
            error = getErrorMessage(err);
        } finally {
            busyAction = '';
        }
    };

    const onFileChange = (event: Event) => {
        const target = event.currentTarget as HTMLInputElement;
        const file = target.files?.[0] ?? null;

        if (!file) {
            selectedImage = null;
            return;
        }

        const fileError = validateUploadFile(
            file,
            MAX_CHAT_IMAGE_SIZE_BYTES,
            ['image/'],
            BLOCKED_IMAGE_MIME_TYPES,
        );
        if (fileError) {
            error = fileError;
            target.value = '';
            selectedImage = null;
            return;
        }

        selectedImage = file;
        clearNotices();
    };

    const sendMessage = async () => {
        clearNotices();
        if (!selectedChannelId) {
            error = 'Select a channel first.';
            return;
        }

        if (!messageText.trim() && !selectedImage) {
            error = 'Write a message or attach an image.';
            return;
        }

        busyAction = 'send-message';
        try {
            const created = await sendChatMessage(selectedChannelId, {
                message: messageText.trim(),
                image: selectedImage,
                replyTo: replyToMessageId,
            });

            if (created) {
                messages = [...messages, created];
                success = 'Message sent.';
            } else {
                await loadMessages(selectedChannelId);
            }

            resetComposer();
        } catch (err) {
            error = getErrorMessage(err);
        } finally {
            busyAction = '';
        }
    };

    const askAiInChannel = async () => {
        clearNotices();
        if (!selectedChannelId) {
            error = 'Select a channel first.';
            return;
        }

        const prompt = messageText.trim();
        if (!prompt) {
            error = 'Type a prompt for AI.';
            return;
        }

        busyAction = 'ask-ai';
        try {
            const aiMessage = await askChatAi(selectedChannelId, prompt);
            if (aiMessage) {
                messages = [...messages, aiMessage];
            } else {
                await loadMessages(selectedChannelId);
            }

            messageText = '';
            replyToMessageId = null;
            success = 'AI response added.';
        } catch (err) {
            error = getErrorMessage(err);
        } finally {
            busyAction = '';
        }
    };

    const removeMessage = async (messageId: number) => {
        clearNotices();
        const confirmed = window.confirm('Delete this message?');
        if (!confirmed) {
            return;
        }

        busyAction = `delete-message-${messageId}`;
        try {
            await deleteChatMessage(messageId);
            messages = messages.filter((message) => message.id !== messageId);
            success = 'Message deleted.';
        } catch (err) {
            error = getErrorMessage(err);
        } finally {
            busyAction = '';
        }
    };

    onMount(async () => {
        await loadWorkspace();
    });
</script>

<AppHead title="Workspace Chat" />

<AppLayout {breadcrumbs}>
    <div
        class="fx-stagger flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
        data-test="chat-page"
    >
        <Card>
            <CardHeader>
                <CardTitle>Team and Channel Context</CardTitle>
                <CardDescription>
                    Select a team, then manage channels before messaging.
                </CardDescription>
            </CardHeader>
            <CardContent class="grid gap-4 lg:grid-cols-3">
                <label class="flex flex-col gap-1 text-sm lg:col-span-1">
                    <span class="font-medium">Team</span>
                    <select
                        class="fx-input h-10 rounded-md border border-input bg-background px-3"
                        disabled={loadingWorkspace || teams.length === 0}
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

                <label class="flex flex-col gap-1 text-sm lg:col-span-1">
                    <span class="font-medium">Channel</span>
                    <select
                        class="fx-input h-10 rounded-md border border-input bg-background px-3"
                        disabled={channels.length === 0}
                        value={selectedChannelId ?? ''}
                        onchange={(event) => {
                            const target =
                                event.currentTarget as HTMLSelectElement;
                            const id = Number(target.value);
                            if (Number.isFinite(id) && id > 0) {
                                selectChannel(id);
                            }
                        }}
                    >
                        {#if channels.length === 0}
                            <option value="">No channels yet</option>
                        {:else}
                            {#each channels as channel (channel.id)}
                                <option value={channel.id}
                                    >{channel.name}</option
                                >
                            {/each}
                        {/if}
                    </select>
                </label>

                <div class="space-y-2 lg:col-span-1">
                    <label class="flex flex-col gap-1 text-sm">
                        <span class="font-medium">Create channel</span>
                        <div class="flex gap-2">
                            <Input
                                placeholder="New channel name"
                                bind:value={newChannelName}
                                class="flex-1"
                            />
                            <Button
                                variant="outline"
                                disabled={busyAction === 'create-channel' ||
                                    !selectedTeamId}
                                onClick={createNewChannel}
                            >
                                {busyAction === 'create-channel'
                                    ? 'Creating...'
                                    : 'Create'}
                            </Button>
                        </div>
                    </label>
                </div>

                <label class="flex flex-col gap-1 text-sm lg:col-span-2">
                    <span class="font-medium">Rename active channel</span>
                    <div class="flex gap-2">
                        <Input
                            placeholder="Updated channel name"
                            bind:value={renameChannelName}
                            disabled={!selectedChannelId}
                            class="flex-1"
                        />
                        <Button
                            variant="outline"
                            disabled={!selectedChannelId ||
                                busyAction === 'rename-channel'}
                            onClick={renameActiveChannel}
                        >
                            {busyAction === 'rename-channel'
                                ? 'Saving...'
                                : 'Save'}
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={!selectedChannelId ||
                                busyAction === 'delete-channel'}
                            onClick={removeActiveChannel}
                        >
                            {busyAction === 'delete-channel'
                                ? 'Deleting...'
                                : 'Delete'}
                        </Button>
                    </div>
                </label>

                <div
                    class="rounded-md border bg-muted/30 p-3 text-sm lg:col-span-1"
                >
                    <p>
                        <span class="font-semibold">Channels:</span>
                        {channels.length}
                    </p>
                    <p>
                        <span class="font-semibold">Selected:</span>
                        {activeChannel?.name || 'None'}
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

        <Card class="flex min-h-[420px] flex-1 flex-col">
            <CardHeader>
                <CardTitle>Conversation</CardTitle>
                <CardDescription>
                    {#if activeChannel}
                        Channel: {activeChannel.name}
                    {:else}
                        Select or create a channel to start.
                    {/if}
                </CardDescription>
            </CardHeader>
            <CardContent class="flex flex-1 flex-col gap-3">
                <div
                    class="flex-1 space-y-2 overflow-y-auto rounded-md border p-3"
                >
                    {#if loadingMessages}
                        <p class="text-sm text-muted-foreground">
                            Loading messages...
                        </p>
                    {:else if orderedMessages.length === 0}
                        <p class="text-sm text-muted-foreground">
                            No messages yet.
                        </p>
                    {:else}
                        {#if hiddenMessageCount > 0}
                            <div class="flex justify-center">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        showAllMessages = true;
                                    }}
                                >
                                    Show {hiddenMessageCount} earlier
                                    {hiddenMessageCount === 1
                                        ? ' message'
                                        : ' messages'}
                                </Button>
                            </div>
                        {:else if showAllMessages &&
                        orderedMessages.length > maxVisibleMessages}
                            <div class="flex justify-center">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        showAllMessages = false;
                                    }}
                                >
                                    Show recent messages only
                                </Button>
                            </div>
                        {/if}

                        {#each visibleMessages as message (message.id)}
                            <div class="rounded-md border p-3 text-sm">
                                <div
                                    class="mb-2 flex flex-wrap items-center gap-2"
                                >
                                    <span class="font-semibold"
                                        >{message.userName}</span
                                    >
                                    {#if message.isAi}
                                        <Badge variant="secondary">AI</Badge>
                                    {/if}
                                    {#if message.createdAtLabel}
                                        <span
                                            class="text-xs text-muted-foreground"
                                        >
                                            {message.createdAtLabel}
                                        </span>
                                    {/if}
                                </div>

                                {#if message.replyTo}
                                    <p
                                        class="mb-2 text-xs text-muted-foreground"
                                    >
                                        Replying to message #{message.replyTo}
                                    </p>
                                {/if}

                                {#if message.message}
                                    <p class="whitespace-pre-wrap break-words">
                                        {message.message}
                                    </p>
                                {/if}

                                {#if message.safeAttachmentUrl}
                                    <a
                                        href={message.safeAttachmentUrl}
                                        class="mt-2 block text-xs text-blue-600 underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        referrerpolicy="no-referrer"
                                    >
                                        Open image attachment
                                    </a>
                                {:else if message.imageUrl}
                                    <p class="mt-2 text-xs text-amber-600">
                                        Attachment blocked because the URL is
                                        unsafe.
                                    </p>
                                {/if}

                                <div class="mt-3 flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            replyToMessageId = message.id;
                                        }}
                                    >
                                        Reply
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        disabled={busyAction ===
                                            `delete-message-${message.id}`}
                                        onClick={() =>
                                            removeMessage(message.id)}
                                    >
                                        {busyAction ===
                                        `delete-message-${message.id}`
                                            ? 'Deleting...'
                                            : 'Delete'}
                                    </Button>
                                </div>
                            </div>
                        {/each}
                    {/if}
                </div>

                {#if replyTarget}
                    <div class="rounded-md border bg-muted/30 p-2 text-xs">
                        Replying to <span class="font-semibold"
                            >{replyTarget.userName}</span
                        >:
                        {replyTarget.message || '[Attachment]'}
                        <button
                            type="button"
                            class="ml-2 text-red-600 underline"
                            onclick={() => {
                                replyToMessageId = null;
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                {/if}

                <div class="space-y-2 rounded-md border p-3">
                    <textarea
                        class="fx-input min-h-[88px] w-full rounded-md border border-input bg-background p-2 text-sm"
                        placeholder="Write a message..."
                        bind:value={messageText}
                        disabled={!selectedChannelId}
                    ></textarea>

                    <div class="flex flex-wrap items-center gap-2">
                        <input
                            bind:this={fileInput}
                            type="file"
                            accept="image/*"
                            class="hidden"
                            onchange={onFileChange}
                        />
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={!selectedChannelId}
                            onClick={() => fileInput?.click()}
                        >
                            Attach image
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            disabled={busyAction === 'ask-ai' ||
                                !selectedChannelId}
                            onClick={askAiInChannel}
                        >
                            {busyAction === 'ask-ai' ? 'Thinking...' : 'Ask AI'}
                        </Button>

                        <Button
                            size="sm"
                            disabled={busyAction === 'send-message' ||
                                !selectedChannelId}
                            onClick={sendMessage}
                        >
                            {busyAction === 'send-message'
                                ? 'Sending...'
                                : 'Send'}
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
</AppLayout>
