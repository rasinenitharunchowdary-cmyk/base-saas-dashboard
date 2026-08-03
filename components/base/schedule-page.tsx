"use client";

import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useToast } from "./toast-provider";
import { useOverlayScrollLock } from "./use-overlay-scroll-lock";

type ScheduleEntry = {
  id: string;
  date: string;
  time: string;
  location: string;
};

type ScheduleDraft = Omit<ScheduleEntry, "id">;

const initialSchedules: ScheduleEntry[] = [
  { id: "schedule-1", date: "2021-12-12", time: "10:15", location: "Office Meeting" },
  { id: "schedule-2", date: "2021-12-10", time: "11:20", location: "Home" },
  { id: "schedule-3", date: "2021-12-09", time: "11:45", location: "Friends Zone" },
  { id: "schedule-4", date: "2021-12-08", time: "12:15", location: "Office Meeting" },
  { id: "schedule-5", date: "2021-12-07", time: "13:20", location: "Home" },
  { id: "schedule-6", date: "2021-12-05", time: "10:15", location: "Meeting Outside" },
  { id: "schedule-7", date: "2021-12-04", time: "11:15", location: "Office Meeting" },
  { id: "schedule-8", date: "2021-12-04", time: "13:25", location: "Home" },
];

const people = [
  { id: "eddie", name: "Eddie Lobanovskiy", email: "lobanovskiy@gmail.com", initials: "EL", tone: "blue" },
  { id: "alexey", name: "Alexey Stave", email: "alexeyst@gmail.com", initials: "AS", tone: "pink" },
  { id: "anton", name: "Anton Tkacheve", email: "tkacheveanton@gmail.com", initials: "AT", tone: "cyan" },
];

const miniCalendarDays = [
  { day: 29, muted: true },
  { day: 30, muted: true },
  { day: 1 },
  { day: 2 },
  { day: 3 },
  { day: 4 },
  { day: 5 },
  { day: 6 },
  { day: 7 },
  { day: 8 },
  { day: 9 },
  { day: 10 },
  { day: 11 },
  { day: 12 },
  { day: 13 },
  { day: 14 },
  { day: 15 },
  { day: 16 },
  { day: 17 },
  { day: 18 },
  { day: 19 },
  { day: 20 },
  { day: 21 },
  { day: 22 },
  { day: 23 },
  { day: 24 },
  { day: 25 },
  { day: 26 },
  { day: 27 },
  { day: 28 },
  { day: 29 },
  { day: 30 },
  { day: 31 },
  { day: 1, muted: true },
  { day: 2, muted: true },
];

function formatDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function formatTime(time: string) {
  const [hourValue, minute] = time.split(":");
  const hour = Number(hourValue);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}.${minute}${period}`;
}

export function ScheduleRail({ onCreate }: { onCreate: () => void }) {
  const { showToast } = useToast();
  const [activeDay, setActiveDay] = useState(3);
  const [query, setQuery] = useState("");
  const filteredPeople = people.filter((person) =>
    `${person.name} ${person.email}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <aside className="base-planner-rail" aria-label="Schedule tools">
      <button className="base-primary-button base-planner-create" type="button" onClick={onCreate}>
        <Plus size={19} aria-hidden="true" />
        <span>Create Schedule</span>
      </button>

      <section className="base-mini-calendar" aria-label="December 2021 mini calendar">
        <div className="base-mini-calendar-header">
          <strong>December 2, 2021</strong>
          <span className="base-mini-calendar-controls">
            <button type="button" aria-label="Previous month" onClick={() => showToast("Mini-calendar month navigation is fixed to the Figma demo date.", { tone: "info", title: "Demo calendar" })}>
              <ChevronLeft size={14} />
            </button>
            <button type="button" aria-label="Next month" onClick={() => showToast("Mini-calendar month navigation is fixed to the Figma demo date.", { tone: "info", title: "Demo calendar" })}>
              <ChevronRight size={14} />
            </button>
          </span>
        </div>
        <div className="base-mini-calendar-weekdays" aria-hidden="true">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <span key={`${day}-${index}`}>{day}</span>
          ))}
        </div>
        <div className="base-mini-calendar-grid">
          {miniCalendarDays.map((item, index) => (
            <button
              className={`${item.muted ? "base-is-muted " : ""}${!item.muted && item.day === activeDay ? "base-is-selected" : ""}`.trim()}
              type="button"
              aria-label={`${item.day} December 2021`}
              aria-pressed={!item.muted && item.day === activeDay}
              disabled={item.muted}
              key={`${item.day}-${index}`}
              onClick={() => setActiveDay(item.day)}
            >
              {item.day}
            </button>
          ))}
        </div>
      </section>

      <section className="base-people-panel" aria-labelledby="base-people-heading">
        <h2 id="base-people-heading">People</h2>
        <label className="base-people-search">
          <Search size={14} aria-hidden="true" />
          <span className="base-visually-hidden">Search for people</span>
          <input
            type="search"
            value={query}
            placeholder="Search for People"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <ul className="base-people-list">
          {filteredPeople.map((person) => (
            <li className="base-person-list-item" key={person.id}>
              <button className="base-person-row" type="button" onClick={() => showToast(`People-based filtering for ${person.name} is not connected in this frontend demo.`, { tone: "info", title: "Demo feature" })}>
                <span className={`base-person-avatar base-person-avatar--${person.tone}`} aria-hidden="true">
                  {person.initials}
                </span>
                <span className="base-person-copy">
                  <strong>{person.name}</strong>
                  <small>{person.email}</small>
                </span>
              </button>
            </li>
          ))}
          {filteredPeople.length === 0 ? <li className="base-empty-copy">No people found.</li> : null}
        </ul>
      </section>
    </aside>
  );
}

