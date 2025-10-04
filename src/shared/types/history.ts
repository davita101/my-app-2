const HISTORY_KEY = "photo_search_history_v1";

export function pushHistory(term: string) {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    const filtered = [term, ...arr.filter((x) => x !== term)].slice(0, 200);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (e) {}
}

export function getHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch (e) {
    return [];
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    // ignore
  }
}

export function removeHistoryItem(term: string) {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    const filtered = arr.filter((x) => x !== term);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (e) {
    // ignore
  }
}
