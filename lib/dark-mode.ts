const DARK_MODE_KEY = "url-to-md-dark";

type Listener = () => void;

const listeners = new Set<Listener>();

export function getDarkMode(): boolean {
  return localStorage.getItem(DARK_MODE_KEY) === "1";
}

export function getServerDarkMode(): boolean {
  return false;
}

export function setDarkMode(value: boolean): void {
  localStorage.setItem(DARK_MODE_KEY, value ? "1" : "0");
  listeners.forEach((listener) => listener());
}

export function subscribeDarkMode(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
