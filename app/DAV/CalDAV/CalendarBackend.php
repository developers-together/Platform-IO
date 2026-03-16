<?php

namespace App\DAV\CalDAV;

use App\Models\Calendar;
use App\Models\Event;
use Illuminate\Support\Facades\Auth;
use Sabre\CalDAV\Backend\AbstractBackend;
use Sabre\DAV\PropPatch;

class CalendarBackend extends AbstractBackend
{
    // -------------------------------------------------------
    // Calendars
    // -------------------------------------------------------

    /**
     * Sabre calls this to get all calendars for a principal.
     * Principal URI looks like: "principals/1" (user id)
     */
public function getCalendarsForUser(string $principalUri): array
{
    $userId = $this->extractUserId($principalUri);
    $user   = \App\Models\User::find($userId);

    if (! $user) return [];

    $calendars = [];

    // 1. Team calendars — calendars the user sees via team membership
    foreach ($user->teams as $team) {
        foreach ($team->calendars as $calendar) {
            $calendars[] = $this->formatCalendar($calendar, $principalUri);
        }
    }

    // 2. Explicitly shared calendars — calendars shared directly with this user
    $sharedCalendars = \App\Models\Calendar::whereHas('shares', function ($query) use ($userId) {
            $query->where('shared_with_user_id', $userId);
        })
        ->get();

    foreach ($sharedCalendars as $calendar) {
        // Avoid duplicates if the calendar is also in a team they belong to
        $alreadyIncluded = collect($calendars)
            ->contains('id', $calendar->id);

        if (! $alreadyIncluded) {
            $calendars[] = $this->formatCalendar($calendar, $principalUri);
        }
    }

    return $calendars;
}

    /**
     * Format a Calendar model into the array Sabre expects
     */
    private function formatCalendar(Calendar $calendar, string $principalUri): array
    {
        return [
            'id'                                    => $calendar->id,
            'uri'                                   => $calendar->uri,
            'principaluri'                          => $principalUri,
            '{DAV:}displayname'                     => $calendar->name,
            '{http://apple.com/ns/ical/}calendar-color' => $calendar->color,
            '{urn:ietf:params:xml:ns:caldav}calendar-description' => '',
            '{urn:ietf:params:xml:ns:caldav}calendar-timezone'    => 'UTC',
            '{http://sabredav.org/ns}sync-token'    => $calendar->updated_at->timestamp,
        ];
    }

    public function createCalendar(
        string $principalUri,
        string $calendarUri,
        array $properties
    ): string {
        // Find which team this principal belongs to
        // For simplicity, attach to the user's first team
        // You can expand this logic based on your app
        $userId = $this->extractUserId($principalUri);
        $user = \App\Models\User::findOrFail($userId);
        $team = $user->teams->first();

        $calendar = Calendar::create([
            'team_id' => $team->id,
            'name'    => $properties['{DAV:}displayname'] ?? 'New Calendar',
            'color'   => $properties['{http://apple.com/ns/ical/}calendar-color'] ?? '#0000FF',
            'uri'     => $calendarUri,
        ]);

        return $calendar->id;
    }

    public function deleteCalendar(mixed $calendarId): void
    {
        Calendar::findOrFail($calendarId)->delete();
    }

    public function updateCalendar(
        mixed $calendarId,
        PropPatch $propPatch
    ): void {
        $propPatch->handle(
            ['{DAV:}displayname',
             '{http://apple.com/ns/ical/}calendar-color'],
            function (array $mutations) use ($calendarId) {
                $calendar = Calendar::findOrFail($calendarId);

                if (isset($mutations['{DAV:}displayname'])) {
                    $calendar->name = $mutations['{DAV:}displayname'];
                }
                if (isset($mutations['{http://apple.com/ns/ical/}calendar-color'])) {
                    $calendar->color = $mutations['{http://apple.com/ns/ical/}calendar-color'];
                }

                $calendar->save();
                return true;
            }
        );
    }

    // -------------------------------------------------------
    // Events (Calendar Objects)
    // -------------------------------------------------------

    /**
     * Returns all events in a calendar as .ics data
     */
    public function getCalendarObjects(mixed $calendarId): array
    {
        return Event::where('calendar_id', $calendarId)
            ->get()
            ->map(function (Event $event) {
                return [
                    'id'           => $event->id,
                    'uri'          => $event->id . '.ics',
                    'lastmodified' => $event->updated_at->timestamp,
                    'etag'         => '"' . md5($event->updated_at->timestamp) . '"',
                    'calendarid'   => $event->calendar_id,
                    'size'         => strlen($this->eventToIcs($event)),
                    'component'    => 'vevent',
                ];
            })
            ->all();
    }

    /**
     * Returns one event
     */
    public function getCalendarObject(mixed $calendarId, string $objectUri): ?array
    {
        $eventId = str_replace('.ics', '', $objectUri);
        $event = Event::where('calendar_id', $calendarId)
            ->where('id', $eventId)
            ->first();

        if (! $event) return null;

        $icsData = $this->eventToIcs($event);

        return [
            'id'           => $event->id,
            'uri'          => $objectUri,
            'lastmodified' => $event->updated_at->timestamp,
            'etag'         => '"' . md5($event->updated_at->timestamp) . '"',
            'calendarid'   => $calendarId,
            'size'         => strlen($icsData),
            'calendardata' => $icsData,
            'component'    => 'vevent',
        ];
    }

