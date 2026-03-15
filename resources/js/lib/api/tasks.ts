import { apiRequest } from '@/lib/api/client';
import { isRecord, toBoolean, toNumber, toStringValue } from '@/lib/api/guards';
import type {
    TaskSuggestion,
    TaskSummary,
    TaskUpdatePayload,
} from '@/types/domain';

function toTaskSummary(value: unknown): TaskSummary | null {
    if (!isRecord(value)) {
        return null;
    }

    const id = toNumber(value.id);
    if (!id) {
        return null;
    }

    return {
        id,
        title: toStringValue(value.title, 'Untitled Task'),
        description: toStringValue(value.description, ''),
        completed: toBoolean(value.completed, false),
        starred: toBoolean(value.stared ?? value.starred, false),
        startAt: value.start ? toStringValue(value.start) : null,
        endAt: value.end ? toStringValue(value.end) : null,
        createdAt: value.created_at ? toStringValue(value.created_at) : null,
    };
}

function extractTasks(payload: unknown): TaskSummary[] {
    if (Array.isArray(payload)) {
        return payload
            .map((item) => toTaskSummary(item))
            .filter((item): item is TaskSummary => item !== null);
    }

    if (!isRecord(payload)) {
        return [];
    }

    if (Array.isArray(payload.data)) {
        return payload.data
            .map((item) => toTaskSummary(item))
            .filter((item): item is TaskSummary => item !== null);
    }

    return [];
}

function toTaskSuggestion(value: unknown): TaskSuggestion | null {
    if (!isRecord(value)) {
        return null;
    }

    const title = toStringValue(value.title, '').trim();
    if (!title) {
        return null;
    }

    return {
        id: toNumber(value.id),
        title,
        description: toStringValue(value.description, ''),
    };
}

function extractTaskSuggestions(payload: unknown): TaskSuggestion[] {
    if (Array.isArray(payload)) {
        return payload
            .map((item) => toTaskSuggestion(item))
            .filter((item): item is TaskSuggestion => item !== null);
    }

    if (!isRecord(payload)) {
        return [];
    }

    if (Array.isArray(payload.data)) {
        return payload.data
            .map((item) => toTaskSuggestion(item))
            .filter((item): item is TaskSuggestion => item !== null);
    }

    return [];
}

export async function fetchTeamTasks(teamId: number): Promise<TaskSummary[]> {
    const response = await apiRequest<unknown>(`/api/tasks/${teamId}/index`);
    return extractTasks(response);
}

export async function fetchTaskSuggestions(
    teamId: number,
): Promise<TaskSuggestion[]> {
    const response = await apiRequest<unknown>(
        `/api/tasks/${teamId}/suggestions`,
    );
    return extractTaskSuggestions(response);
}

export async function updateTask(
    taskId: number,
    payload: TaskUpdatePayload,
): Promise<TaskSummary | null> {
    const response = await apiRequest<unknown>(`/api/tasks/${taskId}/update`, {
        method: 'PUT',
        body: payload,
    });

    return toTaskSummary(response);
}

export async function createTask(
    teamId: number,
    input: {
        title: string;
        description?: string;
        end?: string | null;
    },
): Promise<TaskSummary | null> {
    const now = new Date().toISOString();
    const response = await apiRequest<unknown>(`/api/tasks/${teamId}/store`, {
        method: 'POST',
        body: {
            title: input.title,
            description: input.description ?? '',
            stared: false,
            start: now,
            end: input.end ?? null,
            completed: false,
            category: 'General',
        },
    });

    return toTaskSummary(response);
}

export async function deleteTask(taskId: number): Promise<void> {
    await apiRequest<unknown>(`/api/tasks/${taskId}/delete`, {
        method: 'DELETE',
    });
}