function ScheduleDialog({
  draft,
  editing,
  onChange,
  onCancel,
  onSave,
}: {
  draft: ScheduleDraft;
  editing: boolean;
  onChange: (next: ScheduleDraft) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="base-modal-backdrop" role="presentation" onMouseDown={onCancel}>
      <section
        className="base-modal base-schedule-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="base-schedule-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="base-modal-header">
          <div>
            <span className="base-modal-kicker">Schedule details</span>
            <h2 id="base-schedule-dialog-title">{editing ? "Edit schedule" : "Create schedule"}</h2>
          </div>
          <button className="base-icon-button" type="button" aria-label="Close" onClick={onCancel}>
            <X size={18} />
          </button>
        </header>

        <div className="base-form-grid">
          <label className="base-field">
            <span>Date</span>
            <span className="base-input-with-icon">
              <CalendarDays size={17} aria-hidden="true" />
              <input
                type="date"
                required
                value={draft.date}
                onChange={(event) => onChange({ ...draft, date: event.target.value })}
              />
            </span>
          </label>
          <label className="base-field">
            <span>Time</span>
            <span className="base-input-with-icon">
              <Clock3 size={17} aria-hidden="true" />
              <input
                type="time"
                required
                value={draft.time}
                onChange={(event) => onChange({ ...draft, time: event.target.value })}
              />
            </span>
          </label>
          <label className="base-field base-field--wide">
            <span>Location</span>
            <span className="base-input-with-icon">
              <MapPin size={17} aria-hidden="true" />
              <input
                type="text"
                required
                value={draft.location}
                placeholder="Office Meeting"
                onChange={(event) => onChange({ ...draft, location: event.target.value })}
              />
            </span>
          </label>
        </div>

        <footer className="base-modal-actions">
          <button className="base-secondary-button" type="button" onClick={onCancel}>Cancel</button>
          <button
            className="base-primary-button"
            type="button"
            disabled={!draft.date || !draft.time || !draft.location.trim()}
            onClick={onSave}
          >
            <Check size={17} aria-hidden="true" />
            {editing ? "Save changes" : "Create schedule"}
          </button>
        </footer>
      </section>
    </div>
  );
}