    /**
     * Creates a new event from .ics data sent by the client
     */
    public function createCalendarObject(
        mixed $calendarId,
        string $objectUri,
        string $calendarData
    ): ?string {
        $parsed = $this->parseIcs($calendarData);

        $event = Event::create([
            'calendar_id' => $calendarId,
            'title'       => $parsed['title'],
            'description' => $parsed['description'],
            'start'       => $parsed['start'],
            'end'         => $parsed['end'],
            'is_all_day'  => $parsed['is_all_day'],
            'timezone'    => $parsed['timezone'],
            'rrule'       => $parsed['rrule'],
        ]);

        return '"' . md5($event->updated_at->timestamp) . '"';
    }

    /**
     * Updates an existing event
     */
    public function updateCalendarObject(
        mixed $calendarId,
        string $objectUri,
        string $calendarData
    ): ?string {
        $eventId = str_replace('.ics', '', $objectUri);
        $event = Event::where('calendar_id', $calendarId)
            ->where('id', $eventId)
            ->firstOrFail();

        $parsed = $this->parseIcs($calendarData);

        $event->update([
            'title'       => $parsed['title'],
            'description' => $parsed['description'],
            'start'       => $parsed['start'],
            'end'         => $parsed['end'],
            'is_all_day'  => $parsed['is_all_day'],
            'timezone'    => $parsed['timezone'],
            'rrule'       => $parsed['rrule'],
        ]);

        return '"' . md5($event->updated_at->timestamp) . '"';
    }

    /**
     * Deletes an event
     */
    public function deleteCalendarObject(
        mixed $calendarId,
        string $objectUri
    ): void {
        $eventId = str_replace('.ics', '', $objectUri);
        Event::where('calendar_id', $calendarId)
            ->where('id', $eventId)
            ->delete();
    }

    private function authorizeWrite(mixed $calendarId): void
    {
        // Always use Auth::user() for write checks — not the principal URI
        // because the principal URI comes from the URL and could be manipulated
        $userId = $this->getCurrentUserId();

        $calendar = \App\Models\Calendar::findOrFail($calendarId);

        $isTeamMember = $calendar->team->members()
            ->where('user_id', $userId)
            ->exists();

        if ($isTeamMember) return;

        $share = $calendar->shares()
            ->where('shared_with_user_id', $userId)
            ->first();

        if (! $share) {
            throw new \Sabre\DAV\Exception\Forbidden('No access.');
        }

        if ($share->permission === 'read') {
            throw new \Sabre\DAV\Exception\Forbidden('Read-only access.');
        }
    }
    // -------------------------------------------------------
    // ICS conversion — your DB <-> iCalendar format
    // -------------------------------------------------------

    /**
     * Convert an Event model to an .ics string
     * This is what CalDAV clients receive
     */
    private function eventToIcs(Event $event): string
    {
        $start = $event->is_all_day
            ? $event->start->format('Ymd')
            : $event->start->format('Ymd\THis\Z');

        $end = $event->is_all_day
            ? $event->end->format('Ymd')
            : $event->end->format('Ymd\THis\Z');

        $ics = "BEGIN:VCALENDAR\r\n";
        $ics .= "VERSION:2.0\r\n";
        $ics .= "PRODID:-//YourApp//YourApp//EN\r\n";
        $ics .= "BEGIN:VEVENT\r\n";
        $ics .= "UID:{$event->id}@yourapp.com\r\n";
        $ics .= "SUMMARY:{$event->title}\r\n";
        $ics .= "DTSTART:{$start}\r\n";
        $ics .= "DTEND:{$end}\r\n";

        if ($event->description) {
            $ics .= "DESCRIPTION:{$event->description}\r\n";
        }

        if ($event->rrule) {
            $ics .= "RRULE:{$event->rrule}\r\n";
        }

        $ics .= "END:VEVENT\r\n";
        $ics .= "END:VCALENDAR\r\n";

        return $ics;
    }

    /**
     * Parse .ics string from client into an array for your DB
     * Uses sabre/vobject which comes with sabre/dav
     */
    private function parseIcs(string $calendarData): array
    {
        $vObject = \Sabre\VObject\Reader::read($calendarData);
        $vevent = $vObject->VEVENT;

        $start = $vevent->DTSTART->getDateTime();
        $end   = $vevent->DTEND?->getDateTime() ?? $start;
        $isAllDay = ! $vevent->DTSTART->hasTime();

        return [
            'title'       => (string) ($vevent->SUMMARY ?? 'Untitled'),
            'description' => (string) ($vevent->DESCRIPTION ?? ''),
            'start'       => $start->format('Y-m-d H:i:s'),
            'end'         => $end->format('Y-m-d H:i:s'),
            'is_all_day'  => $isAllDay,
            'timezone'    => (string) ($vevent->DTSTART['TZID'] ?? 'UTC'),
            'rrule'       => isset($vevent->RRULE)
                                ? (string) $vevent->RRULE
                                : null,
        ];
    }

    // -------------------------------------------------------
    // Helpers
    // -------------------------------------------------------

    private function extractUserId(string $principalUri): int
    {
        // principalUri is "principals/1" — extract the id
        return (int) last(explode('/', $principalUri));
    }
}
