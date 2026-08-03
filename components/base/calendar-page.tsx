"use client";

import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Plus,
  UsersRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ScheduleRail } from "./schedule-page";
import { useToast } from "./toast-provider";
import { useOverlayScrollLock } from "./use-overlay-scroll-lock";

type CalendarView = "day" | "week" | "month" | "year";
type CalendarItemType = "event" | "reminder" | "task";
type CalendarTone = "cyan" | "pink" | "coral" | "green" | "violet";

type CalendarEvent = {
  id: string;
  title: string;
  type: CalendarItemType;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  attendees: string[];
  tone: CalendarTone;
};

type EventDraft = Omit<CalendarEvent, "id" | "tone">;

const initialEvents: CalendarEvent[] = [
  {
    id: "event-free-day",
    title: "Free day",
    type: "event",
    date: "2021-12-02",
    startTime: "09:00",
    endTime: "10:00",
    location: "Home",
    attendees: ["John Doe"],
    tone: "coral",
  },
  {
    id: "event-party",
    title: "Party Time",
    type: "event",
    date: "2021-12-02",
    startTime: "12:00",
    endTime: "13:00",
    location: "Friends Zone",
    attendees: ["Alexey Stave", "Anton Tkacheve"],
    tone: "cyan",
  },
  {
    id: "event-lunch",
    title: "Lunch Time",
    type: "reminder",
    date: "2021-12-02",
    startTime: "14:00",
    endTime: "15:00",
    location: "Cafe Palette",
    attendees: [],
    tone: "coral",
  },
  {
    id: "event-prayer",
    title: "Prayer Time",
    type: "reminder",
    date: "2021-12-02",
    startTime: "18:00",
    endTime: "19:00",
    location: "Quiet room",
    attendees: [],
    tone: "green",
  },
  {
    id: "event-dinner",
    title: "Dinner Time",
    type: "event",
    date: "2021-12-02",
    startTime: "21:00",
    endTime: "22:00",
    location: "The Garden",
    attendees: ["John Doe"],
    tone: "violet",
  },
  {
    id: "event-victory",
    title: "Victory day",
    type: "event",
    date: "2021-12-16",
    startTime: "12:00",
    endTime: "13:00",
    location: "Office Meeting",
    attendees: ["John Doe"],
    tone: "coral",
  },
  {
    id: "event-invited",
    title: "Invited by friends",
    type: "event",
    date: "2021-12-21",
    startTime: "09:00",
    endTime: "10:00",
    location: "Friends Zone",
    attendees: ["Eddie Lobanovskiy", "Alexey Stave"],
    tone: "pink",
  },
  {
    id: "event-christmas",
    title: "Christmas Day",
    type: "event",
    date: "2021-12-25",
    startTime: "10:00",
    endTime: "11:00",
    location: "Home",
    attendees: ["John Doe"],
    tone: "cyan",
  },
];

const viewOptions: Array<{ label: string; value: CalendarView }> = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
];

const toneRotation: CalendarTone[] = ["cyan", "pink", "coral", "green", "violet"];
const weekDayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatHeading(date: Date, view: CalendarView) {
  if (view === "day") {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }
  if (view === "year") return String(date.getFullYear());
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
}

function buildMonthCells(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = new Date(date.getFullYear(), date.getMonth(), 1 - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const cell = new Date(start);
    cell.setDate(start.getDate() + index);
    return cell;
  });
}

