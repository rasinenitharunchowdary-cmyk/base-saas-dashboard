"use client";

import {
  BarChart3,
  ChevronLeft,
  Ellipsis,
  FileText,
  LayoutDashboard,
  Paperclip,
  Phone,
  Plus,
  Search,
  Send,
  Smile,
  Video,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "./toast-provider";
import { useOverlayScrollLock } from "./use-overlay-scroll-lock";

type MessageTab = "all" | "personal" | "teams";

type BaseConversation = {
  id: string;
  name: string;
  initials: string;
  preview: string;
  time: string;
  type: Exclude<MessageTab, "all">;
  online: boolean;
  avatarTone: string;
  unread?: number;
};

type ThreadAttachment = {
  id: string;
  name: string;
  kind: "design" | "analytics" | "file";
};

type ThreadMessage = {
  id: string;
  sender: "me" | "them";
  body?: string;
  time: string;
  attachments?: ThreadAttachment[];
};

const initialConversations: BaseConversation[] = [
  {
    id: "shelby",
    name: "Shelby Goode",
    initials: "SG",
    preview: "Lorem Ipsum is simply dummy text of the printing",
    time: "1 min ago",
    type: "personal",
    online: true,
    avatarTone: "sky",
    unread: 2,
  },
  {
    id: "robert",
    name: "Robert Bacins",
    initials: "RB",
    preview: "Lorem Ipsum is simply dummy text of the printing",
    time: "9 min ago",
    type: "personal",
    online: false,
    avatarTone: "rose",
  },
  {
    id: "john",
    name: "John Carilo",
    initials: "JC",
    preview: "Lorem Ipsum is simply dummy text of the printing",
    time: "15 min ago",
    type: "personal",
    online: true,
    avatarTone: "blush",
  },
  {
    id: "adriene",
    name: "Adriene Watson",
    initials: "AW",
    preview: "Lorem Ipsum is simply dummy text of the printing",
    time: "21 min ago",
    type: "personal",
    online: true,
    avatarTone: "lilac",
  },
  {
    id: "jhon",
    name: "Jhon Deo",
    initials: "JD",
    preview: "Lorem Ipsum is simply dummy text of the printing",
    time: "29 min ago",
    type: "personal",
    online: false,
    avatarTone: "aqua",
  },
  {
    id: "mark",
    name: "Mark Ruffalo",
    initials: "MR",
    preview: "Lorem Ipsum is simply dummy text of the printing",
    time: "45 min ago",
    type: "personal",
    online: true,
    avatarTone: "violet",
  },
  {
    id: "design-team",
    name: "Design Team",
    initials: "DT",
    preview: "Robert shared two dashboard directions",
    time: "2 hrs ago",
    type: "teams",
    online: true,
    avatarTone: "indigo",
    unread: 4,
  },
  {
    id: "marketing-team",
    name: "Marketing Team",
    initials: "MT",
    preview: "The campaign brief is ready for review",
    time: "Yesterday",
    type: "teams",
    online: false,
    avatarTone: "peach",
  },
];

const defaultThread: ThreadMessage[] = [
  {
    id: "john-1",
    sender: "me",
    body: "Lorem Ipsum is simply",
    time: "09:01 PM",
  },
  {
    id: "john-2",
    sender: "me",
    body: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    time: "09:02 PM",
  },
  {
    id: "john-3",
    sender: "them",
    time: "09:03 PM",
    attachments: [
      { id: "design-preview", name: "clon-dashboard.png", kind: "design" },
      { id: "analytics-preview", name: "pay-dashboard.png", kind: "analytics" },
    ],
  },
  {
    id: "john-4",
    sender: "me",
    body: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    time: "09:04 PM",
  },
  {
    id: "john-5",
    sender: "them",
    body: "Looks great. I’ll share the final notes in a moment.",
    time: "09:05 PM",
  },
];

function makeInitialThreads() {
  return Object.fromEntries(
    initialConversations.map((conversation) => [
      conversation.id,
      conversation.id === "john"
        ? defaultThread
        : [
            {
              id: `${conversation.id}-1`,
              sender: "them" as const,
              body: conversation.preview,
              time: conversation.time,
            },
          ],
    ]),
  );
}

function BaseMessageAvatar({
  conversation,
  small = false,
}: {
  conversation: BaseConversation;
  small?: boolean;
}) {
  return (
    <span className={`base-message-avatar base-message-avatar-${conversation.avatarTone} ${small ? "base-message-avatar-small" : ""}`}>
      <span aria-hidden="true">{conversation.initials}</span>
      <span className={conversation.online ? "base-message-online" : "base-message-offline"} aria-label={conversation.online ? "Online" : "Offline"} />
    </span>
  );
}

function AttachmentPreview({ attachment }: { attachment: ThreadAttachment }) {
  if (attachment.kind === "file") {
    return (
      <span className="base-message-file-preview">
        <FileText size={21} aria-hidden="true" />
        <span><strong>{attachment.name}</strong><small>Attached file</small></span>
      </span>
    );
  }

  return (
    <span className={`base-message-image-preview base-message-image-${attachment.kind}`}>
      <span className="base-message-image-toolbar"><i /><i /><i /></span>
      <span className="base-message-image-layout">
        <span className="base-message-image-side" />
        <span className="base-message-image-main">
          <span className="base-message-image-title">
            {attachment.kind === "design" ? <LayoutDashboard size={15} /> : <BarChart3 size={15} />}
          </span>
          <span className="base-message-image-cards"><i /><i /><i /></span>
          <span className="base-message-image-chart"><i /><i /><i /><i /></span>
        </span>
      </span>
      <span className="base-sr-only">Preview of {attachment.name}</span>
    </span>
  );
}

export function MessagesPage() {
  const { showToast } = useToast();
  const [conversations, setConversations] = useState(initialConversations);
  const [threads, setThreads] = useState<Record<string, ThreadMessage[]>>(makeInitialThreads);
  const [selectedId, setSelectedId] = useState("john");
  const [tab, setTab] = useState<MessageTab>("personal");
  const [search, setSearch] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [threadOpen, setThreadOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const threadScrollRef = useRef<HTMLDivElement>(null);

  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedId) ?? conversations[0];
  const currentThread = threads[selectedConversation.id] ?? [];
  const currentDraft = drafts[selectedConversation.id] ?? "";

  useOverlayScrollLock(newMessageOpen, () => setNewMessageOpen(false));

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const thread = threadScrollRef.current;
    thread?.scrollTo({
      top: thread.scrollHeight,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [currentThread.length, selectedId]);

  const visibleConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return conversations.filter((conversation) => {
      const matchesTab = tab === "all" || conversation.type === tab;
      const matchesSearch =
        !query ||
        `${conversation.name} ${conversation.preview}`.toLowerCase().includes(query);
      return matchesTab && matchesSearch;
    });
  }, [conversations, search, tab]);

  function selectConversation(id: string) {
    setSelectedId(id);
    setThreadOpen(true);
    setAttachedFile(null);
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === id ? { ...conversation, unread: 0 } : conversation,
      ),
    );
  }

  function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = currentDraft.trim();
    if (!text && !attachedFile) return;
    const now = new Date();
    const message: ThreadMessage = {
      id: `local-${Date.now()}`,
      sender: "me",
      body: text || undefined,
      time: new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(now),
      attachments: attachedFile
        ? [{ id: `file-${Date.now()}`, name: attachedFile.name, kind: "file" }]
        : undefined,
    };
    setThreads((current) => ({
      ...current,
      [selectedConversation.id]: [...(current[selectedConversation.id] ?? []), message],
    }));
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === selectedConversation.id
          ? {
              ...conversation,
              preview: text || `Shared ${attachedFile?.name}`,
              time: "Now",
            }
          : conversation,
      ),
    );
    setDrafts((current) => ({ ...current, [selectedConversation.id]: "" }));
    setAttachedFile(null);
  }

  function createConversation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newContactName.trim();
    if (!name) return;
    const id = `conversation-${Date.now()}`;
    const next: BaseConversation = {
      id,
      name,
      initials: name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
      preview: "Start a new conversation",
      time: "Now",
      type: "personal",
      online: false,
      avatarTone: "lilac",
    };
    setConversations((current) => [next, ...current]);
    setThreads((current) => ({ ...current, [id]: [] }));
    setSelectedId(id);
    setTab("personal");
    setThreadOpen(true);
    setNewContactName("");
    setNewMessageOpen(false);
    showToast(`Conversation with ${name} created.`);
  }

  return (
    <section className={`base-messages-page ${threadOpen ? "base-messages-thread-open" : ""}`} aria-label="Messages">
      <aside className="base-messages-list-card" aria-label="Conversations">
        <header className="base-messages-list-header">
          <h1>Message</h1>
          <button
            type="button"
            className="base-messages-new-button"
            aria-label="Start a new message"
            onClick={() => setNewMessageOpen(true)}
          >
            <Plus size={20} />
          </button>
        </header>

        <label className="base-messages-search">
          <Search size={15} aria-hidden="true" />
          <span className="base-sr-only">Search conversations</span>
          <input
            type="search"
            placeholder="Search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {search && (
            <button type="button" aria-label="Clear search" onClick={() => setSearch("")}>
              <X size={13} />
            </button>
          )}
        </label>

        <div className="base-messages-tabs" role="tablist" aria-label="Conversation type">
          {(["all", "personal", "teams"] as MessageTab[]).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={tab === item}
              className={tab === item ? "base-messages-tab-active" : ""}
              onClick={() => setTab(item)}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        <div className="base-messages-conversations">
          {visibleConversations.map((conversation) => (
            <button
              type="button"
              key={conversation.id}
              className={`base-messages-conversation ${selectedId === conversation.id ? "base-messages-conversation-active" : ""}`}
              onClick={() => selectConversation(conversation.id)}
              aria-current={selectedId === conversation.id ? "true" : undefined}
            >
              <BaseMessageAvatar conversation={conversation} />
              <span className="base-messages-conversation-copy">
                <span className="base-messages-conversation-line">
                  <strong>{conversation.name}</strong>
                  <time>{conversation.time}</time>
                </span>
                <span className="base-messages-conversation-preview">
                  <span>{conversation.preview}</span>
                  {!!conversation.unread && <b aria-label={`${conversation.unread} unread messages`}>{conversation.unread}</b>}
                </span>
              </span>
            </button>
          ))}
          {visibleConversations.length === 0 && (
            <div className="base-messages-empty-list">
              <Search size={22} aria-hidden="true" />
              <strong>No conversations</strong>
              <p>Try another name or choose a different tab.</p>
              <button type="button" onClick={() => { setSearch(""); setTab("all"); }}>Clear filters</button>
            </div>
          )}
        </div>
      </aside>

      <main className="base-message-thread-card" aria-label={`Conversation with ${selectedConversation.name}`}>
        <header className="base-message-thread-header">
          <button
            type="button"
            className="base-message-mobile-back"
            aria-label="Back to conversation list"
            onClick={() => setThreadOpen(false)}
          >
            <ChevronLeft size={20} />
          </button>
          <BaseMessageAvatar conversation={selectedConversation} small />
          <span className="base-message-thread-person">
            <strong>{selectedConversation.name}</strong>
            <small>{selectedConversation.online ? "Online" : "Offline"}</small>
          </span>
          <div className="base-message-call-actions">
            <button type="button" aria-label={`Call ${selectedConversation.name}`} onClick={() => showToast("Calling is not connected in this frontend demo.", { tone: "info", title: "Demo feature" })}>
              <Phone size={18} />
            </button>
            <button type="button" aria-label={`Video call ${selectedConversation.name}`} onClick={() => showToast("Video calling is not connected in this frontend demo.", { tone: "info", title: "Demo feature" })}>
              <Video size={18} />
            </button>
            <span className="base-message-thread-menu-wrap">
              <button
                type="button"
                aria-label="Conversation options"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((current) => !current)}
              >
                <Ellipsis size={19} />
              </button>
              {menuOpen && (
                <span className="base-message-thread-menu" role="menu">
                  <button type="button" role="menuitem" onClick={() => { showToast("Profile details are not connected in this frontend demo.", { tone: "info", title: "Demo feature" }); setMenuOpen(false); }}>View profile</button>
                  <button type="button" role="menuitem" onClick={() => { showToast("Mute controls are not connected in this frontend demo.", { tone: "info", title: "Demo feature" }); setMenuOpen(false); }}>Mute conversation</button>
                </span>
              )}
            </span>
          </div>
        </header>

        <div ref={threadScrollRef} className="base-message-thread-scroll" aria-live="polite">
          {currentThread.length === 0 && (
            <div className="base-message-empty-thread">
              <BaseMessageAvatar conversation={selectedConversation} />
              <strong>Start a conversation with {selectedConversation.name}</strong>
              <p>Messages you send will appear here.</p>
            </div>
          )}
          {currentThread.map((message) => (
            <article
              key={message.id}
              className={`base-message-row ${message.sender === "me" ? "base-message-row-outgoing" : "base-message-row-incoming"}`}
            >
              {message.sender === "them" && <BaseMessageAvatar conversation={selectedConversation} small />}
              <div className="base-message-content">
                {message.body && <p className="base-message-bubble">{message.body}</p>}
                {message.attachments && (
                  <div className="base-message-attachments">
                    {message.attachments.map((attachment) => (
                      <button
                        type="button"
                        key={attachment.id}
                        aria-label={`Open ${attachment.name}`}
                        onClick={() => showToast("Attachment preview is not connected in this frontend demo.", { tone: "info", title: attachment.name })}
                      >
                        <AttachmentPreview attachment={attachment} />
                      </button>
                    ))}
                  </div>
                )}
                <span className="base-message-meta">
                  <time>{message.time}</time>
                  {message.sender === "me" && <span aria-label="Delivered">✓✓</span>}
                </span>
              </div>
              <button type="button" className="base-message-item-menu" aria-label="Message options" onClick={() => showToast("Message actions are not connected in this frontend demo.", { tone: "info", title: "Demo feature" })}>
                <Ellipsis size={15} />
              </button>
            </article>
          ))}
        </div>

        <form className="base-message-composer" onSubmit={sendMessage}>
          {attachedFile && (
            <div className="base-message-composer-file">
              <FileText size={15} aria-hidden="true" />
              <span>{attachedFile.name}</span>
              <button type="button" aria-label={`Remove ${attachedFile.name}`} onClick={() => setAttachedFile(null)}><X size={13} /></button>
            </div>
          )}
          <label>
            <span className="base-sr-only">Message {selectedConversation.name}</span>
            <textarea
              rows={2}
              placeholder="Type your message..."
              value={currentDraft}
              onChange={(event) => setDrafts((current) => ({ ...current, [selectedConversation.id]: event.target.value }))}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
            />
          </label>
          <div className="base-message-composer-tools">
            <div>
              <input
                ref={fileInputRef}
                className="base-sr-only"
                type="file"
                onChange={(event) => setAttachedFile(event.target.files?.[0] ?? null)}
              />
              <button type="button" aria-label="Attach a file" onClick={() => fileInputRef.current?.click()}><Paperclip size={18} /></button>
              <button
                type="button"
                aria-label="Add smile emoji"
                onClick={() => setDrafts((current) => ({ ...current, [selectedConversation.id]: `${current[selectedConversation.id] ?? ""} 🙂` }))}
              ><Smile size={18} /></button>
            </div>
            <button type="submit" className="base-message-send" aria-label="Send message" disabled={!currentDraft.trim() && !attachedFile}>
              <Send size={18} />
            </button>
          </div>
        </form>
      </main>

      {newMessageOpen && (
        <div className="base-message-modal-layer">
          <button type="button" className="base-message-modal-scrim" aria-label="Close new message dialog" onClick={() => setNewMessageOpen(false)} />
          <div className="base-message-new-dialog" role="dialog" aria-modal="true" aria-labelledby="base-new-message-title">
            <header>
              <div><span>New conversation</span><h2 id="base-new-message-title">Start a message</h2></div>
              <button type="button" aria-label="Close new message dialog" onClick={() => setNewMessageOpen(false)}><X size={18} /></button>
            </header>
            <form onSubmit={createConversation}>
              <label>
                <span>Recipient name</span>
                <input autoFocus required placeholder="e.g. Alison Green" value={newContactName} onChange={(event) => setNewContactName(event.target.value)} />
              </label>
              <div className="base-message-modal-actions">
                <button type="button" className="base-secondary-button" onClick={() => setNewMessageOpen(false)}>Cancel</button>
                <button type="submit" className="base-primary-button">Start chat</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
}
