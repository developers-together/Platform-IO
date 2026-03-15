export type TeamSummary = {
    id: number;
    name: string;
    projectName: string;
    description: string;
    code: string | null;
};

export type TaskSummary = {
    id: number;
    title: string;
    description: string;
    completed: boolean;
    starred: boolean;
    startAt: string | null;
    endAt: string | null;
    createdAt: string | null;
};

export type TaskSuggestion = {
    id: number | null;
    title: string;
    description: string;
};

export type TaskUpdatePayload = {
    title: string;
    description: string;
    completed: boolean;
    stared: boolean;
    start: string | null;
    end: string | null;
    category: string;
};

export type ChatChannelSummary = {
    id: number;
    name: string;
};

export type ChatMessage = {
    id: number;
    chatId: number | null;
    userId: number | null;
    userName: string;
    message: string;
    imageUrl: string | null;
    replyTo: number | null;
    createdAt: string | null;
    isAi: boolean;
};

export type ChatSendPayload = {
    message: string;
    image?: File | null;
    replyTo?: number | null;
};

export type WorkspaceEntryType = 'folder' | 'file';

export type WorkspaceEntry = {
    path: string;
    name: string;
    type: WorkspaceEntryType;
    extension: string | null;
};

export type AiChatSummary = {
    id: number;
    name: string;
};

export type AiHistoryMessage = {
    id: number;
    prompt: string;
    response: string;
    userName: string;
    imageUrl: string | null;
    createdAt: string | null;
};
