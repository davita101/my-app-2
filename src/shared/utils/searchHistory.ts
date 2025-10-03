const HISTORY_KEY = "searchHistory:v1";

export type SearchHistoryItem = {
  query: string;
  timestamp: number;
};

export function addToSearchHistory(query: string): void {
  if (!query || query.trim() === "") return;
  
  try {
    const history = getSearchHistory();
    
    const filtered = history.filter(item => item.query !== query);
    
    filtered.unshift({
      query: query.trim(),
      timestamp: Date.now()
    });
    
    const trimmed = filtered.slice(0, 50);
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error("Failed to save search history:", e);
  }
}

export function getSearchHistory(): SearchHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to read search history:", e);
    return [];
  }
}

export function clearSearchHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error("Failed to clear search history:", e);
  }
}
