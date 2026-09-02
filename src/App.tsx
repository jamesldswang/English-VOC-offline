import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { ArrowUp, AlertCircle, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import {
  WordCategory,
  WordItem,
  QuizRecord,
  UserProgressMap,
  CloudWordBankIndex,
  WrongWordCountMap,
  WordProgressStatus,
} from './types';
import { DEFAULT_STARTER_BANK } from './data/starterBanks';
import {
  GIST_API_URL,
  STORAGE_KEYS,
  getPrefixFromFileName,
  getQuizHistory,
  saveQuizHistory,
  getUserProgressCache,
  saveUserProgressCache,
  clearUserProgressCache,
  getStoredWordBank,
  storeWordBank,
  mergeHistoryRecords,
  downloadJSONFile,
} from './utils/storage';
import { speakText, stopSpeaking } from './utils/speech';

import { Header } from './components/Header';
import { UserPanel } from './components/UserPanel';
import { WordBankPanel } from './components/WordBankPanel';
import { ReviewPanel } from './components/ReviewPanel';
import { Dashboard } from './components/Dashboard';
import { WordCard } from './components/WordCard';
import { HistoryModal } from './components/HistoryModal';
import { ChangeLogModal } from './components/ChangeLogModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';

export default function App() {
  // User Profile: Always start EMPTY on initial entry
  const [username, setUsername] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [historyUsers, setHistoryUsers] = useState<string[]>([]);

  // Word Bank State
  const [wordCategories, setWordCategories] = useState<WordCategory[]>(DEFAULT_STARTER_BANK);
  const [currentBankFileName, setCurrentBankFileName] = useState<string>('01_精選示範字庫 (Starter Pack).json');
  const [cloudBanks, setCloudBanks] = useState<CloudWordBankIndex>({
    '01_精選示範字庫 (Starter Pack).json': 'local_starter',
  });
  const [isLoadingCloud, setIsLoadingCloud] = useState<boolean>(false);

  // Progress & Review State
  const [userProgress, setUserProgress] = useState<UserProgressMap>({});
  const [isTrainingMode, setIsTrainingMode] = useState<boolean>(false);
  const [currentReviewSessionId, setCurrentReviewSessionId] = useState<string>('');
  const [sliderValue, setSliderValue] = useState<number>(1);
  const [sliderMax, setSliderMax] = useState<number>(10);
  const [historyVersion, setHistoryVersion] = useState<number>(0);

  // Active focus and flipped cards tracking
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [activeWordEn, setActiveWordEn] = useState<string>('');

  // Continuous Sequential Playback (Ctrl + 1)
  const [isPlayingAll, setIsPlayingAll] = useState<boolean>(false);
  const [playAllIndex, setPlayAllIndex] = useState<number>(0);
  const playSessionRef = useRef<{
    active: boolean;
    index: number;
    timeoutId: number | null;
  }>({ active: false, index: 0, timeoutId: null });

  // Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 3200);
  }, []);

  // Compute all words flat list
  const allWords = useMemo(() => {
    const list: WordItem[] = [];
    wordCategories.forEach((cat) => {
      cat.list.forEach((item) => list.push(item));
    });
    return list;
  }, [wordCategories]);

  const totalWordsCount = allWords.length;
  const currentBankPrefix = useMemo(() => getPrefixFromFileName(currentBankFileName), [currentBankFileName]);

  // Compute wrong words counter from history for active user and bank
  const userWrongCounter = useMemo<WrongWordCountMap>(() => {
    const counter: WrongWordCountMap = {};
    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser || !currentBankPrefix) return counter;

    const history = getQuizHistory();
    history.forEach((record) => {
      if (
        record.name?.trim().toLowerCase() === cleanUser &&
        record.bankPrefix === currentBankPrefix &&
        record.wrongWords
      ) {
        record.wrongWords.forEach((w) => {
          if (w.en) {
            const raw = w.en.trim();
            const lower = raw.toLowerCase();
            const slashPart = lower.split('/')[0].trim();

            counter[raw] = (counter[raw] || 0) + 1;
            if (lower !== raw) {
              counter[lower] = (counter[lower] || 0) + 1;
            }
            if (slashPart && slashPart !== lower) {
              counter[slashPart] = (counter[slashPart] || 0) + 1;
            }
          }
        });
      }
    });
    return counter;
  }, [username, currentBankPrefix, historyVersion]);

  // Refresh history users list
  const refreshHistoryUsers = useCallback(() => {
    const history = getQuizHistory();
    const unique = new Set<string>();
    history.forEach((item) => {
      if (item.name && item.name.trim()) {
        unique.add(item.name.trim());
      }
    });
    setHistoryUsers(Array.from(unique));
  }, []);

  // Fetch Cloud Banks on Mount
  useEffect(() => {
    refreshHistoryUsers();

    // Check stored bank
    const stored = getStoredWordBank();
    if (stored.data && stored.data.length > 0) {
      setWordCategories(stored.data);
      setCurrentBankFileName(stored.fileName || '本地自訂單字庫.json');
    }

    // Always purge any cached username in browser storage on startup
    try {
      localStorage.removeItem(STORAGE_KEYS.USERNAME);
      localStorage.removeItem('fhl_username');
      sessionStorage.removeItem('fhl_username');
    } catch {
      // ignore storage access errors
    }
    setUsername('');
    setIsLoggedIn(false);

    // Fetch GitHub Gist
    async function fetchGistBanks() {
      setIsLoadingCloud(true);
      try {
        const res = await fetch(GIST_API_URL);
        if (!res.ok) throw new Error('無法連線 Gist 雲端');
        const gistData = await res.json();
        const files = gistData.files || {};
        const jsonFiles = Object.keys(files).filter((name) => name.endsWith('.json'));

        if (jsonFiles.length > 0) {
          jsonFiles.sort((a, b) => a.localeCompare(b, 'zh-TW', { numeric: true }));
          const mapping: CloudWordBankIndex = {
            '01_精選示範字庫 (Starter Pack).json': 'local_starter',
          };
          jsonFiles.forEach((f) => {
            mapping[f] = files[f].raw_url;
          });
          setCloudBanks(mapping);
        }
      } catch (err) {
        console.warn('Gist fetch fallback to local:', err);
      } finally {
        setIsLoadingCloud(false);
      }
    }

    fetchGistBanks();
  }, [refreshHistoryUsers]);

  // Calculate Weakness Scores & Slider max/value when user logs in or history updates
  const calculateWeaknessScores = useCallback(
    (targetName: string, skipForceSliderValue = false) => {
      const cleanUser = targetName.trim().toLowerCase();
      if (!cleanUser) return;

      const history = getQuizHistory();
      const prefix = getPrefixFromFileName(currentBankFileName);
      const counter: WrongWordCountMap = {};

      history.forEach((record) => {
        if (
          record.name?.trim().toLowerCase() === cleanUser &&
          record.bankPrefix === prefix &&
          record.wrongWords
        ) {
          record.wrongWords.forEach((w) => {
            if (w.en) {
              const lower = w.en.trim().toLowerCase();
              const slash = lower.split('/')[0].trim();
              counter[lower] = (counter[lower] || 0) + 1;
              if (slash && slash !== lower) {
                counter[slash] = (counter[slash] || 0) + 1;
              }
            }
          });
        }
      });

      const maxWrong = Math.max(0, ...Object.values(counter));

      if (maxWrong > 0) {
        setSliderMax(Math.max(10, maxWrong + 1));
        if (!skipForceSliderValue) {
          setSliderValue(1); // Default to threshold 1 so all wrong cards show immediately!
        }
      } else {
        setSliderMax(10);
        if (!skipForceSliderValue) {
          setSliderValue(1);
        }
      }
    },
    [currentBankFileName]
  );

  // User Login Handler
  const handleLogin = useCallback(() => {
    const trimmed = username.trim();
    if (!trimmed) {
      showToast('⚠️ 請先輸入或選擇有效的姓名！', 'error');
      return;
    }

    setIsLoggedIn(true);
    setIsTrainingMode(false);
    setCurrentReviewSessionId('');
    setFlippedCards({});

    // Check saved cache
    const cache = getUserProgressCache();
    let restoredProgress: UserProgressMap = {};
    if (
      cache &&
      cache.bankName === currentBankFileName &&
      cache.username === trimmed &&
      cache.progress &&
      Object.keys(cache.progress).length > 0
    ) {
      if (
        window.confirm(
          `🙋‍♂️ 偵測到受測者 [${trimmed}] 有尚未完成的特訓進度，是否要繼續挑戰？`
        )
      ) {
        restoredProgress = cache.progress;
      } else {
        clearUserProgressCache();
      }
    }

    setUserProgress(restoredProgress);
    calculateWeaknessScores(trimmed);
    showToast(`🎉 歡迎 ${trimmed}，登入成功！`, 'success');

    // Focus first card
    setTimeout(() => {
      const firstWord = allWords[0]?.en;
      if (firstWord) setActiveWordEn(firstWord);
    }, 150);
  }, [username, currentBankFileName, calculateWeaknessScores, showToast, allWords]);

  // Handle Cloud Word Bank Selection
  const handleSelectCloudBank = async (fileName: string) => {
    if (fileName === '01_精選示範字庫 (Starter Pack).json') {
      setWordCategories(DEFAULT_STARTER_BANK);
      setCurrentBankFileName(fileName);
      storeWordBank(DEFAULT_STARTER_BANK, fileName);
      setUserProgress({});
      setFlippedCards({});
      clearUserProgressCache();
      showToast('📖 已切換至內建精選示範字庫！', 'success');
      return;
    }

    const url = cloudBanks[fileName];
    if (!url) return;

    setIsLoadingCloud(true);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('題庫下載失敗');
      const data: WordCategory[] = await response.json();

      setWordCategories(data);
      setCurrentBankFileName(fileName);
      storeWordBank(data, fileName);
      setUserProgress({});
      setFlippedCards({});
      clearUserProgressCache();

      if (isLoggedIn && username.trim()) {
        calculateWeaknessScores(username.trim());
      }
      showToast(`🎉 題庫 [${fileName}] 載入成功！`, 'success');
    } catch (err) {
      showToast(`❌ 下載題庫失敗: ${(err as Error).message}`, 'error');
    } finally {
      setIsLoadingCloud(false);
    }
  };

  // Handle Local Bank JSON Upload
  const handleUploadLocalBank = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (!Array.isArray(parsed)) {
          throw new Error('JSON 格式必須為單字分類陣列');
        }
        setWordCategories(parsed);
        setCurrentBankFileName(file.name);
        storeWordBank(parsed, file.name);
        setUserProgress({});
        setFlippedCards({});
        clearUserProgressCache();

        if (isLoggedIn && username.trim()) {
          calculateWeaknessScores(username.trim());
        }
        showToast(`🎉 本地字庫 [${file.name}] 載入成功！`, 'success');
      } catch (err) {
        showToast(`❌ 檔案格式錯誤: ${(err as Error).message}`, 'error');
      }
    };
    reader.readAsText(file);
  };

  // Clear system bank
  const handleClearBank = () => {
    if (
      window.confirm(
        '⚠️ 警告 ⚠️\n這將重置目前教材並清空學習快取！確定要清除嗎？'
      )
    ) {
      setWordCategories(DEFAULT_STARTER_BANK);
      setCurrentBankFileName('01_精選示範字庫 (Starter Pack).json');
      storeWordBank(DEFAULT_STARTER_BANK, '01_精選示範字庫 (Starter Pack).json');
      setUserProgress({});
      setFlippedCards({});
      clearUserProgressCache();
      showToast('🧹 系統字庫已重置為預設狀態！', 'info');
    }
  };

  // Save current quiz results to history
  const saveCurrentResult = useCallback(
    (showAlert = false) => {
      const currentName = username.trim();
      if (!isLoggedIn || !currentName || totalWordsCount === 0) {
        if (showAlert) showToast('請先完成登入受測者姓名！', 'error');
        return;
      }

      // Count tested
      let tested = 0;
      let correct = 0;
      let wrong = 0;
      const wrongWordsList: { en: string; ch: string }[] = [];

      allWords.forEach((word) => {
        const status = userProgress[word.en];
        if (status === 'correct') {
          tested++;
          correct++;
        } else if (status === 'wrong') {
          tested++;
          wrong++;
          wrongWordsList.push({ en: word.en, ch: word.ch });
        }
      });

      if (tested === 0) {
        if (showAlert) showToast('請至少測驗一題後再進行儲存！', 'info');
        return;
      }

      const rateVal = isTrainingMode
        ? totalWordsCount === 0
          ? 100
          : Math.max(0, Math.round(((totalWordsCount - wrong) / totalWordsCount) * 100))
        : totalWordsCount === 0
        ? 100
        : Math.max(0, Math.round((correct / totalWordsCount) * 100));

      const finalRateString = `${rateVal}%`;

      const now = new Date();
      const timestamp = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(
        2,
        '0'
      )}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(
        2,
        '0'
      )}點${String(now.getMinutes()).padStart(2, '0')}分`;

      const newRecord: QuizRecord = {
        name: currentName,
        time: timestamp,
        tested,
        correct,
        wrong,
        rate: finalRateString,
        wrongWords: wrongWordsList,
        bankPrefix: currentBankPrefix,
        isReviewRound: isTrainingMode,
        reviewSessionId: currentReviewSessionId,
      };

      const history = getQuizHistory();
      
      // Match candidate if it's the exact same user, bank, round, session, and tested within 3 minutes
      const isSameSession =
        history.length > 0 &&
        history[0].name === currentName &&
        history[0].bankPrefix === newRecord.bankPrefix &&
        history[0].isReviewRound === newRecord.isReviewRound &&
        history[0].reviewSessionId === newRecord.reviewSessionId;

      if (isSameSession) {
        // Update the latest existing record rather than prepending a new duplicate
        history[0] = newRecord;
      } else {
        history.unshift(newRecord);
      }

      saveQuizHistory(history);
      refreshHistoryUsers();
      setHistoryVersion((v) => v + 1);

      if (tested === totalWordsCount && wrong === 0) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      if (showAlert) {
        showToast(`🎉 成果儲存成功！ 目前掌握度：${finalRateString}`, 'success');
      }
    },
    [
      username,
      isLoggedIn,
      totalWordsCount,
      allWords,
      userProgress,
      isTrainingMode,
      currentBankPrefix,
      currentReviewSessionId,
      refreshHistoryUsers,
      showToast,
    ]
  );

  // Status Change Handler for Word Cards
  const handleWordStatusChange = useCallback(
    (wordEn: string, newStatus: WordProgressStatus) => {
      if (!isLoggedIn) {
        showToast('⚠️ 請先確認登入受測姓名！', 'error');
        return;
      }

      setUserProgress((prev) => {
        const next = { ...prev, [wordEn]: newStatus };
        // Cache to storage
        if (username.trim() && currentBankFileName) {
          saveUserProgressCache({
            username: username.trim(),
            bankName: currentBankFileName,
            progress: next,
          });
        }
        return next;
      });

      // Auto-save result quietly
      setTimeout(() => {
        saveCurrentResult(false);
      }, 100);
    },
    [isLoggedIn, username, currentBankFileName, saveCurrentResult, showToast]
  );

  // Reset all questions to re-exam
  const handleResetAllQuestions = () => {
    setIsTrainingMode(false);
    setCurrentReviewSessionId('');
    setUserProgress({});
    setFlippedCards({});
    clearUserProgressCache();
    showToast('🔄 已重置所有卡片，開始全新測驗！', 'info');

    setTimeout(() => {
      const firstWord = allWords[0]?.en;
      if (firstWord) setActiveWordEn(firstWord);
    }, 100);
  };

  // Toggle Weakness Training Mode
  const handleToggleWeaknessTraining = () => {
    const trimmed = username.trim();
    if (!trimmed) {
      showToast('⚠️ 請先於左上方輸入受測者姓名！', 'error');
      return;
    }

    if (!isLoggedIn) {
      setIsLoggedIn(true);
    }

    if (!isTrainingMode) {
      setIsTrainingMode(true);
      const newSessionId = `session_${Date.now()}`;
      setCurrentReviewSessionId(newSessionId);
      setUserProgress({});
      setFlippedCards({});
      setSliderValue(1);

      calculateWeaknessScores(trimmed, false);
      showToast('🔥 已開啟弱點特訓模式！可透過上方拉桿調整錯字門檻。', 'success');
    } else {
      setIsTrainingMode(false);
      setCurrentReviewSessionId('');
      setUserProgress({});
      setFlippedCards({});
      clearUserProgressCache();
      showToast('已退出弱點特訓模式。', 'info');
    }
  };

  // Filter visible categories and words according to training mode
  const visibleCategories = useMemo(() => {
    if (!isTrainingMode) {
      return wordCategories;
    }

    return wordCategories
      .map((cat) => {
        const filteredList = cat.list.filter((job) => {
          const raw = job.en.trim();
          const lower = raw.toLowerCase();
          const slashPart = lower.split('/')[0].trim();
          const wrongCount =
            userWrongCounter[raw] ||
            userWrongCounter[lower] ||
            userWrongCounter[slashPart] ||
            0;
          return wrongCount >= sliderValue;
        });
        return { ...cat, list: filteredList };
      })
      .filter((cat) => cat.list.length > 0);
  }, [wordCategories, isTrainingMode, userWrongCounter, sliderValue]);

  // Compute visible words flat list
  const visibleWords = useMemo(() => {
    const list: WordItem[] = [];
    visibleCategories.forEach((cat) => {
      cat.list.forEach((item) => list.push(item));
    });
    return list;
  }, [visibleCategories]);

  // Dashboard Stats
  const dashboardStats = useMemo(() => {
    let tested = 0;
    let correct = 0;
    let wrong = 0;

    allWords.forEach((word) => {
      const status = userProgress[word.en];
      if (status === 'correct') {
        tested++;
        correct++;
      } else if (status === 'wrong') {
        tested++;
        wrong++;
      }
    });

    const displayRate = isTrainingMode
      ? totalWordsCount === 0
        ? 100
        : Math.max(0, Math.round(((totalWordsCount - wrong) / totalWordsCount) * 100))
      : totalWordsCount === 0
      ? 100
      : Math.max(0, Math.round((correct / totalWordsCount) * 100));

    return {
      totalWords: totalWordsCount,
      testedCount: tested,
      correctCount: correct,
      wrongCount: wrong,
      masteryRate: displayRate,
    };
  }, [allWords, userProgress, totalWordsCount, isTrainingMode]);

  // Stop Continuous Playback Helper
  const stopPlayAll = useCallback(
    (userFeedback = true) => {
      if (playSessionRef.current.timeoutId) {
        clearTimeout(playSessionRef.current.timeoutId);
        playSessionRef.current.timeoutId = null;
      }
      playSessionRef.current.active = false;
      stopSpeaking();
      setIsPlayingAll(false);
      if (userFeedback) {
        showToast('⏹️ 已停止連續朗讀。', 'info');
      }
    },
    [showToast]
  );

  // Start Continuous Sequential Playback (Ctrl + 1)
  const startPlayAll = useCallback(() => {
    if (visibleWords.length === 0) {
      showToast('⚠️ 目前畫面上沒有可播放的單字考題！', 'info');
      return;
    }

    // Stop any existing speech or timers
    stopSpeaking();
    if (playSessionRef.current.timeoutId) {
      clearTimeout(playSessionRef.current.timeoutId);
      playSessionRef.current.timeoutId = null;
    }

    playSessionRef.current = { active: true, index: 0, timeoutId: null };
    setIsPlayingAll(true);
    setPlayAllIndex(0);
    showToast(
      `🎧 開始連續朗讀 ${visibleWords.length} 個題目 (單字 ➔ 例句)...`,
      'info'
    );

    const playNext = (currentIndex: number) => {
      if (!playSessionRef.current.active) return;
      if (currentIndex >= visibleWords.length) {
        setIsPlayingAll(false);
        playSessionRef.current.active = false;
        showToast(
          `🎉 已完成全部 ${visibleWords.length} 個考題的連續朗讀！`,
          'success'
        );
        return;
      }

      setPlayAllIndex(currentIndex);
      const targetWord = visibleWords[currentIndex];
      if (!targetWord) return;

      setActiveWordEn(targetWord.en);

      // Scroll target card into view smoothly
      try {
        const cardEl = document.querySelector(
          `[data-en="${CSS.escape(targetWord.en)}"]`
        );
        if (cardEl) {
          cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } catch {
        // Selector fallback
      }

      // 1. Speak target word
      speakText(targetWord.en, 0.85, () => {
        if (!playSessionRef.current.active) return;

        // 2. Short pause (400ms), then speak example sentence
        playSessionRef.current.timeoutId = window.setTimeout(() => {
          if (!playSessionRef.current.active) return;

          const sentenceText = targetWord.exampleEn || targetWord.en;
          speakText(sentenceText, 0.85, () => {
            if (!playSessionRef.current.active) return;

            // 3. Short pause (650ms), then advance to next card
            playSessionRef.current.timeoutId = window.setTimeout(() => {
              if (!playSessionRef.current.active) return;
              playNext(currentIndex + 1);
            }, 650);
          });
        }, 400);
      });
    };

    playNext(0);
  }, [visibleWords, showToast]);

  const togglePlayAll = useCallback(() => {
    if (isPlayingAll) {
      stopPlayAll(true);
    } else {
      startPlayAll();
    }
  }, [isPlayingAll, stopPlayAll, startPlayAll]);

  // Clean up playback on unmount
  useEffect(() => {
    return () => {
      stopPlayAll(false);
    };
  }, [stopPlayAll]);

  // Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      const isInput = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'SELECT';

      // 0. Ctrl/Cmd + 1: Toggle continuous playback of all visible cards
      if ((e.ctrlKey || e.metaKey) && (e.key === '1' || e.code === 'Digit1')) {
        e.preventDefault();
        togglePlayAll();
        return;
      }

      // Esc: Stop continuous playback if active
      if (e.key === 'Escape' && isPlayingAll) {
        e.preventDefault();
        stopPlayAll(true);
        return;
      }

      // 1. Ctrl/Cmd + S: Save result
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveCurrentResult(true);
        return;
      }

      // 2. Ctrl/Cmd + F1: Reset memory
      if ((e.ctrlKey || e.metaKey) && (e.key === 'F1' || e.keyCode === 112)) {
        e.preventDefault();
        if (window.confirm('🗑️ 確定要清空所有暫存並重載頁面嗎？')) {
          localStorage.clear();
          window.location.reload();
        }
        return;
      }

      // 3. Tab: Switch to next visible card input
      if (e.key === 'Tab' && visibleWords.length > 0) {
        e.preventDefault();
        const currentIndex = visibleWords.findIndex((w) => w.en === activeWordEn);
        const nextIndex = e.shiftKey
          ? (currentIndex - 1 + visibleWords.length) % visibleWords.length
          : (currentIndex + 1) % visibleWords.length;
        const nextWord = visibleWords[nextIndex]?.en;
        if (nextWord) {
          setActiveWordEn(nextWord);
        }
        return;
      }

      // 4. ArrowUp / ArrowDown: Flip card & speak word
      if (isInput && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        if (activeWordEn) {
          setFlippedCards((prev) => ({
            ...prev,
            [activeWordEn]: !prev[activeWordEn],
          }));
          speakText(activeWordEn);
        }
        return;
      }

      // 5. ArrowLeft / ArrowRight: Navigate cards if card is flipped
      if (activeWordEn && flippedCards[activeWordEn] && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        const currentIndex = visibleWords.findIndex((w) => w.en === activeWordEn);
        const targetIndex =
          e.key === 'ArrowLeft'
            ? (currentIndex - 1 + visibleWords.length) % visibleWords.length
            : (currentIndex + 1) % visibleWords.length;
        const targetWord = visibleWords[targetIndex]?.en;
        if (targetWord) {
          setActiveWordEn(targetWord);
        }
        return;
      }

      // 6. Shift + Y/O: Mark correct, Shift + N/X: Mark wrong
      if (e.shiftKey && activeWordEn) {
        const keyLower = e.key.toLowerCase();
        if (keyLower === 'y' || keyLower === 'o') {
          e.preventDefault();
          handleWordStatusChange(activeWordEn, 'correct');
          return;
        }
        if (keyLower === 'n' || keyLower === 'x') {
          e.preventDefault();
          handleWordStatusChange(activeWordEn, 'wrong');
          return;
        }
      }

      // 7. Ctrl + `: Speak target word
      if ((e.ctrlKey || e.metaKey) && (e.key === '`' || e.code === 'Backquote')) {
        if (activeWordEn) {
          e.preventDefault();
          speakText(activeWordEn);
        }
        return;
      }

      // 8. ` or ~ without Ctrl: Speak example sentence
      if (!e.ctrlKey && !e.metaKey && (e.key === '`' || e.key === '~')) {
        if (activeWordEn) {
          e.preventDefault();
          const targetWordObj = allWords.find((w) => w.en === activeWordEn);
          speakText(targetWordObj?.exampleEn || activeWordEn);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeWordEn,
    flippedCards,
    visibleWords,
    allWords,
    isPlayingAll,
    togglePlayAll,
    stopPlayAll,
    saveCurrentResult,
    handleWordStatusChange,
  ]);

  // Export History JSON
  const handleExportHistory = () => {
    const history = getQuizHistory();
    if (history.length === 0) {
      showToast('👋 目前本機尚無任何特訓歷史紀錄可以匯出喔！', 'info');
      return;
    }
    downloadJSONFile(history, 'Global_特訓學習歷程大數據總打包');
    showToast('📤 歷史歷程 JSON 下載已啟動！', 'success');
  };

  // Import History JSON
  const handleImportHistory = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (!Array.isArray(parsed)) {
          throw new Error('歷史紀錄必須為陣列');
        }
        const merged = mergeHistoryRecords(parsed);
        saveQuizHistory(merged);
        refreshHistoryUsers();
        setHistoryVersion((v) => v + 1);

        if (isLoggedIn && username.trim()) {
          calculateWeaknessScores(username.trim());
        }
        showToast('🎉 歷程倒入與無損融合成功！', 'success');
      } catch (err) {
        showToast(`❌ 匯入失敗: ${(err as Error).message}`, 'error');
      }
    };
    reader.readAsText(file);
  };

  // Clear current filtered history records
  const handleClearCurrentHistory = () => {
    const trimmed = username.trim();
    if (!trimmed || !currentBankPrefix) {
      showToast('⚠️ 請先確認登入及加載字庫！', 'error');
      return;
    }

    if (
      window.confirm(
        `⚠️ 確定要永久刪除受測者 [${trimmed}] 在教材 [${currentBankPrefix}] 下的全部歷史紀錄嗎？`
      )
    ) {
      const history = getQuizHistory();
      const filtered = history.filter(
        (item) =>
          !(
            item.name?.trim() === trimmed &&
            item.bankPrefix === currentBankPrefix
          )
      );
      saveQuizHistory(filtered);
      refreshHistoryUsers();
      setHistoryVersion((v) => v + 1);
      calculateWeaknessScores(trimmed);
      setIsHistoryOpen(false);
      showToast('🗑️ 歷史紀錄已成功清理！', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-blue-200">
      {/* Toast Notification Bar */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-xl border text-xs sm:text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-3 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : toastMessage.type === 'error'
              ? 'bg-rose-600 text-white border-rose-500'
              : 'bg-slate-800 text-white border-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex-1">
        <Header onOpenKeyboardShortcuts={() => setIsShortcutsOpen(true)} />

        {/* Control Panels Stack */}
        <div className="space-y-3 mb-6 max-w-6xl mx-auto">
          <UserPanel
            username={username}
            isLoggedIn={isLoggedIn}
            historyUsers={historyUsers}
            onUsernameChange={setUsername}
            onLogin={handleLogin}
            onSaveResult={() => saveCurrentResult(true)}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onExportHistory={handleExportHistory}
            onImportHistory={handleImportHistory}
            onOpenChangelog={() => setIsChangelogOpen(true)}
          />

          <WordBankPanel
            cloudBanks={cloudBanks}
            currentBankFileName={currentBankFileName}
            isLoadingCloud={isLoadingCloud}
            onSelectBank={handleSelectCloudBank}
            onUploadLocalBank={handleUploadLocalBank}
            onClearBank={handleClearBank}
          />

          <ReviewPanel
            sliderValue={sliderValue}
            sliderMax={sliderMax}
            isTrainingMode={isTrainingMode}
            isPlayingAll={isPlayingAll}
            playAllProgressText={`${playAllIndex + 1} / ${visibleWords.length}`}
            onSliderChange={(val) => {
              setSliderValue(val);
              if (isTrainingMode) {
                setUserProgress({});
                setFlippedCards({});
              }
            }}
            onResetAllQuestions={handleResetAllQuestions}
            onToggleWeaknessTraining={handleToggleWeaknessTraining}
            onTogglePlayAll={togglePlayAll}
          />

          <Dashboard
            totalWords={dashboardStats.totalWords}
            testedCount={dashboardStats.testedCount}
            correctCount={dashboardStats.correctCount}
            wrongCount={dashboardStats.wrongCount}
            masteryRate={dashboardStats.masteryRate}
          />
        </div>

        {/* Main Flashcards Stage */}
        <main className="relative">
          {visibleCategories.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8 max-w-2xl mx-auto my-8 shadow-xs">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                🎉 太棒了！在目前門檻 (錯 {sliderValue} 次以上) 查無弱點單字！
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                你可以調降上方門檻滑桿，或點擊「🔄 全部重考」挑戰完整題庫。
              </p>
              <button
                onClick={handleResetAllQuestions}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition"
              >
                🔄 全部重考 (列出所有題目)
              </button>
            </div>
          ) : (
            <div className="space-y-8 max-w-6xl mx-auto pb-16">
              {visibleCategories.map((category) => {
                // Count category score
                let catCorrect = 0;
                let catWrong = 0;
                category.list.forEach((w) => {
                  if (userProgress[w.en] === 'correct') catCorrect++;
                  if (userProgress[w.en] === 'wrong') catWrong++;
                });

                return (
                  <section key={category.id} className="space-y-4">
                    <div className="flex items-center justify-between border-l-4 border-blue-600 pl-3">
                      <h2 className="text-base sm:text-lg font-extrabold text-slate-800 tracking-tight">
                        {category.category}
                      </h2>
                      <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full shadow-2xs">
                        ⭕ {catCorrect} / ❌ {catWrong}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                      {category.list.map((word) => (
                        <WordCard
                          key={word.en}
                          word={word}
                          status={userProgress[word.en]}
                          wrongCount={userWrongCounter[word.en] || 0}
                          isFlipped={!!flippedCards[word.en]}
                          isActiveFocus={activeWordEn === word.en}
                          isSystemLocked={!isLoggedIn}
                          onFlipToggle={() => {
                            setFlippedCards((prev) => ({
                              ...prev,
                              [word.en]: !prev[word.en],
                            }));
                            setActiveWordEn(word.en);
                          }}
                          onStatusChange={(status) =>
                            handleWordStatusChange(word.en, status)
                          }
                          onFocus={() => setActiveWordEn(word.en)}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Floating Continuous Playback Controller Bar */}
      {isPlayingAll && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 text-white border border-indigo-400/50 shadow-2xl px-5 py-3 rounded-2xl flex items-center gap-4 backdrop-blur-md animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </span>
            <span className="text-xs font-bold text-indigo-300">
              連續朗讀中 ({playAllIndex + 1} / {visibleWords.length})
            </span>
          </div>

          <div className="text-xs font-extrabold text-white max-w-[200px] truncate">
            {visibleWords[playAllIndex]?.en || ''}
          </div>

          <button
            onClick={() => stopPlayAll(true)}
            title="停止播放 (按 Esc 或 Ctrl+1)"
            className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
          >
            <span>⏹️ 停止</span>
            <kbd className="text-[10px] bg-rose-800/80 px-1 py-0.5 rounded font-mono">Esc</kbd>
          </button>
        </div>
      )}

      {/* Floating Scroll To Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="回到頂端"
        tabIndex={-1}
        className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl flex items-center justify-center transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      {/* Modals */}
      <HistoryModal
        isOpen={isHistoryOpen}
        history={getQuizHistory()}
        currentBankPrefix={currentBankPrefix}
        currentUsername={username}
        totalWordsCount={totalWordsCount}
        onClose={() => setIsHistoryOpen(false)}
        onClearCurrentHistory={handleClearCurrentHistory}
      />

      <ChangeLogModal
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
