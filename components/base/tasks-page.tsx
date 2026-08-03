"use client";

import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  Code2,
  Filter,
  Heart,
  ImageIcon,
  LayoutDashboard,
  MessageCircle,
  MoreHorizontal,
  Paintbrush,
  Palette,
  PenTool,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useToast } from "./toast-provider";
import { useOverlayScrollLock } from "./use-overlay-scroll-lock";

type TaskView = "list" | "board" | "timeline";
type TaskStage = "todo" | "doing" | "review" | "done";
type TaskPriority = "Low" | "Medium" | "High";
type TaskHealth = "On Track" | "At risk" | "";
type TaskTool = "figma" | "illustrator" | "photoshop" | "code" | "dashboard" | "shop" | "image";
type TaskSort = "name" | "startDate" | "endDate";

type Task = {
  id: string;
  name: string;
  description: string;
  stage: TaskStage;
  priority: TaskPriority;
  health: TaskHealth;
  startDate: string;
  endDate: string;
  members: string[];
  completed: boolean;
  comments: number;
  likes: string;
  tool: TaskTool;
  startHour: number;
  duration: number;
  hasPreview?: boolean;
};

const stageMeta: Record<TaskStage, { listLabel: string; boardLabel: string; statusLabel: string }> = {
  todo: { listLabel: "To Do", boardLabel: "ToDo", statusLabel: "Pending" },
  doing: { listLabel: "Doing", boardLabel: "In Progress", statusLabel: "Running" },
  review: { listLabel: "In Review", boardLabel: "In Review", statusLabel: "Review" },
  done: { listLabel: "Done", boardLabel: "Done", statusLabel: "Completed" },
};

const stageOrder: TaskStage[] = ["todo", "doing", "review", "done"];
const priorityOrder: TaskPriority[] = ["Low", "Medium", "High"];
const memberPool = ["AL", "EV", "MT", "SK", "JL", "AR"];

const toolIcons: Record<TaskTool, LucideIcon> = {
  figma: PenTool,
  illustrator: Palette,
  photoshop: ImageIcon,
  code: Code2,
  dashboard: LayoutDashboard,
  shop: ShoppingBag,
  image: Paintbrush,
};

