import { QuizRecord, UserProgressCache, WordCategory } from '../types';

export const GIST_ID = 'bc604e8856c3cc383aaab925f2f7c222';
export const GIST_API_URL = `https://api.github.com/gists/${GIST_ID}`;

export const STORAGE_KEYS = {
  HISTORY: 'fhl_job_quiz_history',
  DYNAMIC_WORD_BANK: 'fhl_dynamic_word_bank',
  BANK_FILE_NAME: 'fhl_bank_file_name',
  USER_PROGRESS_CACHE: 'fhl_user_progress_cache',
  USERNAME: 'fhl_username',
};

/**
 * Extracts bank prefix from file name (handles both with and without underscore)
 * e.g., "01_TOEIC_700.json" -> "01"
 * e.g., "TOEIC700.json" -> "TOEIC700"
 */
export function getPrefixFromFileName(filename: string): string {
  if (!filename) return '';
  const baseName = filename.split('/').pop()?.trim() || '';
  if (baseName.includes('_')) {
    return baseName.split('_')[0].trim();
  }
  return baseName.replace(/\.json$/i, '').trim();
}

/**
 * Reads historical quiz records from LocalStorage
 */
export function getQuizHistory(): QuizRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves quiz history to LocalStorage
 */
export function saveQuizHistory(history: QuizRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (err) {
    console.error('Failed to save quiz history:', err);
  }
}

/**
 * Gets cached user progress
 */
export function getUserProgressCache(): UserProgressCache | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS_CACHE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Saves user progress cache
 */
export function saveUserProgressCache(cache: UserProgressCache): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROGRESS_CACHE, JSON.stringify(cache));
  } catch (err) {
    console.error('Failed to save progress cache:', err);
  }
}

/**
 * Clears user progress cache
 */
export function clearUserProgressCache(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER_PROGRESS_CACHE);
  } catch (err) {
    console.error('Failed to clear cache:', err);
  }
}

/**
 * Gets stored word bank and file name
 */
export function getStoredWordBank(): { data: WordCategory[] | null; fileName: string } {
  try {
    const rawData = localStorage.getItem(STORAGE_KEYS.DYNAMIC_WORD_BANK);
    const fileName = localStorage.getItem(STORAGE_KEYS.BANK_FILE_NAME) || '';
    return {
      data: rawData ? JSON.parse(rawData) : null,
      fileName,
    };
  } catch {
    return { data: null, fileName: '' };
  }
}

/**
 * Stores active word bank
 */
export function storeWordBank(data: WordCategory[], fileName: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DYNAMIC_WORD_BANK, JSON.stringify(data));
    localStorage.setItem(STORAGE_KEYS.BANK_FILE_NAME, fileName);
  } catch (err) {
    console.error('Failed to store word bank:', err);
  }
}

/**
 * Lossless merge of imported quiz history records
 */
export function mergeHistoryRecords(incoming: QuizRecord[]): QuizRecord[] {
  const current = getQuizHistory();
  const historyMap = new Map<string, QuizRecord>();

  current.forEach((item) => {
    const key = `${item.name}_${item.time}_${item.bankPrefix || ''}`;
    historyMap.set(key, item);
  });

  incoming.forEach((item) => {
    if (item && item.name && item.time) {
      const key = `${item.name}_${item.time}_${item.bankPrefix || ''}`;
      if (!historyMap.has(key)) {
        historyMap.set(key, item);
      }
    }
  });

  const merged = Array.from(historyMap.values());
  // Sort descending by time
  merged.sort((a, b) => {
    const timeA = new Date(a.time.replace(/點|分/g, ':')).getTime() || 0;
    const timeB = new Date(b.time.replace(/點|分/g, ':')).getTime() || 0;
    return timeB - timeA;
  });

  return merged;
}

/**
 * Trigger download of JSON file in browser
 */
export function downloadJSONFile(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}`;
  a.href = url;
  a.download = `${filename}_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Checks if user is running inside an in-app WebView
 */
export function isInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || '';
  return (
    ua.includes('Line') ||
    ua.includes('FBAN') ||
    ua.includes('FBAV') ||
    ua.includes('MicroMessenger') ||
    ua.includes('Instagram') ||
    ua.includes('Pinterest')
  );
}