export function SchedulePage() {
  const { showToast } = useToast();
  const [schedules, setSchedules] = useState(initialSchedules);
  const [selected, setSelected] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ScheduleDraft>({
    date: "2021-12-12",
    time: "10:15",
    location: "Office Meeting",
  });

  useOverlayScrollLock(dialogOpen, () => setDialogOpen(false));

  const allSelected = schedules.length > 0 && selected.length === schedules.length;
  const sortedSchedules = useMemo(
    () => [...schedules].sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)),
    [schedules],
  );

  function openCreate() {
    setEditingId(null);
    setDraft({ date: "2021-12-12", time: "10:15", location: "Office Meeting" });
    setDialogOpen(true);
  }

  function openEdit(schedule: ScheduleEntry) {
    setEditingId(schedule.id);
    setDraft({ date: schedule.date, time: schedule.time, location: schedule.location });
    setDialogOpen(true);
  }

  function saveSchedule() {
    if (!draft.date || !draft.time || !draft.location.trim()) return;
    if (editingId) {
      setSchedules((items) => items.map((item) => item.id === editingId ? { ...item, ...draft } : item));
      showToast("Schedule updated.", { title: "Changes saved" });
    } else {
      setSchedules((items) => [
        ...items,
        { id: `schedule-${Date.now()}`, ...draft, location: draft.location.trim() },
      ]);
      showToast("New schedule created.", { title: "Schedule created" });
    }
    setDialogOpen(false);
  }

  function deleteSchedule(schedule: ScheduleEntry) {
    setSchedules((items) => items.filter((item) => item.id !== schedule.id));
    setSelected((items) => items.filter((id) => id !== schedule.id));
    showToast(`${schedule.location} on ${formatDate(schedule.date)} deleted.`, { title: "Schedule deleted" });
  }

  function toggleSelected(id: string) {
    setSelected((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  }

  return (
    <div className="base-page base-schedule-page">
      <header className="base-page-heading">
        <div>
          <span className="base-eyebrow">Planner</span>
          <h1>Schedule List</h1>
        </div>
        <button className="base-primary-button" type="button" onClick={openCreate}>
          <Plus size={17} aria-hidden="true" />
          Add New
        </button>
      </header>

      <div className="base-planner-layout">
        <ScheduleRail onCreate={openCreate} />

        <main className="base-schedule-content">
          <div className="base-schedule-table-header" aria-hidden="true">
            <span className="base-schedule-select-cell" />
            <span>Date</span>
            <span>Time</span>
            <span>Location</span>
            <span className="base-schedule-actions-cell" />
          </div>
          <div className="base-schedule-master-select">
            <label>
              <input
                type="checkbox"
                checked={allSelected}
                aria-label="Select all schedules"
                onChange={() => setSelected(allSelected ? [] : schedules.map((item) => item.id))}
              />
              <span>{selected.length ? `${selected.length} selected` : "Select all"}</span>
            </label>
          </div>
          <div className="base-schedule-list" role="list" aria-label="Schedules">
            {sortedSchedules.map((schedule) => (
              <article className="base-schedule-row" role="listitem" key={schedule.id}>
                <label className="base-schedule-checkbox">
                  <input
                    type="checkbox"
                    checked={selected.includes(schedule.id)}
                    aria-label={`Select schedule on ${formatDate(schedule.date)}`}
                    onChange={() => toggleSelected(schedule.id)}
                  />
                </label>
                <span className="base-schedule-date">
                  <CalendarDays size={16} aria-hidden="true" />
                  <strong>{formatDate(schedule.date)}</strong>
                </span>
                <span className="base-schedule-time">
                  <Clock3 size={16} aria-hidden="true" />
                  <strong>{formatTime(schedule.time)}</strong>
                </span>
                <span className="base-schedule-location">
                  <MapPin size={17} aria-hidden="true" />
                  {schedule.location}
                </span>
                <span className="base-schedule-actions">
                  <button
                    className="base-row-action base-row-action--edit"
                    type="button"
                    aria-label={`Edit ${schedule.location} schedule`}
                    onClick={() => openEdit(schedule)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="base-row-action base-row-action--delete"
                    type="button"
                    aria-label={`Delete ${schedule.location} schedule`}
                    onClick={() => deleteSchedule(schedule)}
                  >
                    <Trash2 size={16} />
                  </button>
                </span>
              </article>
            ))}
            {sortedSchedules.length === 0 ? (
              <div className="base-empty-state">
                <UserRound size={24} aria-hidden="true" />
                <strong>No schedules yet</strong>
                <p>Create a schedule to add it to this list.</p>
                <button className="base-primary-button" type="button" onClick={openCreate}>Create schedule</button>
              </div>
            ) : null}
          </div>
        </main>
      </div>

      {dialogOpen ? (
        <ScheduleDialog
          draft={draft}
          editing={Boolean(editingId)}
          onChange={setDraft}
          onCancel={() => setDialogOpen(false)}
          onSave={saveSchedule}
        />
      ) : null}
    </div>
  );
}
