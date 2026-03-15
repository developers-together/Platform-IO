import { apiRequest } from '@/lib/api/client';
import { isRecord, toNumber, toStringValue } from '@/lib/api/guards';
import type { AiChatSummary, AiHistoryMessage } from '@/types/domain';

function toAiChat(value: unknown): AiChatSummary | null {
    if (!isRecord(value)) {
        return null;
    }

    const id = toNumber(value.id);
    if (!id) {
        return null;
    }

    return {
        id,
        name: toStringValue(value.name, `AI Chat ${id}`),
    };
}

function toAiHistoryMessage(value: unknown): AiHistoryMessage | null {
    if (!isRecord(value)) {
        return null;
    }

    const id = toNumber(value.id);
    if (!id) {
        return null;
    }

    let userName = 'User';
    if (isRecord(value.user) && typeof value.user.name === 'string') {
        userName = value.user.name;
    } else if (typeof value.user_name === 'string') {
        userName = value.user_name;
    }

    return {
        id,
        prompt: toStringValue(value.prompt, ''),
        response: toStringValue(value.response, ''),
        userName,
        imageUrl:
            typeof value.image_url === 'string' && value.image_url.length > 0
                ? value.image_url
                : null,
        createdAt:
            typeof value.created_at === 'string' ? value.created_at : null,
    };
}

export async function fetchAiChats(teamId: number): Promise<AiChatSummary[]> {
    const response = await apiRequest<unknown>(`/api/ai_chats/${teamId}/index`);

    if (!Array.isArray(response)) {
        return [];
    }

    return response
        .map((item) => toAiChat(item))
        .filter((item): item is AiChatSummary => item !== null);
}

export async function createAiChat(
    teamId: number,
    name: string,
): Promise<AiChatSummary | null> {
    const response = await apiRequest<unknown>(
        `/api/ai_chats/${teamId}/store`,
        {
            method: 'POST',
            body: { name },
        },
    );

    return toAiChat(response);
}

export async function renameAiChat(
    chatId: number,
    name: string,
): Promise<AiChatSummary | null> {
    const response = await apiRequest<unknown>(
        `/api/ai_chats/${chatId}/update`,
        {
            method: 'PUT',
            body: { name },
        },
    );

    if (isRecord(response) && response.ai_chat) {
        return toAiChat(response.ai_chat);
    }

    return toAiChat(response);
}

export async function deleteAiChat(chatId: number): Promise<boolean> {
    const response = await apiRequest<unknown>(`/api/ai_chats/${chatId}`, {
        method: 'DELETE',
    });

    if (isRecord(response) && typeof response.success === 'boolean') {
        return response.success;
    }

    return true;
}

export async function fetchAiHistory(
    chatId: number,
): Promise<AiHistoryMessage[]> {
    const response = await apiRequest<unknown>(
        `/api/ai_chats/${chatId}/history`,
    );

    if (!Array.isArray(response)) {
        return [];
    }

    return response
        .map((item) => toAiHistoryMessage(item))
        .filter((item): item is AiHistoryMessage => item !== null);
}

export async function sendAiPrompt(
    chatId: number,
    prompt: string,
    image: File | null = null,
): Promise<AiHistoryMessage | null> {
    const formData = new FormData();
    formData.append('prompt', prompt);

    if (image) {
        formData.append('image', image);
    }

    const response = await apiRequest<unknown>(`/api/ai_chats/${chatId}/send`, {
        method: 'POST',
        body: formData,
    });

    return toAiHistoryMessage(response);
}

export async function webSearchAi(
    chatId: number,
    prompt: string,
): Promise<AiHistoryMessage | null> {
    const response = await apiRequest<unknown>(
        `/api/ai_chats/${chatId}/websearch`,
        {
            method: 'POST',
            body: { prompt },
        },
    );

    return toAiHistoryMessage(response);
}
