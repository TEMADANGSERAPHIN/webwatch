"use client";
import * as React from "react";
import { type ToastProps } from "@/components/ui/toast";

interface ToastState extends ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "destructive";
}

let count = 0;
const genId = () => String(++count);

type Action =
  | { type: "ADD_TOAST"; toast: ToastState }
  | { type: "DISMISS_TOAST"; id: string }
  | { type: "REMOVE_TOAST"; id: string };

interface State {
  toasts: ToastState[];
}

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 4000;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_TOAST":
      return { toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) };
    case "DISMISS_TOAST":
      return { toasts: state.toasts.map((t) => t.id === action.id ? { ...t, open: false } : t) };
    case "REMOVE_TOAST":
      return { toasts: state.toasts.filter((t) => t.id !== action.id) };
  }
}

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((l) => l(memoryState));
}

function toast(props: Omit<ToastState, "id">) {
  const id = genId();
  dispatch({ type: "ADD_TOAST", toast: { ...props, id, open: true } });
  setTimeout(() => dispatch({ type: "DISMISS_TOAST", id }), TOAST_REMOVE_DELAY);
  setTimeout(() => dispatch({ type: "REMOVE_TOAST", id }), TOAST_REMOVE_DELAY + 300);
  return id;
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => { const i = listeners.indexOf(setState); if (i > -1) listeners.splice(i, 1); };
  }, []);
  return { toasts: state.toasts, toast };
}

export { toast };
