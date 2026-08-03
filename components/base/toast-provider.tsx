"use client";

import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type ToastTone = "success" | "info" | "error";

type ToastOptions = {
  title?: string;
  tone?: ToastTone;
  duration?: number;
};

type ToastItem = Required<Pick<ToastOptions, "tone">> & {
  id: number;
  message: string;
  title: string;
};

type ToastContextValue = {
  showToast: (message: string, options?: ToastOptions) => number;
  dismissToast: (id: number) => void;
};

type ToastTimer = {
  pausedByFocus: boolean;
  pausedByHover: boolean;
  remaining: number;
  startedAt: number;
  timer: number | null;
};

type ToastPauseReason = "focus" | "hover";

const ToastContext = createContext<ToastContextValue | null>(null);

const defaultTitles: Record<ToastTone, string> = {
  success: "Success",
  info: "Update",
  error: "Action needed",
};

const toastIcons = {
  success: CheckCircle2,
  info: Info,
  error: CircleAlert,
};

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ToastTimer>());
  const latestToastId = useRef<number | null>(null);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timerState = timers.current.get(id);
    if (timerState?.timer !== null && timerState?.timer !== undefined) window.clearTimeout(timerState.timer);
    timers.current.delete(id);
  }, []);

  const showToast = useCallback((message: string, options: ToastOptions = {}) => {
    const tone = options.tone ?? "success";
    const id = Date.now() + nextId.current;
    nextId.current += 1;
    const toast: ToastItem = {
      id,
      message,
      tone,
      title: options.title ?? defaultTitles[tone],
    };

    setToasts((current) => [...current, toast].slice(-3));
    latestToastId.current = id;
    const defaultDuration = tone === "error" ? 6000 : 4800;
    const duration = Math.min(Math.max(options.duration ?? defaultDuration, 2000), 10_000);
    const timer = window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
      timers.current.delete(id);
    }, duration);
    timers.current.set(id, {
      pausedByFocus: false,
      pausedByHover: false,
      remaining: duration,
      startedAt: Date.now(),
      timer,
    });
    return id;
  }, []);

  const pauseToast = useCallback((id: number, reason: ToastPauseReason) => {
    const timerState = timers.current.get(id);
    if (!timerState) return;
    const reasonKey = reason === "hover" ? "pausedByHover" : "pausedByFocus";
    if (timerState.timer !== null) window.clearTimeout(timerState.timer);
    timers.current.set(id, {
      ...timerState,
      [reasonKey]: true,
      remaining: timerState.timer === null
        ? timerState.remaining
        : Math.max(500, timerState.remaining - (Date.now() - timerState.startedAt)),
      startedAt: Date.now(),
      timer: null,
    });
  }, []);

  const resumeToast = useCallback((id: number, reason: ToastPauseReason) => {
    const timerState = timers.current.get(id);
    if (!timerState) return;
    const nextState = {
      ...timerState,
      [reason === "hover" ? "pausedByHover" : "pausedByFocus"]: false,
    };
    if (nextState.pausedByHover || nextState.pausedByFocus || nextState.timer !== null) {
      timers.current.set(id, nextState);
      return;
    }
    const timer = window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
      timers.current.delete(id);
    }, nextState.remaining);
    timers.current.set(id, { ...nextState, startedAt: Date.now(), timer });
  }, []);

  useEffect(() => {
    latestToastId.current = toasts.at(-1)?.id ?? null;

    const visibleIds = new Set(toasts.map((toast) => toast.id));
    timers.current.forEach((timerState, id) => {
      if (visibleIds.has(id)) return;
      if (timerState.timer !== null) window.clearTimeout(timerState.timer);
      timers.current.delete(id);
    });
  }, [toasts]);

  useEffect(() => {
    function dismissNewest(event: KeyboardEvent) {
      if (event.key === "Escape" && latestToastId.current !== null) dismissToast(latestToastId.current);
    }

    window.addEventListener("keydown", dismissNewest);
    return () => window.removeEventListener("keydown", dismissNewest);
  }, [dismissToast]);

  useEffect(() => {
    const timerMap = timers.current;
    return () => {
      timerMap.forEach((timerState) => {
        if (timerState.timer !== null) window.clearTimeout(timerState.timer);
      });
      timerMap.clear();
    };
  }, []);

  const value = useMemo(() => ({ dismissToast, showToast }), [dismissToast, showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ol className="base-toast-region" role="region" aria-label="Notifications">
        {toasts.map((toast) => {
          const Icon = toastIcons[toast.tone];
          return (
            <li
              className={`base-global-toast base-global-toast-${toast.tone}`}
              key={toast.id}
              data-toast-id={toast.id}
              role={toast.tone === "error" ? "alert" : "status"}
              aria-atomic="true"
              onMouseEnter={() => pauseToast(toast.id, "hover")}
              onMouseLeave={() => resumeToast(toast.id, "hover")}
              onFocusCapture={() => pauseToast(toast.id, "focus")}
              onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) resumeToast(toast.id, "focus");
              }}
            >
              <span className="base-toast-icon" aria-hidden="true"><Icon size={20} /></span>
              <span className="base-toast-copy">
                <strong>{toast.title}</strong>
                <span>{toast.message}</span>
              </span>
              <button type="button" aria-label={`Dismiss ${toast.title.toLowerCase()} notification`} onClick={() => dismissToast(toast.id)}>
                <X size={16} />
              </button>
            </li>
          );
        })}
      </ol>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}
