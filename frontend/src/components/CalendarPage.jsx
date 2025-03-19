import { useEffect, useRef, useState } from "react";
import { FiClock } from "react-icons/fi";
import "./CalendarPage.css";
import axios from "axios";

export default function CalendarPage() {
  // The pixel height for each hour row
  const HOUR_HEIGHT = 40;

  const [events, setEvents] = useState([]);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null); // For filtering/highlighting a day
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dayColumnWidth, setDayColumnWidth] = useState(0);
  const [showTimeTooltip, setShowTimeTooltip] = useState(false);
  const gridRef = useRef(null);
  const token = localStorage.getItem("token");
  const teamId = localStorage.getItem("teamId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/tasks/${teamId}/index`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Filter out tasks that don't have an end date
        const tasksWithEnd = response.data?.data.filter((task) => task.end);
        const t = tasksWithEnd.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description || "No description",
          // Use the start date to determine the day (treat Sunday as 7)
          day:
            new Date(task.end).getDay() === 0
              ? 7
              : new Date(task.end).getDay(),
          start: new Date(task.start).toTimeString().slice(0, 5),
          end: new Date(task.end).toTimeString().slice(0, 5),
        }));
        setEvents(t);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchData();

    const updateDimensions = () => {
      if (gridRef.current) {
        const gridWidth = gridRef.current.offsetWidth;
        const timeColumnWidth = 80;
        const gapsWidth = 6 * 2; // 6 gaps for 7 days
        const availableWidth = gridWidth - timeColumnWidth - gapsWidth;
        setDayColumnWidth(availableWidth / 7);
      }
    };

    const interval = setInterval(() => {
      setCurrentTime(new Date());
      updateDimensions();
    }, 60000);
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", updateDimensions);
    };
  }, [teamId, token]);

  /** Format a Date -> "H:MM AM/PM" */
  const formatTimeWithMinutes = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  };

  /** Convert "14:45" -> "2:45 PM" */
  const formatEventTime = (timeStr) => {
    const [hStr, mStr] = timeStr.split(":");
    let hours = parseInt(hStr, 10);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${mStr} ${ampm}`;
  };

  /** Determine event state: past, today, or future */
  const getEventState = (event) => {
    const now = currentTime.getTime();
    const eventStart = new Date();
    eventStart.setHours(...event.start.split(":").map(Number));
    const eventEnd = new Date();
    eventEnd.setHours(...event.end.split(":").map(Number));
    if (eventEnd < now) return "past";
    if (eventStart <= now && eventEnd >= now) return "today";
    return "future";
  };

  /**
   * Convert "HH:MM" to a pixel offset.
   */
  const calculateEventPosition = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;
    return (totalMinutes / 60) * HOUR_HEIGHT;
  };

  /** Get the vertical offset for the current time line */
  const getCurrentPosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    return (totalMinutes / 60) * HOUR_HEIGHT;
  };

  // Treat Sunday (0) as day 7
  const currentDay = currentTime.getDay() === 0 ? 7 : currentTime.getDay();

  // Helper: get events for a day (for tooltip info)
  const getEventsForDay = (dayNum) => events.filter((ev) => ev.day === dayNum);

  // Array of day names for title display
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="calendar-page">
      <h1 className="calendar-title">
        Project Calendar
        {selectedDay && ` - ${dayNames[selectedDay - 1]} Selected`}
      </h1>

      {/* Day Headers */}
      <div className="day-header-container">
        <div className="time-header-placeholder"></div>
        {dayNames.map((day, index) => {
          const dayNum = index + 1;
          const dayEvents = getEventsForDay(dayNum);
          return (
            <div
              key={day}
              className={`day-header ${
                dayNum === currentDay ? "today" : ""
              } ${selectedDay === dayNum ? "selected" : ""}`}
              onClick={() =>
                setSelectedDay(selectedDay === dayNum ? null : dayNum)
              }
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

      {/* Calendar Grid */}
      <div className="calendar-container" ref={gridRef}>
        <div className="calendar-grid">
          {/* Render the selected day overlay */}
          {selectedDay && dayColumnWidth && (
            <div
              className="selected-day-overlay"
              style={{
                position: "absolute",
                top: 0,
                left: `${80 + (selectedDay - 1) * (dayColumnWidth + 2)}px`,
                width: `${dayColumnWidth}px`,
                // Highlight from midnight (0) to 11:59 PM (24 hours)
                height: `${24 * HOUR_HEIGHT}px`,
                background: "rgba(255, 205, 66, 0.3)",
                zIndex: 1,
              }}
            />
          )}

          {/* Time Column */}
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

          {/* Grid Lines */}
          <div className="grid-lines">
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={`v-${i}`}
                className="vertical-line"
                style={{
                  left: `${80 + i * (dayColumnWidth + 2)}px`,
                  height: `${24 * HOUR_HEIGHT}px`,
                }}
              />
            ))}
            {Array.from({ length: 25 }, (_, i) => (
              <div
                key={`h-${i}`}
                className="horizontal-line"
                style={{
                  top: `${i * HOUR_HEIGHT}px`,
                  left: "80px",
                  width: `calc(100% - 80px)`,
                }}
              />
            ))}
          </div>

          {/* Current Time Line */}
          <div
            className="current-time-line"
            style={{ top: `${getCurrentPosition()}px` }}
            onMouseEnter={() => setShowTimeTooltip(true)}
            onMouseLeave={() => setShowTimeTooltip(false)}
          >
            {showTimeTooltip && (
              <div className="current-time-tooltip">
                {formatTimeWithMinutes(currentTime)}
              </div>
            )}
          </div>

          {/* Events */}
          {events
            .filter((event) => !selectedDay || event.day === selectedDay)
            .map((event) => {
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
                          {formatEventTime(event.start)} –{" "}
                          {formatEventTime(event.end)}
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
