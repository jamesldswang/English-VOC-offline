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
  const [sliderMax, setSliderMax] = useState<number>(1);
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
      const recordPrefix = record.bankPrefix || '';
      const prefixMatch =
        !recordPrefix ||
        recordPrefix === currentBankPrefix ||
        recordPrefix === 'ALL' ||
        recordPrefix.replace(/\.json$/i, '') === currentBankPrefix.replace(/\.json$/i, '');

      if (
        record.name?.trim().toLowerCase() === cleanUser &&
        prefixMatch &&
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
      if (!cleanUser) {
        setSliderMax(1);
        setSliderValue(1);
        return;
      }

      const history = getQuizHistory();
      const prefix = getPrefixFromFileName(currentBankFileName);
      const wordCounts: { [en: string]: number } = {};

      const userBankRecords = history.filter(
        (record) =>
          record.name?.trim().toLowerCase() === cleanUser &&
          (!record.bankPrefix ||
            record.bankPrefix === prefix ||
            record.bankPrefix === 'ALL' ||
            record.bankPrefix.replace(/\.json$/i, '') === prefix.replace(/\.json$/i, ''))
      );

      // Aggregate error counts per unique word across historical records
      userBankRecords.forEach((record) => {
        if (record.wrongWords && Array.isArray(record.wrongWords)) {
          record.wrongWords.forEach((w: any) => {
            if (w.en) {
              const rawKey = w.en.trim();
              wordCounts[rawKey] = (wordCounts[rawKey] || 0) + 1;
            }
          });
        }
      });

      // 1. 不熟悉度門檻最大數值 = 累積單一字, 錯誤最多次的次數 (如 3)
      const countsArray = Object.values(wordCounts);
      const maxWrong = countsArray.length > 0 ? Math.max(0, ...countsArray) : 0;

      // 取得最新一筆紀錄（第0筆為最新，因 history 是 unshift 新紀錄）
      const latestRecord = userBankRecords.length > 0 ? userBankRecords[0] : null;

      // 判定最新一筆測驗是否達 100% 全對
      const isLatest100Percent = Boolean(
        latestRecord &&
          latestRecord.tested > 0 &&
          latestRecord.wrong === 0 &&
          (!latestRecord.wrongWords || latestRecord.wrongWords.length === 0)
      );

      if (isLatest100Percent) {
        // A-2. 如果本次測驗達 100% 時，門檻推升為 maxWrong + 1（即 3 + 1 = 4）
        const targetVal = maxWrong > 0 ? maxWrong + 1 : 2;
        setSliderMax(targetVal);
        if (!skipForceSliderValue) {
          setSliderValue(targetVal);
        }
      } else {
        // A-1 & A-3. 如果本次測驗未達 100% (或雖之前的歷史紀錄有達 100%, 但本次測試又有錯)，
        // 則在 Ctrl+S / 存查時，門檻再度改回最大錯誤累積值 (maxWrong)
        const targetVal = Math.max(1, maxWrong);
        setSliderMax(targetVal);
        if (!skipForceSliderValue) {
          setSliderValue(targetVal);
        }
      }
    },
    [currentBankFileName]
  );

  // User Login Handler (supports explicit target name for history auto-login, or input state)
  const handleLogin = useCallback(
    (explicitName?: string) => {
      const targetName = (explicitName !== undefined ? explicitName : username).trim();
      if (!targetName) {
        showToast('⚠️ 請先輸入或選擇有效的姓名！', 'error');
        return;
      }

      if (explicitName !== undefined) {
        setUsername(targetName);
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
        cache.username === targetName &&
        cache.progress &&
        Object.keys(cache.progress).length > 0
      ) {
        if (
          window.confirm(
            `🙋‍♂️ 偵測到受測者 [${targetName}] 有尚未完成的特訓進度，是否要繼續挑戰？`
          )
        ) {
          restoredProgress = cache.progress;
        } else {
          clearUserProgressCache();
        }
      }

      setUserProgress(restoredProgress);
      calculateWeaknessScores(targetName);
      showToast(`🎉 歡迎 ${targetName}，登入成功！`, 'success');

      // Focus first card
      setTimeout(() => {
        const firstWord = allWords[0]?.en;
        if (firstWord) setActiveWordEn(firstWord);
      }, 150);
    },
    [username, currentBankFileName, calculateWeaknessScores, showToast, allWords]
  );

  // When user types in input: if name differs from logged-in user, require confirmation for new user
  const handleUsernameChange = useCallback(
    (newName: string) => {
      setUsername(newName);
      if (isLoggedIn && newName.trim().toLowerCase() !== username.trim().toLowerCase()) {
        setIsLoggedIn(false);
      }
    },
    [isLoggedIn, username]
  );

  // When user selects from history dropdown: immediately log in without clicking confirm
  const handleSelectHistoryUser = useCallback(
    (selectedName: string) => {
      const trimmed = selectedName.trim();
      if (!trimmed) return;
      handleLogin(trimmed);
    },
    [handleLogin]
  );

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

  // Save current quiz results to history
  const saveCurrentResult = useCallback(
    (showAlert = false) => {
      const currentName = username.trim();
      if (!isLoggedIn || !currentName || totalWordsCount === 0) {
        if (showAlert) showToast('請先完成登入受測者姓名！', 'error');
        return;
      }

      // In both regular and training modes, the total questions base is the entire bank (totalWordsCount)
      const targetTotal = totalWordsCount || allWords.length;

      let answeredCount = 0;
      const wrongWordsList: { en: string; ch: string }[] = [];

      if (isTrainingMode) {
        // In weakness mode, evaluate the words tested in this drill
        visibleWords.forEach((word) => {
          const status = userProgress[word.en];
          if (status === 'correct') {
            answeredCount++;
          } else if (status === 'wrong') {
            answeredCount++;
            wrongWordsList.push({ en: word.en, ch: word.ch });
          } else {
            // 未測驗字一律計入答錯字清單
            wrongWordsList.push({ en: word.en, ch: word.ch });
          }
        });
      } else {
        allWords.forEach((word) => {
          const status = userProgress[word.en];
          if (status === 'correct') {
            answeredCount++;
          } else if (status === 'wrong') {
            answeredCount++;
            wrongWordsList.push({ en: word.en, ch: word.ch });
          } else {
            // 未測驗字一律計入答錯字清單
            wrongWordsList.push({ en: word.en, ch: word.ch });
          }
        });
      }

      if (answeredCount === 0) {
        if (showAlert) showToast('請至少測驗一題後再進行儲存！', 'info');
        return;
      }

      if (targetTotal === 0) {
        return;
      }

      const wrong = wrongWordsList.length;
      const correct = Math.max(0, targetTotal - wrong);
      const tested = targetTotal;

      // 正確率計算：嚴格以 (總題數 - 錯題數) / 總題數 判定 (例: 4 題錯 2 題 = 50%)
      const rateVal =
        targetTotal === 0
          ? 100
          : Math.max(0, Math.round((correct / targetTotal) * 100));

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
        total: targetTotal,
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

      // A: 在按 存查歷史紀錄 or Ctrl+S 儲存時，立即同步更動篩選歷史不熟悉度門檻
      if (currentName) {
        calculateWeaknessScores(currentName, false);
      }

      if (tested === targetTotal && wrong === 0) {
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
      visibleWords,
      userProgress,
      isTrainingMode,
      currentBankPrefix,
      currentReviewSessionId,
      calculateWeaknessScores,
      refreshHistoryUsers,
      showToast,
    ]
  );

  // Handle Open History with Auto-Save of In-Progress Result
  const handleOpenHistoryWithSave = useCallback(
    (showAlert = false) => {
      const targetWords = isTrainingMode ? visibleWords : allWords;
      let hasAnyProgress = false;
      targetWords.forEach((word) => {
        if (userProgress[word.en]) {
          hasAnyProgress = true;
        }
      });

      if (hasAnyProgress && username.trim()) {
        saveCurrentResult(showAlert);
      } else if (username.trim()) {
        calculateWeaknessScores(username.trim(), false);
      }

      // 當按 「存查歷史 (Ctrl+S)」弱點特訓的狀態, 就恢復成還沒執行
      if (isTrainingMode) {
        setIsTrainingMode(false);
        setCurrentReviewSessionId('');
        setUserProgress({});
        setFlippedCards({});
        clearUserProgressCache();
        setTimeout(() => {
          const firstWord = allWords[0]?.en;
          if (firstWord) setActiveWordEn(firstWord);
        }, 100);
      }

      setIsHistoryOpen(true);
    },
    [
      isTrainingMode,
      visibleWords,
      allWords,
      userProgress,
      username,
      saveCurrentResult,
      calculateWeaknessScores,
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
      // 若進入特訓前在一般模式已有作答進度，先自動儲存本次成果
      const targetWords = allWords;
      let hasAnyProgress = false;
      targetWords.forEach((word) => {
        if (userProgress[word.en]) {
          hasAnyProgress = true;
        }
      });
      if (hasAnyProgress && trimmed) {
        saveCurrentResult(false);
      }

      setIsTrainingMode(true);
      const newSessionId = `session_${Date.now()}`;
      setCurrentReviewSessionId(newSessionId);
      setUserProgress({});
      setFlippedCards({});

      // B: 在按 弱點特訓時，呼叫同一段程式先設定好正確門檻 (不用顯示歷史頁)，再進行卡片顯示
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

  // Dashboard Stats
  const dashboardStats = useMemo(() => {
    const targetList = isTrainingMode ? visibleWords : allWords;
    let tested = 0;
    let correct = 0;
    let wrong = 0;

    targetList.forEach((word) => {
      const status = userProgress[word.en];
      if (status === 'correct') {
        tested++;
        correct++;
      } else if (status === 'wrong') {
        tested++;
        wrong++;
      }
    });

    const targetTotal = targetList.length;
    const displayRate =
      targetTotal === 0
        ? 100
        : Math.max(0, Math.round((correct / targetTotal) * 100));

    return {
      totalWords: targetTotal,
      testedCount: tested,
      correctCount: correct,
      wrongCount: wrong,
      masteryRate: displayRate,
    };
  }, [allWords, visibleWords, userProgress, isTrainingMode]);

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
      // Check if user is typing in an external input (like student name login, dropdown, or modal)
      const isOutsideInput =
        activeEl?.closest('.user-panel, header, .modal-container, select') !== null;

      // Resolve effective active word:
      // 1. activeWordEn if valid in visibleWords
      // 2. or find any visible word that is currently flipped
      // 3. or default to the first visible word
      let currentWordEn = activeWordEn;
      if (!currentWordEn || !visibleWords.some((w) => w.en === currentWordEn)) {
        const flippedVisible = visibleWords.find((w) => flippedCards[w.en]);
        if (flippedVisible) {
          currentWordEn = flippedVisible.en;
        } else if (visibleWords.length > 0) {
          currentWordEn = visibleWords[0]?.en;
        }
      }

      // 0. Ctrl/Cmd + 1: Toggle continuous playback of all visible cards
      if ((e.ctrlKey || e.metaKey) && (e.key === '1' || e.code === 'Digit1')) {
        e.preventDefault();
        togglePlayAll();
        return;
      }

      // 0.1 Ctrl/Cmd + 2: Close HistoryModal ("Global 存查歷史紀錄與學習歷程看板 視窗")
      if ((e.ctrlKey || e.metaKey) && (e.key === '2' || e.code === 'Digit2')) {
        e.preventDefault();
        setIsHistoryOpen(false);
        return;
      }

      // 0.2 Ctrl/Cmd + 3: Launch or toggle Weakness Training
      if ((e.ctrlKey || e.metaKey) && (e.key === '3' || e.code === 'Digit3')) {
        e.preventDefault();
        if (isHistoryOpen) {
          setIsHistoryOpen(false);
        }
        handleToggleWeaknessTraining();
        return;
      }

      // Esc: Stop continuous playback if active
      if (e.key === 'Escape' && isPlayingAll) {
        e.preventDefault();
        stopPlayAll(true);
        return;
      }

      // 1. Ctrl/Cmd + S: Save result and open history modal
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleOpenHistoryWithSave(true);
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
        if (isOutsideInput) return;
        e.preventDefault();
        const currentIndex = visibleWords.findIndex((w) => w.en === currentWordEn);
        const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;
        const nextIndex = e.shiftKey
          ? (safeCurrentIndex - 1 + visibleWords.length) % visibleWords.length
          : (safeCurrentIndex + 1) % visibleWords.length;
        const nextWord = visibleWords[nextIndex]?.en;
        if (nextWord) {
          setActiveWordEn(nextWord);
        }
        return;
      }

      // 4. ArrowUp / ArrowDown: Flip card & speak word
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        if (isOutsideInput) return;
        if (currentWordEn) {
          e.preventDefault();
          const nextFlipped = !flippedCards[currentWordEn];
          setFlippedCards((prev) => ({
            ...prev,
            [currentWordEn]: nextFlipped,
          }));
          setActiveWordEn(currentWordEn);
          if (nextFlipped) {
            speakText(currentWordEn);
          }
        }
        return;
      }

      // 5. ArrowLeft / ArrowRight: Navigate cards (front or flipped)
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (isOutsideInput) return;

        if (visibleWords.length > 0 && currentWordEn) {
          const isCurrentlyFlipped = !!flippedCards[currentWordEn];

          // If user is actively typing multiple characters inside spelling input, let them move cursor inside text
          if (!isCurrentlyFlipped && activeEl?.tagName === 'INPUT') {
            const inputEl = activeEl as HTMLInputElement;
            if (inputEl.value.length > 0 && inputEl.selectionStart !== null) {
              if (
                (e.key === 'ArrowLeft' && inputEl.selectionStart > 0) ||
                (e.key === 'ArrowRight' &&
                  inputEl.selectionEnd !== null &&
                  inputEl.selectionEnd < inputEl.value.length)
              ) {
                return;
              }
            }
          }

          e.preventDefault();
          const currentIndex = visibleWords.findIndex((w) => w.en === currentWordEn);
          const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;
          const targetIndex =
            e.key === 'ArrowLeft'
              ? (safeCurrentIndex - 1 + visibleWords.length) % visibleWords.length
              : (safeCurrentIndex + 1) % visibleWords.length;
          const targetWord = visibleWords[targetIndex]?.en;

          if (targetWord) {
            setActiveWordEn(targetWord);

            // Maintain flipped review mode when navigating between flipped cards
            if (isCurrentlyFlipped) {
              setFlippedCards((prev) => ({
                ...prev,
                [targetWord]: true,
              }));
              speakText(targetWord);
            }
          }
          return;
        }
      }

      // 6. Shift + Y/O: Mark correct, Shift + N/X: Mark wrong
      if (e.shiftKey && currentWordEn) {
        const keyLower = e.key.toLowerCase();
        if (keyLower === 'y' || keyLower === 'o' || e.code === 'KeyY' || e.code === 'KeyO') {
          e.preventDefault();
          handleWordStatusChange(currentWordEn, 'correct');
          return;
        }
        if (keyLower === 'n' || keyLower === 'x' || e.code === 'KeyN' || e.code === 'KeyX') {
          e.preventDefault();
          handleWordStatusChange(currentWordEn, 'wrong');
          return;
        }
      }

      // Universal Backquote (` or ~) Detection across all keyboard layouts and IME states
      const isBackquoteKey =
        e.key === '`' ||
        e.key === '~' ||
        e.code === 'Backquote' ||
        e.keyCode === 192;

      // 7. Ctrl + `: Speak target word
      if ((e.ctrlKey || e.metaKey) && isBackquoteKey) {
        if (currentWordEn) {
          e.preventDefault();
          speakText(currentWordEn);
        }
        return;
      }

      // 8. ` or ~ without Ctrl: Speak example sentence
      if (!e.ctrlKey && !e.metaKey && isBackquoteKey) {
        if (currentWordEn) {
          e.preventDefault();
          const targetWordObj = allWords.find((w) => w.en === currentWordEn);
          speakText(targetWordObj?.exampleEn || targetWordObj?.en || currentWordEn);
        }
        return;
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
    isHistoryOpen,
    togglePlayAll,
    stopPlayAll,
    handleToggleWeaknessTraining,
    handleOpenHistoryWithSave,
    handleWordStatusChange,
  ]);

  // Scroll active card into view smoothly whenever activeWordEn changes
  useEffect(() => {
    if (!activeWordEn) return;
    try {
      const cardEl = document.querySelector(`[data-en="${CSS.escape(activeWordEn)}"]`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    } catch {
      // ignore
    }
  }, [activeWordEn]);

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
            onUsernameChange={handleUsernameChange}
            onLogin={() => handleLogin()}
            onSelectHistoryUser={handleSelectHistoryUser}
            onOpenHistory={() => handleOpenHistoryWithSave(true)}
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