const initialTasks: Task[] = [
  {
    id: "task-ui",
    name: "Ui Design",
    description: "Discussion for management dashboard ui design",
    stage: "todo",
    priority: "Low",
    health: "On Track",
    startDate: "2021-12-03",
    endDate: "2021-12-05",
    members: ["AL", "EV", "MT", "SK", "JL"],
    completed: false,
    comments: 112,
    likes: "1.2k",
    tool: "figma",
    startHour: 9,
    duration: 2,
  },
  {
    id: "task-logo",
    name: "Logo Design",
    description: "Discussion for management dashboard ui design",
    stage: "todo",
    priority: "Medium",
    health: "At risk",
    startDate: "2021-12-03",
    endDate: "2021-12-05",
    members: ["SK", "JL", "EV", "AL"],
    completed: false,
    comments: 86,
    likes: "900",
    tool: "illustrator",
    startHour: 13,
    duration: 2,
  },
  {
    id: "task-shop",
    name: "E-Shop Mobile App",
    description: "Mobile commerce interaction and checkout design",
    stage: "todo",
    priority: "High",
    health: "",
    startDate: "2021-12-04",
    endDate: "2021-12-08",
    members: ["MT", "SK", "AR"],
    completed: false,
    comments: 64,
    likes: "760",
    tool: "shop",
    startHour: 14,
    duration: 3,
  },
  {
    id: "task-graphic",
    name: "Graphic Design",
    description: "Discussion for management dashboard ui design",
    stage: "doing",
    priority: "Low",
    health: "On Track",
    startDate: "2021-12-03",
    endDate: "2021-12-05",
    members: ["AL", "EV", "MT", "SK"],
    completed: true,
    comments: 112,
    likes: "1.2k",
    tool: "photoshop",
    startHour: 9,
    duration: 2,
  },
  {
    id: "task-web",
    name: "Web Design",
    description: "Responsive web screens and reusable components",
    stage: "doing",
    priority: "High",
    health: "On Track",
    startDate: "2021-12-03",
    endDate: "2021-12-05",
    members: ["EV", "MT", "JL", "AR"],
    completed: true,
    comments: 74,
    likes: "980",
    tool: "code",
    startHour: 15,
    duration: 2,
    hasPreview: true,
  },
  {
    id: "task-dashboard",
    name: "Dashboard Design",
    description: "Discussion for management dashboard ui design",
    stage: "review",
    priority: "Medium",
    health: "",
    startDate: "2021-12-02",
    endDate: "2021-12-06",
    members: ["AL", "EV", "MT", "SK", "JL"],
    completed: true,
    comments: 112,
    likes: "1.2k",
    tool: "dashboard",
    startHour: 11,
    duration: 3,
    hasPreview: true,
  },
  {
    id: "task-landing",
    name: "Landing page Design",
    description: "Campaign landing page exploration and handoff",
    stage: "doing",
    priority: "Low",
    health: "",
    startDate: "2021-12-04",
    endDate: "2021-12-09",
    members: ["SK", "MT", "JL"],
    completed: true,
    comments: 53,
    likes: "640",
    tool: "image",
    startHour: 12,
    duration: 3,
    hasPreview: true,
  },
  {
    id: "task-crm",
    name: "CRM Dashboard",
    description: "Customer activity, pipeline and reporting dashboard",
    stage: "done",
    priority: "High",
    health: "On Track",
    startDate: "2021-11-28",
    endDate: "2021-12-02",
    members: ["AL", "EV", "AR", "JL"],
    completed: true,
    comments: 98,
    likes: "1.1k",
    tool: "dashboard",
    startHour: 11,
    duration: 2,
    hasPreview: true,
  },
  {
    id: "task-wireframe",
    name: "App Wireframe",
    description: "Core mobile user flows and interaction map",
    stage: "done",
    priority: "Medium",
    health: "On Track",
    startDate: "2021-11-26",
    endDate: "2021-12-01",
    members: ["MT", "SK", "EV"],
    completed: true,
    comments: 41,
    likes: "520",
    tool: "figma",
    startHour: 14,
    duration: 2,
  },
];

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${month}/${day}/${year}`;
}

function TaskIcon({ tool }: { tool: TaskTool }) {
  const Icon = toolIcons[tool];
  return <span className={`base-task-tool base-task-tool-${tool}`} aria-hidden="true"><Icon size={13} /></span>;
}

function TaskCheck({ task, onToggle }: { task: Task; onToggle: () => void }) {
  return (
    <button
      className={`base-task-check ${task.completed ? "base-task-check-complete" : ""}`}
      type="button"
      aria-label={`${task.completed ? "Uncheck" : "Check"} ${task.name}`}
      aria-pressed={task.completed}
      onClick={onToggle}
    >
      {task.completed ? <Check size={13} /> : <Circle size={18} />}
    </button>
  );
}

function MemberStack({ members }: { members: string[] }) {
  const visible = members.slice(0, 4);
  return (
    <span className="base-task-members" aria-label={`${members.length} members`}>
      {visible.map((member, index) => (
        <span
          key={`${member}-${index}`}
          className="base-task-member"
          style={{ backgroundImage: `url(https://i.pravatar.cc/64?img=${index + 10})` }}
          title={member}
        >{member}</span>
      ))}
      <span className="base-task-member-add" aria-hidden="true"><Plus size={13} /></span>
    </span>
  );
}

function TaskMenu({
  task,
  open,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Task;
  open: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <span className="base-task-menu-wrap">
      <button type="button" aria-label={`Actions for ${task.name}`} aria-expanded={open} onClick={onToggle}><MoreHorizontal size={17} /></button>
      {open && (
        <span className="base-task-menu" role="menu">
          <button type="button" role="menuitem" onClick={onEdit}><Pencil size={13} /> Edit</button>
          <button className="base-task-menu-delete" type="button" role="menuitem" onClick={onDelete}><Trash2 size={13} /> Delete</button>
        </span>
      )}
    </span>
  );
}

