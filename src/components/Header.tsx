import React from 'react';
import { Volume2, Sparkles, ExternalLink, Keyboard, BarChart2 } from 'lucide-react';
import { isInAppBrowser } from '../utils/storage';

interface HeaderProps {
  onOpenKeyboardShortcuts: () => void;
  userStats?: {
    unfamiliarCount: number;
    totalWordsCount: number;
    familiarCount: number;
  };
}

export const Header: React.FC<HeaderProps> = ({ onOpenKeyboardShortcuts, userStats }) => {
  const showMobileFix = isInAppBrowser();

  const handleOpenExternal = () => {
    let url = window.location.href;
    try {
      if (window.top) url = window.top.location.href;
    } catch {
      // ignore cross-origin error
    }
    window.open(url, '_blank');
  };

  const hasStats = Boolean(userStats && userStats.totalWordsCount > 0);

  return (
    <header className="mb-6 text-center max-w-5xl mx-auto pt-2">
      {/* In-App Browser Audio Wakeup Portal */}
      {showMobileFix && (
        <div className="mb-4 text-center">
          <button
            onClick={handleOpenExternal}
            className="w-full max-w-2xl mx-auto block bg-amber-900 text-amber-100 font-bold text-sm sm:text-base p-3.5 rounded-xl border-2 border-dashed border-amber-400 shadow-lg hover:bg-amber-800 transition"
          >
            📢 手機 LINE / FB 開啟無聲音？請點此開啟外部獨立瀏覽器視窗 (發音 100% 正常！)
            <ExternalLink className="inline ml-2 w-4 h-4" />
          </button>
        </div>
      )}

      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2 shadow-xs">
        <Sparkles className="w-3.5 h-3.5" />
        V8.38 弱點特訓卡片留存 & Ctrl+S 結算對錯版 • 通用字卡平台
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center justify-center gap-2">
          <span>💼 智慧英文單字語音互動特訓看板</span>
        </h1>

        <button
          onClick={onOpenKeyboardShortcuts}
          title="鍵盤快捷鍵指南"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition shadow-xs whitespace-nowrap cursor-pointer"
        >
          <Keyboard className="w-3.5 h-3.5 text-slate-500" />
          快捷鍵指南
        </button>

        {/* User Global Vocabulary Stats Badge: 不熟字/總題數 | 熟悉字 */}
        {hasStats && userStats && (
          <div
            title="受測者全域字庫掌握進度統計 (Firebase 雲端與歷史歷程聯動)"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-50/90 border border-sky-300 text-sky-900 text-xs font-semibold shadow-xs select-none animate-in fade-in duration-300"
          >
            <span className="text-sm">📊</span>
            <span>不熟字/總題數：</span>
            <span className="font-bold text-sky-700">
              {userStats.unfamiliarCount} / {userStats.totalWordsCount}
            </span>
            <span className="text-sky-300 font-light mx-0.5">|</span>
            <span>熟悉字：</span>
            <span className="font-bold text-emerald-700">{userStats.familiarCount}</span>
          </div>
        )}
      </div>

      <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-3xl mx-auto leading-relaxed">
        支援雲端題庫與自訂 JSON！登入受測者並加載字庫，即可透過鍵盤盲打或語音即時特訓。
      </p>
    </header>
  );
};

