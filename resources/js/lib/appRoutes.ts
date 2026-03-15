import {
    queryParams,
    type RouteDefinition,
    type RouteQueryOptions,
} from '@/wayfinder';

const makeGet =
    (path: string) =>
    (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
        url: `${path}${queryParams(options)}`,
        method: 'get',
    });

export const home = makeGet('/');
export const dashboard = makeGet('/dashboard');

export const workspaceTeams = makeGet('/workspace/teams');
export const workspaceTasks = makeGet('/workspace/tasks');
export const workspaceCalendar = makeGet('/workspace/calendar');
export const workspaceChat = makeGet('/workspace/chat');
export const workspaceFiles = makeGet('/workspace/files');
export const workspaceAi = makeGet('/workspace/ai');

export const profileEdit = makeGet('/settings/profile');
export const passwordEdit = makeGet('/settings/password');
export const appearanceEdit = makeGet('/settings/appearance');
export const twoFactorShow = makeGet('/settings/two-factor');
