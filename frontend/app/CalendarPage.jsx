import { useEffect, useRef, useState } from 'react';
import { FiClock } from 'react-icons/fi';
import './CalendarPage.css';

export default function CalendarPage() {
    const [events, setEvents] = useState([]);
    const [hoveredEvent, setHoveredEvent] = useState(null);
    const [hoveredDay, setHoveredDay] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [dayColumnWidth, setDayColumnWidth] = useState(0);
    const [showTimeTooltip, setShowTimeTooltip] = useState(false);
    const gridRef = useRef(null);

    useEffect(() => {
        setEvents([
            {
                id: 1,
                title: 'Team Meeting',
                description: 'Weekly sync-up',
                day: 1,
                start: '09:30',
                end: '10:15',
            },
            {
                id: 2,
                title: 'Design Review',
                description: 'UI finalization',
                day: 2,
                start: '14:45',
                end: '15:30',
            },
            {
                id: 3,
                title: 'Client Pitch',
                description: 'Project presentation',
                day: 4,
                start: '11:00',
                end: '12:30',
            },
            {
                id: 4,
                title: 'Code Review',
                description: 'Pull request discussion',
                day: 5,
                start: '16:20',
                end: '17:45',
            },
        ]);

        const updateDimensions = () => {
            if (gridRef.current) {
                const gridWidth = gridRef.current.offsetWidth;
                const timeColumnWidth = 80;
                const gapsWidth = 6 * 2;
                const availableWidth = gridWidth - timeColumnWidth - gapsWidth;
                setDayColumnWidth(availableWidth / 7);
            }
        };

        const interval = setInterval(() => {
            setCurrentTime(new Date());
            updateDimensions();
        }, 60000);

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', updateDimensions);
        };
    }, []);

    const formatTimeWithMinutes = (date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes} ${ampm}`;
    };

    const formatEventTime = (timeStr) => {
        const [hStr, mStr] = timeStr.split(':');
        let hours = parseInt(hStr, 10);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${mStr} ${ampm}`;
    };

    const getEventState = (event) => {
        const now = currentTime.getTime();
        const eventStart = new Date();
        eventStart.setHours(...event.start.split(':').map(Number));
        const eventEnd = new Date();
        eventEnd.setHours(...event.end.split(':').map(Number));
        if (eventEnd < now) return 'past';
        if (eventStart <= now && eventEnd >= now) return 'today';
        return 'future';
    };

    const calculateEventPosition = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return (hours * 60 + minutes) * (40 / 60);
    };

    const getCurrentPosition = () => {
        const hours = currentTime.getHours();
        const minutes = currentTime.getMinutes();
        return (hours * 60 + minutes) * (40 / 60);
    };

    const currentDay = currentTime.getDay() === 0 ? 7 : currentTime.getDay();
    const getEventsForDay = (dayNum) => events.filter((ev) => ev.day === dayNum);

    return (
        <div className="calendar-page">
            <h1 className="calendar-title">Project Calendar</h1>

            <div className="day-header-container">
                <div className="time-header-placeholder"></div>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                    const dayNum = index + 1;
                    const dayEvents = getEventsForDay(dayNum);
                    return (
                        <div
                            key={day}
                            className={`day-header ${dayNum === currentDay ? 'today' : ''}`}
                            onMouseEnter={() => setHoveredDay(dayNum)}
                            onMouseLeave={() => setHoveredDay(null)}
                        >
                            {day}
                            {hoveredDay === dayNum && (
                                <div className="day-header-hover">
                                    <p>Events: {dayEvents.length}</p>
                                    {dayEvents.length > 0 ? (
                                        dayEvents.map((ev) => (
                                            <div key={ev.id} className="day-header-hover-event">
                                                <strong>
                                                    {formatEventTime(ev.start)} - {formatEventTime(ev.end)}
                                                </strong>
                                                <br />
                                                {ev.title}
                                            </div>
                                        ))
                                    ) : (
                                        <p>No events for this day</p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="calendar-container" ref={gridRef}>
                <div className="calendar-grid">
                    <div className="time-column">
                        {Array.from({ length: 24 }, (_, i) => {
                            const timeObj = new Date();
                            timeObj.setHours(i, 0, 0, 0);
                            return (
                                <div key={i} className="time-slot">
                                    {formatTimeWithMinutes(timeObj)}
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid-lines">
                        {Array.from({ length: 7 }, (_, i) => (
                            <div
                                key={`v-${i}`}
                                className="vertical-line"
                                style={{
                                    left: `${80 + i * (dayColumnWidth + 2) - 1}px`,
                                    height: `${24 * 42 - 2}px`,
                                }}
                            />
                        ))}
                        {Array.from({ length: 25 }, (_, i) => (
                            <div
                                key={`h-${i}`}
                                className="horizontal-line"
                                style={{
                                    top: `${i * 42 - 1}px`,
                                    left: '80px',
                                    width: `calc(100% - 80px)`,
                                }}
                            />
                        ))}
                    </div>

                    <div
                        className="current-time-line"
                        style={{ top: `${getCurrentPosition()}px` }}
                        onMouseEnter={() => setShowTimeTooltip(true)}
                        onMouseLeave={() => setShowTimeTooltip(false)}
                    >
                        {showTimeTooltip && <div className="current-time-tooltip">{formatTimeWithMinutes(currentTime)}</div>}
                    </div>

                    {events.map((event) => {
                        const eventState = getEventState(event);
                        const top = calculateEventPosition(event.start);
                        const height = calculateEventPosition(event.end) - top;
                        return (
                            <div
                                key={event.id}
                                className={`event ${eventState}`}
                                style={{
                                    left: 80 + (event.day - 1) * (dayColumnWidth + 2) + 2,
                                    top: `${top}px`,
                                    height: `${height}px`,
                                    width: `${dayColumnWidth}px`,
                                }}
                                onMouseEnter={() => setHoveredEvent(event)}
                                onMouseLeave={() => setHoveredEvent(null)}
                            >
                                {hoveredEvent?.id === event.id && (
                                    <div className="event-hover">
                                        <h4>{event.title}</h4>
                                        <p className="event-description">{event.description}</p>
                                        <p className="event-time">
                                            <FiClock className="clock-icon" />
                                            <span>
                                                {formatEventTime(event.start)} – {formatEventTime(event.end)}
                                            </span>
                                        </p>
                                    </div>
                                )}
                                <div className="event-content">
                                    <span>{event.title}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