function startOfWeek(date: Date) {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

function formatHour(hour: number) {
  if (hour === 0) return "12.00 AM";
  if (hour === 12) return "12.00 PM";
  return `${hour > 12 ? hour - 12 : hour}.00 ${hour >= 12 ? "PM" : "AM"}`;
}

function CalendarEventDialog({
  draft,
  onChange,
  onClose,
  onSave,
}: {
  draft: EventDraft;
  onChange: (draft: EventDraft) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const attendeeAdded = draft.attendees.length > 0;

  return (
    <div className="base-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="base-modal base-event-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="base-event-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="base-modal-header">
          <h2 id="base-event-dialog-title">Create an Event</h2>
          <button className="base-modal-close" type="button" aria-label="Close event dialog" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        <div className="base-event-type-tabs" role="group" aria-label="Calendar item type">
          {(["event", "reminder", "task"] as CalendarItemType[]).map((type) => (
            <button
              className={draft.type === type ? "base-is-active" : ""}
              type="button"
              aria-pressed={draft.type === type}
              key={type}
              onClick={() => onChange({ ...draft, type })}
            >
              {type[0].toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <label className="base-event-title-field">
          <span className="base-visually-hidden">Event title</span>
          <input
            autoFocus
            value={draft.title}
            placeholder="Add title"
            onChange={(event) => onChange({ ...draft, title: event.target.value })}
          />
        </label>

        <div className="base-event-detail-row">
          <span className="base-event-detail-icon"><Clock3 size={17} aria-hidden="true" /></span>
          <div className="base-event-date-time-fields">
            <label>
              <span>Date</span>
              <input type="date" value={draft.date} onChange={(event) => onChange({ ...draft, date: event.target.value })} />
            </label>
            <label>
              <span>Starts</span>
              <input type="time" value={draft.startTime} onChange={(event) => onChange({ ...draft, startTime: event.target.value })} />
            </label>
            <span className="base-event-time-separator" aria-hidden="true">–</span>
            <label>
              <span>Ends</span>
              <input type="time" value={draft.endTime} onChange={(event) => onChange({ ...draft, endTime: event.target.value })} />
            </label>
          </div>
        </div>

        <div className="base-event-quick-actions">
          <button
            className={`base-primary-button ${attendeeAdded ? "base-is-complete" : ""}`}
            type="button"
            onClick={() => onChange({ ...draft, attendees: attendeeAdded ? [] : ["John Doe"] })}
          >
            {attendeeAdded ? <Check size={17} /> : <UsersRound size={17} />}
            {attendeeAdded ? "John added" : "Add People"}
          </button>
          <label className="base-location-control">
            <MapPin size={16} aria-hidden="true" />
            <span className="base-visually-hidden">Add location</span>
            <input
              value={draft.location}
              placeholder="Add Location"
              onChange={(event) => onChange({ ...draft, location: event.target.value })}
            />
          </label>
        </div>

        <div className="base-event-owner-row">
          <span className="base-event-detail-icon"><CalendarDays size={17} aria-hidden="true" /></span>
          <span>
            <strong>John Doe</strong>
            <small>Busy · Default visibility · notify 30 minutes before</small>
          </span>
        </div>

        <footer className="base-modal-actions">
          <button className="base-secondary-button" type="button" onClick={onClose}>Close</button>
          <button
            className="base-primary-button"
            type="button"
            disabled={!draft.title.trim() || !draft.date || !draft.startTime || !draft.endTime}
            onClick={onSave}
          >
            Save
          </button>
        </footer>
      </section>
    </div>
  );
}

function MonthView({
  date,
  events,
  onOpenDay,
  onSelectEvent,
}: {
  date: Date;
  events: CalendarEvent[];
  onOpenDay: (date: Date) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}) {
  const cells = buildMonthCells(date);

  return (
    <div className="base-month-view">
      <div className="base-calendar-weekdays" aria-hidden="true">
        {weekDayLabels.map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="base-month-grid" role="grid" aria-label={formatHeading(date, "month")}>
        {cells.map((cell) => {
          const key = dateKey(cell);
          const dayEvents = events.filter((event) => event.date === key);
          const outsideMonth = cell.getMonth() !== date.getMonth();
          const selected = key === dateKey(date);
          return (
            <article
              className={`${outsideMonth ? "base-is-outside " : ""}${selected ? "base-is-today" : ""}`.trim()}
              role="gridcell"
              aria-label={`${cell.toLocaleDateString("en-US", { month: "long", day: "numeric" })}, ${dayEvents.length} events`}
              key={key}
            >
              <span className="base-month-day-number">{String(cell.getDate()).padStart(2, "0")}</span>
              <div className="base-month-events">
                {dayEvents.slice(0, 2).map((event) => (
                  <button className={`base-calendar-chip base-calendar-chip--${event.tone}`} type="button" key={event.id} title={`${event.title} at ${event.startTime}`} onClick={() => onSelectEvent(event)}>
                    {event.title}
                  </button>
                ))}
                {dayEvents.length > 2 ? <button className="base-calendar-more" type="button" onClick={() => onOpenDay(cell)}>+{dayEvents.length - 2} more</button> : null}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function DayView({ date, events, onSelectEvent }: { date: Date; events: CalendarEvent[]; onSelectEvent: (event: CalendarEvent) => void }) {
  const hours = Array.from({ length: 15 }, (_, index) => index + 9);
  const dayEvents = events.filter((event) => event.date === dateKey(date));

  return (
    <div className="base-day-view" role="grid" aria-label={`Schedule for ${formatHeading(date, "day")}`}>
      <div className="base-day-time-column" aria-hidden="true">
        {hours.map((hour) => <span key={hour}>{formatHour(hour)}</span>)}
      </div>
      <div className="base-day-timeline">
        {hours.map((hour) => <span className="base-day-time-rule" aria-hidden="true" key={hour} />)}
        {dayEvents.map((event, index) => {
          const startHour = Number(event.startTime.split(":")[0]);
          const top = Math.max(0, (startHour - 9) * 100 / hours.length);
          return (
            <button
              className={`base-day-event base-day-event--${event.tone} base-day-event--lane-${index % 4}`}
              type="button"
              aria-label={`${event.title}, ${event.startTime} to ${event.endTime}, ${event.location}`}
              style={{ top: `${top}%` }}
              key={event.id}
              onClick={() => onSelectEvent(event)}
            >
              <span>{event.title}</span>
              <small>{event.startTime}–{event.endTime}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({ date, events, onSelectEvent }: { date: Date; events: CalendarEvent[]; onSelectEvent: (event: CalendarEvent) => void }) {
  const start = startOfWeek(date);
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
  const hours = Array.from({ length: 11 }, (_, index) => index + 9);

  return (
    <div className="base-week-view" role="grid" aria-label={`Week containing ${formatHeading(date, "day")}`}>
      <div className="base-week-corner" aria-hidden="true" />
      {days.map((day) => (
        <div className={`${dateKey(day) === dateKey(date) ? "base-is-today" : ""}`} role="columnheader" key={dateKey(day)}>
          <span>{weekDayLabels[day.getDay()]}</span>
          <strong>{day.getDate()}</strong>
        </div>
      ))}
      {hours.map((hour) => (
        <div className="base-week-row" role="row" key={hour}>
          <span className="base-week-time">{formatHour(hour)}</span>
          {days.map((day) => {
            const hourEvents = events.filter((event) => event.date === dateKey(day) && Number(event.startTime.split(":")[0]) === hour);
            return (
              <div className="base-week-cell" role="gridcell" key={`${dateKey(day)}-${hour}`}>
                {hourEvents.map((event) => (
                  <button className={`base-week-event base-week-event--${event.tone}`} type="button" key={event.id} onClick={() => onSelectEvent(event)}>
                    <strong>{event.title}</strong>
                    <small>{event.startTime}</small>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function YearView({ date, events, onOpenDay }: { date: Date; events: CalendarEvent[]; onOpenDay: (date: Date) => void }) {
  const months = Array.from({ length: 12 }, (_, month) => new Date(date.getFullYear(), month, 1));

  return (
    <div className="base-year-view" aria-label={`${date.getFullYear()} calendar`}>
      {months.map((month) => {
        const cells = buildMonthCells(month).slice(0, 35);
        const monthHasEvents = events.some((event) => {
          const eventDate = new Date(`${event.date}T12:00:00`);
          return eventDate.getFullYear() === month.getFullYear() && eventDate.getMonth() === month.getMonth();
        });
        return (
          <section className="base-year-month" key={month.getMonth()}>
            <h2>{month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h2>
            <div className="base-year-weekdays" aria-hidden="true">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
            </div>
            <div className="base-year-days">
              {cells.map((cell) => {
                const outside = cell.getMonth() !== month.getMonth();
                const hasEvent = events.some((event) => event.date === dateKey(cell));
                return (
                  <button
                    className={`${outside ? "base-is-outside " : ""}${hasEvent ? "base-has-event" : ""}`.trim()}
                    type="button"
                    aria-label={`${cell.toLocaleDateString("en-US", { month: "long", day: "numeric" })}${hasEvent ? ", has event" : ""}`}
                    disabled={outside}
                    key={dateKey(cell)}
                    onClick={() => onOpenDay(cell)}
                  >
                    {cell.getDate()}
                  </button>
                );
              })}
            </div>
            {monthHasEvents ? <span className="base-year-month-event-note">{events.filter((event) => event.date.startsWith(`${date.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`)).length} events</span> : null}
          </section>
        );
      })}
    </div>
  );
}

export function CalendarPage() {
  const { showToast } = useToast();
  const [view, setView] = useState<CalendarView>("month");
  const [focusDate, setFocusDate] = useState(new Date(2021, 11, 2, 12));
  const [events, setEvents] = useState(initialEvents);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<EventDraft>({
    title: "",
    type: "event",
    date: "2021-12-05",
    startTime: "12:00",
    endTime: "13:00",
    location: "",
    attendees: [],
  });

  const heading = useMemo(() => formatHeading(focusDate, view), [focusDate, view]);

  useOverlayScrollLock(modalOpen, () => setModalOpen(false));

  function openCreate() {
    setDraft({
      title: "",
      type: "event",
      date: dateKey(focusDate),
      startTime: "12:00",
      endTime: "13:00",
      location: "",
      attendees: [],
    });
    setModalOpen(true);
  }

  function saveEvent() {
    if (!draft.title.trim() || !draft.date || !draft.startTime || !draft.endTime) return;
    const tone = toneRotation[events.length % toneRotation.length];
    setEvents((items) => [...items, { id: `event-${Date.now()}`, ...draft, title: draft.title.trim(), tone }]);
    setModalOpen(false);
    showToast(`${draft.title.trim()} added to the calendar.`, { title: "Event created" });
  }

  function moveDate(direction: -1 | 1) {
    setFocusDate((current) => {
      const next = new Date(current);
      if (view === "day") next.setDate(current.getDate() + direction);
      if (view === "week") next.setDate(current.getDate() + direction * 7);
      if (view === "month") next.setMonth(current.getMonth() + direction);
      if (view === "year") next.setFullYear(current.getFullYear() + direction);
      return next;
    });
  }

  function openDay(date: Date) {
    setFocusDate(new Date(date));
    setView("day");
  }

  function showEventDetails(event: CalendarEvent) {
    showToast(`${event.startTime}–${event.endTime} · ${event.location}`, { tone: "info", title: event.title });
  }

  return (
    <div className="base-page base-calendar-page">
      <header className="base-page-heading base-calendar-page-heading">
        <div>
          <span className="base-eyebrow">Planner</span>
          <h1>Calendar</h1>
        </div>
        <div className="base-calendar-view-switcher" role="group" aria-label="Calendar view">
          {viewOptions.map((option) => (
            <button
              className={view === option.value ? "base-is-active" : ""}
              type="button"
              aria-pressed={view === option.value}
              key={option.value}
              onClick={() => setView(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      <div className="base-planner-layout">
        <ScheduleRail onCreate={openCreate} />
        <main className="base-calendar-content" aria-label="Calendar view" tabIndex={0}>
          <div className="base-calendar-toolbar">
            <strong>{heading}</strong>
            <span className="base-calendar-toolbar-actions">
              <button className="base-secondary-button" type="button" onClick={() => setFocusDate(new Date(2021, 11, 2, 12))}>Today</button>
              <button className="base-icon-button" type="button" aria-label={`Previous ${view}`} onClick={() => moveDate(-1)}><ChevronLeft size={17} /></button>
              <button className="base-icon-button" type="button" aria-label={`Next ${view}`} onClick={() => moveDate(1)}><ChevronRight size={17} /></button>
              <button className="base-primary-button base-calendar-inline-create" type="button" onClick={openCreate}><Plus size={16} /> Create Event</button>
            </span>
          </div>

          {view === "day" ? <DayView date={focusDate} events={events} onSelectEvent={showEventDetails} /> : null}
          {view === "week" ? <WeekView date={focusDate} events={events} onSelectEvent={showEventDetails} /> : null}
          {view === "month" ? <MonthView date={focusDate} events={events} onOpenDay={openDay} onSelectEvent={showEventDetails} /> : null}
          {view === "year" ? <YearView date={focusDate} events={events} onOpenDay={openDay} /> : null}
        </main>
      </div>

      <button className="base-calendar-fab" type="button" aria-label="Create event" onClick={openCreate}>
        <Plus size={21} />
      </button>

      {modalOpen ? (
        <CalendarEventDialog
          draft={draft}
          onChange={setDraft}
          onClose={() => setModalOpen(false)}
          onSave={saveEvent}
        />
      ) : null}
    </div>
  );
}
