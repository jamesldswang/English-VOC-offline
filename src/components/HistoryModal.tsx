import React, { useEffect } from 'react';
import { X, Trophy, AlertTriangle, Trash2, Calendar, User, CheckCircle2 } from 'lucide-react';
import { QuizRecord } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  history: QuizRecord[];
  currentBankPrefix: string;
  currentUsername: string;
  totalWordsCount: number;
  onClose: () => void;
  onClearCurrentHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  history,
  currentBankPrefix,
  currentUsername,
  totalWordsCount,
  onClose,
  onClearCurrentHistory,
}) => {
  // Listen for Ctrl+2 or Escape to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '2' || e.code === 'Digit2')) {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter history for current user and current bank
  const filteredHistory = history.filter(
    (item) =>
      item.name?.trim() === currentUsername.trim() &&
      item.bankPrefix === currentBankPrefix
  );

  // Aggregate Big Boss error leaderboard across the current context
  const wrongWordsCounter: { [en: string]: { count: number; ch?: string } } = {};
  filteredHistory.forEach((item) => {
    if (item.wrongWords && item.wrongWords.length > 0) {
      item.wrongWords.forEach((w) => {
        if (!wrongWordsCounter[w.en]) {
          wrongWordsCounter[w.en] = { count: 0, ch: w.ch };
        }
        wrongWordsCounter[w.en].count += 1;
      });
    }
  });

  const sortedLeaderboard = Object.entries(wrongWordsCounter)
    .map(([en, data]) => ({ en, ch: data.ch, count: data.count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[88vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <span>Global 存查歷史紀錄與學習歷程看板</span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Firebase 雲端同步
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                目前檢視受測者：<span className="font-bold text-blue-600">{currentUsername || '(未指定)'}</span> • 教材代碼：<span className="font-bold text-emerald-600">{currentBankPrefix || '(全體)'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            title="關閉視窗 (快捷鍵: Ctrl+2 或 Esc)"
            className="px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer flex items-center gap-1 text-xs"
          >
            <span className="hidden sm:inline font-medium">關閉</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono font-bold text-[10px] text-slate-600 shadow-2xs">
              Ctrl+2
            </kbd>
            <X className="w-4 h-4 ml-0.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* History Records Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-3 text-center w-24">受測者</th>
                  <th className="py-3 px-3 w-44">測驗時間</th>
                  <th className="py-3 px-3 text-center w-24">已測 / 總數</th>
                  <th className="py-3 px-3 text-center w-20">正確率</th>
                  <th className="py-3 px-3">❌ 本次答錯單字清單</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                      👋 當前條件下尚無歷史測驗紀錄。
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((item, idx) => {
                    const sessionTotal = totalWordsCount > 0 ? totalWordsCount : (item.total || 4);
                    const wrongCount = item.wrongWords ? item.wrongWords.length : 0;
                    const computedRate =
                      sessionTotal > 0
                        ? `${Math.max(0, Math.round(((sessionTotal - wrongCount) / sessionTotal) * 100))}%`
                        : item.rate;

                    const isPerfect =
                      wrongCount === 0 &&
                      (item.isReviewRound ||
                        item.tested === sessionTotal ||
                        item.tested > 0);

                    const modeLabel = item.isReviewRound ? '🎯 [特訓]' : '📝 [常規]';

                    return (
                      <tr key={idx} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-3 text-center font-bold text-slate-800">
                          {item.name}
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mr-1.5 ${
                              item.isReviewRound
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {modeLabel}
                          </span>
                          {item.time}
                        </td>
                        <td className="py-3 px-3 text-center font-semibold">
                          {sessionTotal} / {sessionTotal}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full font-bold ${
                            computedRate === '100%'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {computedRate}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {isPerfect ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              ✨ 完美全對！超棒
                            </span>
                          ) : !item.wrongWords || item.wrongWords.length === 0 ? (
                            <span className="text-amber-600 font-semibold text-xs">
                              📝 中途離場
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                              {item.wrongWords.map((w, wIdx) => (
                                <span
                                  key={wIdx}
                                  className="inline-flex items-center text-[11px] font-medium bg-rose-50 text-rose-800 px-2 py-0.5 rounded-md border border-rose-200"
                                >
                                  {w.en} {w.ch ? `(${w.ch})` : ''}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Big Boss Leaderboard */}
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-amber-900">
                🔥 累計大魔王排行（目前教材錯字統計）
              </h3>
            </div>

            {sortedLeaderboard.length === 0 ? (
              <p className="text-xs text-amber-700">✨ 目前暫無錯字累計紀錄，保持得很好！</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {sortedLeaderboard.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-white rounded-lg border border-amber-200 shadow-2xs flex items-center justify-between gap-1 text-xs"
                  >
                    <span className="font-bold text-slate-800 truncate" title={item.en}>
                      {item.en}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-extrabold text-[10px] flex-shrink-0">
                      {item.count} 次
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClearCurrentHistory}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>清空目前條件下的歷史紀錄</span>
          </button>

          <button
            onClick={onClose}
            title="關閉看板 (快捷鍵: Ctrl+2 或 Esc)"
            className="px-4 py-1.5 text-xs sm:text-sm font-bold rounded-lg bg-slate-800 hover:bg-slate-900 text-white transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <span>關閉視窗</span>
            <kbd className="px-1.5 py-0.5 bg-slate-700 border border-slate-600 rounded font-mono text-[10px] text-slate-200">
              Ctrl+2
            </kbd>
          </button>
        </div>
      </div>
    </div>
  );
};
