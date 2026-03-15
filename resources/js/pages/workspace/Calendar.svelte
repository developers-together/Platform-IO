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
    import AppLayout from '@/layouts/AppLayout.svelte';
    import { fetchTeamTasks } from '@/lib/api/tasks';
    import { fetchUserTeams } from '@/lib/api/teams';
    import {
        initializeWorkspaceTeam,
        setWorkspaceTeam,
        workspaceState,
    } from '@/lib/workspace.svelte';
    import { workspaceCalendar } from '@/lib/appRoutes';
    import type { BreadcrumbItem, TaskSummary, TeamSummary } from '@/types';

    type CalendarEvent = {
        id: number;
        title: string;
        description: string;
        day: number;
        start: string;
        end: string;
    };

    const HOUR_HEIGHT = 40;
    const TIME_COLUMN_WIDTH = 80;
    const DAY_GAP = 2;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Calendar',
            href: workspaceCalendar(),
        },
    ];

    const workspace = workspaceState();

    let teams = $state<TeamSummary[]>([]);
    let selectedTeamId = $state<number | null>(workspace.selectedTeamId);
    let tasks = $state<TaskSummary[]>([]);
    let events = $state<CalendarEvent[]>([]);

    let loading = $state(true);
    let error = $state('');

    let hoveredEventId = $state<number | null>(null);
    let hoveredDay = $state<number | null>(null);
    let selectedDay = $state<number | null>(null);
    let showTimeTooltip = $state(false);

    let currentTime = $state(new Date());
    let dayColumnWidth = $state(0);

    let gridRef = $state<HTMLDivElement | null>(null);
    let refreshTimer: ReturnType<typeof setInterval> | null = null;

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const currentDay = $derived(
        currentTime.getDay() === 0 ? 7 : currentTime.getDay(),
    );

    const title = $derived(
        selectedDay
            ? `Project Calendar - ${dayNames[selectedDay - 1]}`
            : 'Project Calendar',
    );

    const getMessage = (err: unknown): string => {
        if (err instanceof Error) return err.message;
        return 'Failed to load calendar data.';
    };

    const parseDate = (value: string | null): Date | null => {
        if (!value) return null;
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const pad2 = (value: number): string => String(value).padStart(2, '0');

    const toTimeHHMM = (date: Date): string =>
        `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;

    const extractEvents = (taskList: TaskSummary[]): CalendarEvent[] =>
        taskList.flatMap((task) => {
            const endDate = parseDate(task.endAt);
            if (!endDate) {
                return [];
            }

            const day = endDate.getDay() === 0 ? 7 : endDate.getDay();
            const startDate = parseDate(task.startAt);
            const start = startDate
                ? toTimeHHMM(startDate)
                : `${pad2(Math.max(endDate.getHours() - 1, 0))}:${pad2(endDate.getMinutes())}`;
            const end = toTimeHHMM(endDate);

            return [
                {
                    id: task.id,
                    title: task.title,
                    description: task.description || 'No description',
                    day,
                    start,
                    end,
                },
            ];
        });

    const formatHourLabel = (hour24: number): string => {
        const ampm = hour24 >= 12 ? 'PM' : 'AM';
        const hour12 = hour24 % 12 || 12;
        return `${hour12}:00 ${ampm}`;
    };

    const formatEventTime = (time: string): string => {
        const [hourString, minuteString] = time.split(':');
        const parsedHour = Number(hourString);
        if (!Number.isFinite(parsedHour)) {
            return time;
        }

        const ampm = parsedHour >= 12 ? 'PM' : 'AM';
        const hour12 = parsedHour % 12 || 12;
        return `${hour12}:${minuteString} ${ampm}`;
    };

    const calculateEventPosition = (time: string): number => {
        const [hourString, minuteString] = time.split(':');
        const hour = Number(hourString);
        const minute = Number(minuteString);

        if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
            return 0;
        }

        return ((hour * 60 + minute) / 60) * HOUR_HEIGHT;
    };

    const getCurrentPosition = (): number =>
        ((currentTime.getHours() * 60 + currentTime.getMinutes()) / 60) *
        HOUR_HEIGHT;

    const getEventState = (
        event: CalendarEvent,
    ): 'past' | 'today' | 'future' => {
        const nowMinuteOfWeek =
            (currentDay - 1) * 24 * 60 +
            currentTime.getHours() * 60 +
            currentTime.getMinutes();

        const [startHour, startMinute] = event.start.split(':').map(Number);
        const [endHour, endMinute] = event.end.split(':').map(Number);

        const eventStartMinuteOfWeek =
            (event.day - 1) * 24 * 60 +
            (startHour || 0) * 60 +
            (startMinute || 0);
        let eventEndMinuteOfWeek =
            (event.day - 1) * 24 * 60 + (endHour || 0) * 60 + (endMinute || 0);

        if (eventEndMinuteOfWeek < eventStartMinuteOfWeek) {
            eventEndMinuteOfWeek = eventStartMinuteOfWeek + 30;
        }

        if (eventEndMinuteOfWeek < nowMinuteOfWeek) {
            return 'past';
        }

        if (
            eventStartMinuteOfWeek <= nowMinuteOfWeek &&
            eventEndMinuteOfWeek >= nowMinuteOfWeek
        ) {
            return 'today';
        }

        return 'future';
    };

    const getEventsForDay = (dayNumber: number): CalendarEvent[] =>
        events.filter((event) => event.day === dayNumber);

    const updateDimensions = () => {
        if (!gridRef) {
            dayColumnWidth = 0;
            return;
        }

        const gridWidth = gridRef.offsetWidth;
        const gapsWidth = 6 * DAY_GAP;
        const availableWidth = gridWidth - TIME_COLUMN_WIDTH - gapsWidth;
        dayColumnWidth = Math.max(availableWidth / 7, 0);
    };

    const loadTasks = async () => {
        if (!selectedTeamId) {
            tasks = [];
            events = [];
            return;
        }

        loading = true;
        error = '';

        try {
            tasks = await fetchTeamTasks(selectedTeamId);
            events = extractEvents(tasks);
            updateDimensions();
        } catch (err) {
            tasks = [];
            events = [];
            error = getMessage(err);
        } finally {
            loading = false;
        }
    };

    const loadTeamsAndTasks = async () => {
        loading = true;
        error = '';

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
            events = [];
            error = getMessage(err);
            loading = false;
        }
    };

    const selectTeam = async (event: Event) => {
        const target = event.currentTarget as HTMLSelectElement;
        const value = Number(target.value);

        selectedTeamId = Number.isFinite(value) && value > 0 ? value : null;
        setWorkspaceTeam(selectedTeamId);
        await loadTasks();
    };

    const toggleSelectedDay = (dayNumber: number) => {
        selectedDay = selectedDay === dayNumber ? null : dayNumber;
    };

    onMount(() => {
        void loadTeamsAndTasks();
        updateDimensions();

        refreshTimer = setInterval(() => {
            currentTime = new Date();
            updateDimensions();
        }, 60_000);

        window.addEventListener('resize', updateDimensions);

        return () => {
            window.removeEventListener('resize', updateDimensions);
            if (refreshTimer) {
                clearInterval(refreshTimer);
            }
        };
    });
</script>

<AppHead title="Workspace Calendar" />

<AppLayout {breadcrumbs}>
    <div
        class="fx-stagger flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
        data-test="calendar-page"
    >
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                    Weekly schedule view with timed task events and live current
                    time marker.
                </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <label class="flex flex-1 flex-col gap-1 text-sm">
                        <span class="font-medium">Team</span>
                        <select
                            class="fx-input h-10 rounded-md border border-input bg-background px-3"
                            value={selectedTeamId ?? ''}
                            disabled={teams.length === 0}
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
                    <Button
                        variant="outline"
                        disabled={!selectedTeamId || loading}
                        onClick={loadTasks}
                    >
                        {loading ? 'Refreshing...' : 'Refresh Calendar'}
                    </Button>
                </div>

                {#if error}
                    <p class="text-sm text-red-600">{error}</p>
                {/if}
            </CardContent>
        </Card>

        <Card>
            <CardContent class="space-y-4 p-4">
                <div class="calendar-day-header-container">
                    <div class="calendar-time-header-placeholder"></div>
                    {#each dayNames as dayName, index (dayName)}
                        {@const dayNumber = index + 1}
                        {@const dayEvents = getEventsForDay(dayNumber)}
                        <button
                            type="button"
                            class="calendar-day-header {dayNumber === currentDay
                                ? 'today'
                                : ''} {selectedDay === dayNumber
                                ? 'selected'
                                : ''}"
                            onmouseenter={() => {
                                hoveredDay = dayNumber;
                            }}
                            onmouseleave={() => {
                                hoveredDay = null;
                            }}
                            onclick={() => toggleSelectedDay(dayNumber)}
                        >
                            {dayName}
                            {#if hoveredDay === dayNumber}
                                <div class="calendar-day-header-hover">
                                    <p>Events: {dayEvents.length}</p>
                                    {#if dayEvents.length === 0}
                                        <p>No events for this day</p>
                                    {:else}
                                        {#each dayEvents as event (event.id)}
                                            <div
                                                class="calendar-day-header-hover-event"
                                            >
                                                <strong>
                                                    {formatEventTime(
                                                        event.start,
                                                    )} - {formatEventTime(
                                                        event.end,
                                                    )}
                                                </strong>
                                                <br />
                                                {event.title}
                                            </div>
                                        {/each}
                                    {/if}
                                </div>
                            {/if}
                        </button>
                    {/each}
                </div>

                <div class="calendar-container" bind:this={gridRef}>
                    <div class="calendar-grid">
                        {#if selectedDay && dayColumnWidth > 0}
                            <div
                                class="calendar-selected-overlay"
                                style="left: {TIME_COLUMN_WIDTH +
                                    (selectedDay - 1) *
                                        (dayColumnWidth +
                                            DAY_GAP)}px; width: {dayColumnWidth}px; height: {24 *
                                    HOUR_HEIGHT}px;"
                            ></div>
                        {/if}

                        <div class="calendar-time-column">
                            {#each Array.from({ length: 24 }) as _, hour (hour)}
                                <div class="calendar-time-slot">
                                    {formatHourLabel(hour)}
                                </div>
                            {/each}
                        </div>

                        <div class="calendar-grid-lines">
                            {#each Array.from( { length: 7 }, ) as _, dayIndex (dayIndex)}
                                <div
                                    class="calendar-vertical-line"
                                    style="left: {TIME_COLUMN_WIDTH +
                                        dayIndex *
                                            (dayColumnWidth +
                                                DAY_GAP)}px; height: {24 *
                                        HOUR_HEIGHT}px;"
                                ></div>
                            {/each}
                            {#each Array.from( { length: 25 }, ) as _, hourIndex (hourIndex)}
                                <div
                                    class="calendar-horizontal-line"
                                    style="top: {hourIndex *
                                        HOUR_HEIGHT}px; left: {TIME_COLUMN_WIDTH}px;"
                                ></div>
                            {/each}
                        </div>

                        <div
                            class="calendar-current-time-line"
                            style="top: {getCurrentPosition()}px;"
                            role="presentation"
                            onmouseenter={() => {
                                showTimeTooltip = true;
                            }}
                            onmouseleave={() => {
                                showTimeTooltip = false;
                            }}
                        >
                            {#if showTimeTooltip}
                                <div class="calendar-current-time-tooltip">
                                    {currentTime.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </div>
                            {/if}
                        </div>

                        {#each events.filter((event) => !selectedDay || event.day === selectedDay) as event (event.id)}
                            {@const eventTop = calculateEventPosition(
                                event.start,
                            )}
                            {@const eventBottom = calculateEventPosition(
                                event.end,
                            )}
                            {@const eventHeight = Math.max(
                                eventBottom - eventTop,
                                20,
                            )}
                            <div
                                class="calendar-event {getEventState(event)}"
                                style="left: {TIME_COLUMN_WIDTH +
                                    (event.day - 1) *
                                        (dayColumnWidth + DAY_GAP) +
                                    2}px; top: {eventTop}px; height: {eventHeight}px; width: {Math.max(
                                    dayColumnWidth - 4,
                                    4,
                                )}px;"
                                role="presentation"
                                onmouseenter={() => {
                                    hoveredEventId = event.id;
                                }}
                                onmouseleave={() => {
                                    hoveredEventId = null;
                                }}
                            >
                                {#if hoveredEventId === event.id}
                                    <div class="calendar-event-hover">
                                        <h4>{event.title}</h4>
                                        <p class="calendar-event-description">
                                            {event.description}
                                        </p>
                                        <p class="calendar-event-time">
                                            {formatEventTime(event.start)} - {formatEventTime(
                                                event.end,
                                            )}
                                        </p>
                                    </div>
                                {/if}
                                <div class="calendar-event-content">
                                    <span>{event.title}</span>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
</AppLayout>

<style>
    .calendar-day-header-container {
        display: flex;
        gap: 2px;
        align-items: stretch;
    }

    .calendar-time-header-placeholder {
        width: 80px;
        flex-shrink: 0;
    }

    .calendar-day-header {
        position: relative;
        flex: 1;
        min-height: 38px;
        border: 1px solid hsl(var(--border));
        border-radius: 0.5rem;
        background: hsl(var(--muted) / 0.35);
        color: hsl(var(--foreground));
        font-size: 0.8125rem;
        font-weight: 600;
    }

    .calendar-day-header.today {
        border-color: hsl(var(--primary));
        background: hsl(var(--primary) / 0.12);
    }

    .calendar-day-header.selected {
        box-shadow: inset 0 0 0 1px hsl(var(--primary));
        background: hsl(var(--primary) / 0.18);
    }

    .calendar-day-header-hover {
        position: absolute;
        z-index: 30;
        top: calc(100% + 0.35rem);
        left: 50%;
        transform: translateX(-50%);
        width: min(220px, 90vw);
        padding: 0.5rem;
        border: 1px solid hsl(var(--border));
        border-radius: 0.5rem;
        background: hsl(var(--background));
        text-align: left;
        font-size: 0.72rem;
        line-height: 1.3;
        box-shadow: 0 14px 32px rgba(0, 0, 0, 0.16);
    }

    .calendar-day-header-hover-event {
        margin-top: 0.35rem;
    }

    .calendar-container {
        position: relative;
        overflow-x: auto;
        border: 1px solid hsl(var(--border));
        border-radius: 0.75rem;
        background: hsl(var(--muted) / 0.15);
    }

    .calendar-grid {
        position: relative;
        min-height: calc(24 * 40px);
        min-width: 900px;
    }

    .calendar-selected-overlay {
        position: absolute;
        top: 0;
        background: hsl(var(--primary) / 0.2);
        pointer-events: none;
        z-index: 1;
    }

    .calendar-time-column {
        position: absolute;
        top: 0;
        left: 0;
        width: 80px;
        z-index: 5;
    }

    .calendar-time-slot {
        height: 40px;
        display: flex;
        align-items: flex-start;
        justify-content: flex-end;
        padding: 0.12rem 0.45rem 0 0.25rem;
        font-size: 0.7rem;
        color: hsl(var(--muted-foreground));
    }

    .calendar-grid-lines {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: calc(24 * 40px);
        pointer-events: none;
        z-index: 2;
    }

    .calendar-vertical-line {
        position: absolute;
        top: 0;
        width: 1px;
        background: hsl(var(--border));
    }

    .calendar-horizontal-line {
        position: absolute;
        width: calc(100% - 80px);
        height: 1px;
        background: hsl(var(--border));
    }

    .calendar-current-time-line {
        position: absolute;
        left: 80px;
        width: calc(100% - 80px);
        height: 2px;
        background: #ef4444;
        z-index: 20;
    }

    .calendar-current-time-tooltip {
        position: absolute;
        top: -1.5rem;
        left: 0;
        transform: translateX(-50%);
        background: #ef4444;
        color: #fff;
        border-radius: 0.375rem;
        padding: 0.15rem 0.35rem;
        font-size: 0.65rem;
        white-space: nowrap;
    }

    .calendar-event {
        position: absolute;
        border-radius: 0.45rem;
        border: 1px solid transparent;
        overflow: visible;
        z-index: 10;
        color: #fff;
        cursor: default;
    }

    .calendar-event.past {
        background: rgba(107, 114, 128, 0.82);
        border-color: rgba(75, 85, 99, 0.9);
    }

    .calendar-event.today {
        background: rgba(239, 68, 68, 0.9);
        border-color: rgba(185, 28, 28, 0.95);
    }

    .calendar-event.future {
        background: rgba(37, 99, 235, 0.88);
        border-color: rgba(29, 78, 216, 0.95);
    }

    .calendar-event-content {
        font-size: 0.7rem;
        font-weight: 600;
        padding: 0.25rem 0.4rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .calendar-event-hover {
        position: absolute;
        z-index: 40;
        left: 50%;
        top: calc(100% + 0.2rem);
        transform: translateX(-50%);
        min-width: 190px;
        max-width: 250px;
        border: 1px solid hsl(var(--border));
        border-radius: 0.5rem;
        background: hsl(var(--background));
        color: hsl(var(--foreground));
        font-size: 0.72rem;
        line-height: 1.3;
        padding: 0.5rem;
        box-shadow: 0 14px 32px rgba(0, 0, 0, 0.16);
    }

    .calendar-event-hover h4 {
        margin: 0;
        font-size: 0.78rem;
    }

    .calendar-event-description {
        margin-top: 0.35rem;
    }

    .calendar-event-time {
        margin-top: 0.35rem;
        font-weight: 600;
    }
</style>