function TaskListRow({
  task,
  menuOpen,
  onToggle,
  onMenu,
  onEdit,
  onDelete,
}: {
  task: Task;
  menuOpen: boolean;
  onToggle: () => void;
  onMenu: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <tr>
      <td><TaskCheck task={task} onToggle={onToggle} /></td>
      <td><button className="base-task-list-name" type="button" onClick={onEdit}><TaskIcon tool={task.tool} /><span>{task.name}</span></button></td>
      <td>{formatDate(task.startDate)}</td>
      <td className="base-task-list-end-date">{formatDate(task.endDate)}</td>
      <td>{task.members.length} Member</td>
      <td><span className={`base-task-status base-task-status-${task.stage}`}>{stageMeta[task.stage].statusLabel}</span></td>
      <td>
        <span className="base-task-list-actions">
          <button className="base-task-edit-button" type="button" aria-label={`Edit ${task.name}`} onClick={onEdit}><Pencil size={13} /></button>
          <button className="base-task-delete-button" type="button" aria-label={`Delete ${task.name}`} onClick={onDelete}><Trash2 size={13} /></button>
          <TaskMenu task={task} open={menuOpen} onToggle={onMenu} onEdit={onEdit} onDelete={onDelete} />
        </span>
      </td>
    </tr>
  );
}

