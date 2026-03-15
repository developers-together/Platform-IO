import { apiRequest } from '@/lib/api/client';
import { isRecord, toBoolean, toNumber, toStringValue } from '@/lib/api/guards';
import type {
    ChatChannelSummary,
    ChatMessage,
    ChatSendPayload,
} from '@/types/domain';

type ChatDeleteResponse = {
    success?: boolean;
};

function toChatChannel(value: unknown): ChatChannelSummary | null {
    if (!isRecord(value)) {
        return null;
    }

    const id = toNumber(value.id);
    if (!id) {
        return null;
    }

    return {
        id,
        name: toStringValue(value.name, `Channel ${id}`),
    };
}

function toChatMessage(value: unknown): ChatMessage | null {
    if (!isRecord(value)) {
        return null;
    }

    const id = toNumber(value.id);
    if (!id) {
        return null;
    }

    return {
        id,
        chatId: toNumber(value.chat_id),
        userId: toNumber(value.user_id),
        userName: toStringValue(value.user_name ?? value.userName, 'Unknown'),
        message: toStringValue(value.message, ''),
        imageUrl:
            typeof value.image_url === 'string' && value.image_url.length > 0
                ? value.image_url
                : null,
        replyTo: toNumber(value.replyTo ?? value.reply_to),
        createdAt:
            typeof value.created_at === 'string' ? value.created_at : null,
        isAi: toBoolean(value.isAi, false),
    };
}

function extractChannels(payload: unknown): ChatChannelSummary[] {
    if (!Array.isArray(payload)) {
        return [];
    }

    return payload
        .map((item) => toChatChannel(item))
        .filter((item): item is ChatChannelSummary => item !== null);
}

function extractMessages(payload: unknown): ChatMessage[] {
    if (Array.isArray(payload)) {
        return payload
            .map((item) => toChatMessage(item))
            .filter((item): item is ChatMessage => item !== null);
    }

    if (!isRecord(payload)) {
        return [];
    }

    if (Array.isArray(payload.data)) {
        return payload.data
            .map((item) => toChatMessage(item))
            .filter((item): item is ChatMessage => item !== null);
    }

    return [];
}

export async function fetchTeamChats(
    teamId: number,
): Promise<ChatChannelSummary[]> {
    const response = await apiRequest<unknown>(`/api/chats/${teamId}/index`);
    return extractChannels(response);
}

export async function createChat(
    teamId: number,
    name: string,
): Promise<ChatChannelSummary | null> {
    const response = await apiRequest<unknown>(`/api/chats/${teamId}/store`, {
        method: 'POST',
        body: { name },
    });

    return toChatChannel(response);
}

export async function renameChat(
    chatId: number,
    name: string,
): Promise<ChatChannelSummary | null> {
    const response = await apiRequest<unknown>(`/api/chats/${chatId}`, {
        method: 'PUT',
        body: { name },
    });

    return toChatChannel(response);
}

export async function deleteChat(chatId: number): Promise<boolean> {
    const response = await apiRequest<ChatDeleteResponse>(
        `/api/chats/${chatId}`,
        {
            method: 'DELETE',
            body: { chat_id: chatId },
        },
    );

    return response.success !== false;
}

export async function fetchChatMessages(
    chatId: number,
): Promise<ChatMessage[]> {
    const response = await apiRequest<unknown>(
        `/api/chats/${chatId}/getMessages`,
    );
    return extractMessages(response);
}

export async function sendChatMessage(
    chatId: number,
    payload: ChatSendPayload,
): Promise<ChatMessage | null> {
    const formData = new FormData();
    formData.append('message', payload.message);

    if (payload.image) {
        formData.append('image', payload.image);
    }

    if (payload.replyTo) {
        formData.append('replyTo', String(payload.replyTo));
    }

    const response = await apiRequest<unknown>(
        `/api/chats/${chatId}/sendMessages`,
        {
            method: 'POST',
            body: formData,
        },
    );

    if (isRecord(response) && response.message) {
        return toChatMessage(response.message);
    }

    return toChatMessage(response);
}

export async function askChatAi(
    chatId: number,
    prompt: string,
): Promise<ChatMessage | null> {
    const response = await apiRequest<unknown>(`/api/chats/${chatId}/ask`, {
        method: 'POST',
        body: {
            prompt,
        },
    });

    if (!isRecord(response) || !Array.isArray(response.messages)) {
        return null;
    }

    const aiMessage = response.messages
        .map((item) => toChatMessage(item))
        .filter((item): item is ChatMessage => item !== null)
        .find((item) => item.isAi);

    return aiMessage ?? null;
}

export async function deleteChatMessage(messageId: number): Promise<boolean> {
    const response = await apiRequest<ChatDeleteResponse>(
        `/api/chats/${messageId}/deleteMessage`,
        {
            method: 'DELETE',
        },
    );

    return response.success !== false;
}