function BoardCard({
  task,
  menuOpen,
  onToggle,
  onMenu,
  onEdit,
  onDelete,
}: {
  task: Task;
  menuOpen: boolean;
  onToggle: () => void;
  onMenu: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="base-task-board-card">
      <div className="base-task-board-card-header">
        <span><TaskCheck task={task} onToggle={onToggle} /><button className="base-task-board-title" type="button" onClick={onEdit}>{task.name}</button></span>
        <TaskMenu task={task} open={menuOpen} onToggle={onMenu} onEdit={onEdit} onDelete={onDelete} />
      </div>
      <div className="base-task-board-labels">
        <span className={`base-task-priority base-task-priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
        {task.health && <span className={`base-task-health ${task.health === "At risk" ? "base-task-health-risk" : ""}`}>{task.health}</span>}
      </div>
      <p>{task.description}</p>
      {task.hasPreview && (
        <div className="base-task-card-previews" aria-label="Task attachments">
          <span><LayoutDashboard size={28} /><small>Dashboard</small></span>
          <span><Palette size={28} /><small>Artwork</small></span>
        </div>
      )}
      <div className="base-task-board-card-footer">
        <MemberStack members={task.members} />
        <span className="base-task-social"><span><MessageCircle size={14} /> {task.comments}</span><span><Heart size={14} /> {task.likes}</span></span>
      </div>
    </article>
  );
}

function TaskFormModal({
  task,
  onClose,
  onSave,
}: {
  task?: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const memberCount = Math.max(1, Number(data.get("memberCount") ?? 1));
    onSave({
      id: task?.id ?? `task-${Date.now()}`,
      name: String(data.get("name") ?? "").trim(),
      description: String(data.get("description") ?? "").trim(),
      stage: String(data.get("stage") ?? "todo") as TaskStage,
      priority: String(data.get("priority") ?? "Medium") as TaskPriority,
      health: String(data.get("health") ?? "") as TaskHealth,
      startDate: String(data.get("startDate") ?? "2021-12-02"),
      endDate: String(data.get("endDate") ?? "2021-12-05"),
      members: memberPool.slice(0, memberCount),
      completed: task?.completed ?? false,
      comments: task?.comments ?? 0,
      likes: task?.likes ?? "0",
      tool: String(data.get("tool") ?? "figma") as TaskTool,
      startHour: Number(data.get("startHour") ?? 10),
      duration: Number(data.get("duration") ?? 2),
      hasPreview: task?.hasPreview ?? false,
    });
  }

  return (
    <div className="base-task-modal-layer" role="presentation" onMouseDown={onClose}>
      <section className="base-task-modal" role="dialog" aria-modal="true" aria-labelledby="base-task-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="base-task-modal-header">
          <div><span>{task ? "Update work" : "New work"}</span><h2 id="base-task-modal-title">{task ? "Edit Task" : "Add Task"}</h2><p>Define the task, schedule, owner group, and delivery status.</p></div>
          <button type="button" aria-label="Close task form" onClick={onClose}><X size={18} /></button>
        </header>
        <form className="base-task-form" onSubmit={submit}>
          <label className="base-task-form-wide"><span>Task Name</span><input name="name" required autoFocus defaultValue={task?.name ?? ""} placeholder="Dashboard Design" /></label>
          <label className="base-task-form-wide"><span>Description</span><textarea name="description" required rows={3} defaultValue={task?.description ?? ""} placeholder="Describe the work to be completed" /></label>
          <div className="base-task-form-grid">
            <label><span>Start Date</span><input name="startDate" type="date" required defaultValue={task?.startDate ?? "2021-12-02"} /></label>
            <label><span>End Date</span><input name="endDate" type="date" required defaultValue={task?.endDate ?? "2021-12-05"} /></label>
            <label><span>Stage</span><select name="stage" defaultValue={task?.stage ?? "todo"}>{stageOrder.map((stage) => <option key={stage} value={stage}>{stageMeta[stage].boardLabel}</option>)}</select></label>
            <label><span>Priority</span><select name="priority" defaultValue={task?.priority ?? "Medium"}>{priorityOrder.map((priority) => <option key={priority}>{priority}</option>)}</select></label>
            <label><span>Health</span><select name="health" defaultValue={task?.health ?? "On Track"}><option value="">No label</option><option>On Track</option><option>At risk</option></select></label>
            <label><span>Members</span><input name="memberCount" type="number" min="1" max={memberPool.length} defaultValue={task?.members.length ?? 4} /></label>
            <label><span>Start Time</span><select name="startHour" defaultValue={task?.startHour ?? 10}>{[9, 10, 11, 12, 13, 14, 15].map((hour) => <option key={hour} value={hour}>{hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? "PM" : "AM"}</option>)}</select></label>
            <label><span>Duration</span><select name="duration" defaultValue={task?.duration ?? 2}><option value="1">1 hour</option><option value="2">2 hours</option><option value="3">3 hours</option></select></label>
            <label className="base-task-form-wide"><span>Task Type</span><select name="tool" defaultValue={task?.tool ?? "figma"}><option value="figma">Figma design</option><option value="illustrator">Illustration</option><option value="photoshop">Graphic design</option><option value="code">Web development</option><option value="dashboard">Dashboard</option><option value="shop">Mobile commerce</option><option value="image">Visual design</option></select></label>
          </div>
          <div className="base-task-form-actions">
            <button className="base-button-secondary" type="button" onClick={onClose}>Cancel</button>
            <button className="base-button-primary" type="submit"><Plus size={16} /> {task ? "Save Task" : "Add Task"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export function TasksPage() {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [view, setView] = useState<TaskView>("list");
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<TaskStage | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState<{ key: TaskSort; direction: "asc" | "desc" }>({ key: "startDate", direction: "asc" });
  const [menuId, setMenuId] = useState<string | null>(null);
  const [formTaskId, setFormTaskId] = useState<string | "new" | null>(null);
  const [timelineStage, setTimelineStage] = useState<TaskStage | "all">("all");

  const filteredTasks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return tasks
      .filter((task) => {
        const matchesQuery = !normalized || `${task.name} ${task.description}`.toLowerCase().includes(normalized);
        return matchesQuery && (stageFilter === "all" || task.stage === stageFilter) && (priorityFilter === "all" || task.priority === priorityFilter);
      })
      .sort((left, right) => {
        const compared = left[sort.key].localeCompare(right[sort.key]);
        return sort.direction === "asc" ? compared : -compared;
      });
  }, [priorityFilter, query, sort, stageFilter, tasks]);

  const formTask = formTaskId && formTaskId !== "new" ? tasks.find((task) => task.id === formTaskId) : undefined;

  useOverlayScrollLock(Boolean(formTaskId), () => setFormTaskId(null));

  useEffect(() => {
    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuId(null);
        setFilterOpen(false);
      }
    }
    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, []);

  function toggleTask(id: string) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, completed: !task.completed } : task));
  }

  function deleteTask(task: Task) {
    setTasks((current) => current.filter((item) => item.id !== task.id));
    setMenuId(null);
    showToast(`${task.name} deleted.`, { title: "Task deleted" });
  }

  function saveTask(task: Task) {
    const exists = tasks.some((item) => item.id === task.id);
    setTasks((current) => exists ? current.map((item) => item.id === task.id ? task : item) : [task, ...current]);
    setFormTaskId(null);
    showToast(`${task.name} ${exists ? "updated" : "added"}.`, { title: exists ? "Task updated" : "Task added" });
  }

  function sortBy(key: TaskSort) {
    setSort((current) => current.key === key
      ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
      : { key, direction: "asc" });
  }

  const timelineTasks = filteredTasks.filter((task) => timelineStage === "all" || task.stage === timelineStage).slice(0, 5);
  const timelineDays = ["29", "30", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14"];
  const timeLabels = ["09.00 AM", "10.00 AM", "11.00 AM", "12.00 PM", "01.00 PM", "02.00 PM", "03.00 PM", "04.00 PM"];

  return (
    <div className="base-tasks-page">
      <header className="base-tasks-header">
        <div><span className="base-tasks-eyebrow">Schedule</span><h1>Task Preview</h1></div>
        <button className="base-button-primary" type="button" onClick={() => setFormTaskId("new")}><Plus size={17} /> Add Task</button>
      </header>

      <div className="base-tasks-control-row">
        <div className="base-task-view-switcher" role="group" aria-label="Task view">
          {(["list", "board", "timeline"] as TaskView[]).map((option) => (
            <button key={option} type="button" className={view === option ? "base-task-view-active" : ""} aria-pressed={view === option} onClick={() => setView(option)}>
              {option[0].toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>

        {view === "timeline" ? (
          <label className="base-task-month-select">
            <CalendarDays size={15} aria-hidden="true" />
            <span className="base-sr-only">Timeline month</span>
            <select defaultValue="december-2021" aria-label="Timeline month"><option value="december-2021">December 2021</option><option value="january-2022">January 2022</option></select>
            <ChevronDown size={14} aria-hidden="true" />
          </label>
        ) : (
          <div className="base-task-search-filter">
            <label className="base-task-search">
              <span className="base-sr-only">Search tasks</span>
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" />
              <Search size={16} aria-hidden="true" />
            </label>
            <div className="base-task-filter-wrap">
              <button className="base-button-primary base-task-filter-button" type="button" aria-expanded={filterOpen} onClick={() => setFilterOpen((open) => !open)}>
                Filter <Filter size={16} />
              </button>
              {filterOpen && (
                <div className="base-task-filter-panel">
                  <label><span>Stage</span><select value={stageFilter} onChange={(event) => setStageFilter(event.target.value as TaskStage | "all")}><option value="all">All stages</option>{stageOrder.map((stage) => <option key={stage} value={stage}>{stageMeta[stage].boardLabel}</option>)}</select></label>
                  <label><span>Priority</span><select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as TaskPriority | "all")}><option value="all">All priorities</option>{priorityOrder.map((priority) => <option key={priority}>{priority}</option>)}</select></label>
                  <button type="button" onClick={() => { setStageFilter("all"); setPriorityFilter("all"); }}>Clear filters</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {view === "list" && (
        <div className="base-task-list-view">
          {stageOrder.map((stage) => {
            const stageTasks = filteredTasks.filter((task) => task.stage === stage);
            if (!stageTasks.length && (query || stageFilter !== "all" || priorityFilter !== "all")) return null;
            return (
              <section className="base-task-list-section" key={stage} aria-labelledby={`base-task-list-${stage}`}>
                <header><h2 id={`base-task-list-${stage}`}>{stageMeta[stage].listLabel}</h2><button type="button" onClick={() => setStageFilter(stage)}>See More</button></header>
                <div className="base-task-table-wrap" role="region" aria-label="Tasks table" tabIndex={0}>
                  <table className="base-task-table">
                    <caption className="base-sr-only">{stageMeta[stage].listLabel} tasks</caption>
                    <thead><tr><th scope="col">Check Box</th><th scope="col"><button type="button" onClick={() => sortBy("name")}>Task Name <ChevronDown size={10} /></button></th><th scope="col"><button type="button" onClick={() => sortBy("startDate")}>Start Date <ChevronDown size={10} /></button></th><th scope="col"><button type="button" onClick={() => sortBy("endDate")}>End Date <ChevronDown size={10} /></button></th><th scope="col">Member <ChevronDown size={10} /></th><th scope="col">Status <ChevronDown size={10} /></th><th scope="col">Actions</th></tr></thead>
                    <tbody>
                      {stageTasks.map((task) => (
                        <TaskListRow
                          key={task.id}
                          task={task}
                          menuOpen={menuId === task.id}
                          onToggle={() => toggleTask(task.id)}
                          onMenu={() => setMenuId((current) => current === task.id ? null : task.id)}
                          onEdit={() => { setFormTaskId(task.id); setMenuId(null); }}
                          onDelete={() => deleteTask(task)}
                        />
                      ))}
                    </tbody>
                  </table>
                  {stageTasks.length === 0 && <p className="base-task-stage-empty">No {stageMeta[stage].listLabel.toLowerCase()} tasks.</p>}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {view === "board" && (
        <div className="base-task-board-view" aria-label="Task board">
          {stageOrder.map((stage) => {
            const stageTasks = filteredTasks.filter((task) => task.stage === stage);
            return (
              <section className={`base-task-board-column base-task-board-column-${stage}`} key={stage} aria-labelledby={`base-task-board-${stage}`}>
                <header><h2 id={`base-task-board-${stage}`}>{stageMeta[stage].boardLabel}</h2><span>{stageTasks.length}</span></header>
                <div className="base-task-board-stack">
                  {stageTasks.map((task) => (
                    <BoardCard
                      key={task.id}
                      task={task}
                      menuOpen={menuId === task.id}
                      onToggle={() => toggleTask(task.id)}
                      onMenu={() => setMenuId((current) => current === task.id ? null : task.id)}
                      onEdit={() => { setFormTaskId(task.id); setMenuId(null); }}
                      onDelete={() => deleteTask(task)}
                    />
                  ))}
                  {stageTasks.length === 0 && <button className="base-task-board-add" type="button" onClick={() => setFormTaskId("new")}><Plus size={15} /> Add a task</button>}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {view === "timeline" && (
        <div className="base-task-timeline-view">
          <aside className="base-task-timeline-sidebar" aria-label="Timeline groups">
            {(["all", "doing", "done"] as Array<TaskStage | "all">).map((stage, index) => (
              <button key={stage} type="button" className={timelineStage === stage ? "base-task-timeline-group-active" : ""} aria-pressed={timelineStage === stage} onClick={() => setTimelineStage(stage)}>
                {index === 0 ? "To Do" : stage === "doing" ? "Doing" : "Done"}<ChevronRight size={14} />
              </button>
            ))}
          </aside>
          <section className="base-task-timeline" aria-label="December 2021 task timeline">
            <div className="base-task-timeline-days">
              {timelineDays.map((day, index) => <span key={`${day}-${index}`} className={day === "02" ? "base-task-timeline-day-active" : ""}>{day}</span>)}
            </div>
            <div className="base-task-timeline-grid">
              <div className="base-task-time-labels">{timeLabels.map((label) => <span key={label}>{label}</span>)}</div>
              <div className="base-task-time-canvas">
                {timeLabels.map((label) => <span className="base-task-time-line" key={label} />)}
                {timelineTasks.map((task, index) => {
                  const top = Math.max(0, task.startHour - 9) * 72 + 14;
                  const left = [4, 20, 4, 36, 52][index] ?? 12;
                  const width = Math.min(58, 38 + task.duration * 5);
                  return (
                    <article className="base-task-timeline-item" key={task.id} style={{ top: `${top}px`, left: `${left}%`, width: `${width}%` }}>
                      <TaskCheck task={task} onToggle={() => toggleTask(task.id)} />
                      <button className="base-task-timeline-name" type="button" onClick={() => setFormTaskId(task.id)}>{task.name}</button>
                      <MemberStack members={task.members} />
                      <span className={`base-task-priority base-task-priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                      {task.health && <span className={`base-task-health ${task.health === "At risk" ? "base-task-health-risk" : ""}`}>{task.health}</span>}
                      <TaskMenu task={task} open={menuId === task.id} onToggle={() => setMenuId((current) => current === task.id ? null : task.id)} onEdit={() => setFormTaskId(task.id)} onDelete={() => deleteTask(task)} />
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      )}

      {filteredTasks.length === 0 && (
        <div className="base-task-empty"><Search size={23} /><h2>No tasks found</h2><p>Try a different search or clear your filters.</p><button className="base-button-secondary" type="button" onClick={() => { setQuery(""); setStageFilter("all"); setPriorityFilter("all"); }}>Clear filters</button></div>
      )}

      {formTaskId && <TaskFormModal task={formTask} onClose={() => setFormTaskId(null)} onSave={saveTask} />}
    </div>
  );
}

export default TasksPage;
