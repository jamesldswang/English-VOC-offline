import React, { useRef } from 'react';
import { Globe, BookOpen, Upload, Trash2, Loader2 } from 'lucide-react';
import { CloudBankItem } from '../types';

interface WordBankPanelProps {
  cloudBanks: CloudBankItem[];
  unansweredCounts: Record<string, number>;
  currentBankFileName: string;
  isLoadingCloud: boolean;
  onSelectBank: (fileName: string) => void;
  onUploadLocalBank: (file: File) => void;
  onClearBank: () => void;
}

export const WordBankPanel: React.FC<WordBankPanelProps> = ({
  cloudBanks,
  unansweredCounts,
  currentBankFileName,
  isLoadingCloud,
  onSelectBank,
  onUploadLocalBank,
  onClearBank,
}) => {
  const bankInputRef = useRef<HTMLInputElement>(null);

  const handleBankUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadLocalBank(file);
      if (bankInputRef.current) {
        bankInputRef.current.value = '';
      }
    }
  };

  const hasCurrentInList = Boolean(
    currentBankFileName && cloudBanks.some((b) => b.fileName === currentBankFileName)
  );

  return (
    <div className="bg-emerald-50/70 p-4 rounded-xl shadow-xs border border-emerald-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      {/* Cloud Marketplace Selector */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-sm">
          <Globe className="w-4 h-4 text-emerald-600" />
          <span>🌐 智慧雲端教材市集：</span>
        </div>

        <div className="relative">
          <select
            value={currentBankFileName || ''}
            onChange={(e) => {
              if (e.target.value) {
                onSelectBank(e.target.value);
              }
            }}
            disabled={isLoadingCloud}
            tabIndex={-1}
            className="px-3 py-1.5 text-sm font-semibold border border-emerald-400 rounded-lg bg-white text-slate-800 outline-none hover:border-emerald-500 cursor-pointer shadow-xs max-w-sm md:max-w-xl truncate"
          >
            <option value="">
              {isLoadingCloud ? '📡 雲端題庫載入中...' : '-- 請選擇題庫 --'}
            </option>

            {/* If currently selected bank is a custom or starter bank not in cloudBanks list */}
            {currentBankFileName && !hasCurrentInList && (
              <option value={currentBankFileName}>
                {currentBankFileName} [
                {unansweredCounts[currentBankFileName] ?? 0}/
                {unansweredCounts[currentBankFileName] ?? 0}]
              </option>
            )}

            {cloudBanks.map((bank) => {
              const unans = unansweredCounts[bank.fileName] ?? bank.totalWords;
              const titlePart = bank.categoryTitle ? ` (${bank.categoryTitle})` : '';
              const label = `${bank.fileName} [${unans}/${bank.totalWords}]${titlePart}`;
              return (
                <option key={bank.fileName} value={bank.fileName}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>

        {isLoadingCloud && (
          <span className="flex items-center gap-1 text-xs text-emerald-700 font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            同步中...
          </span>
        )}

        <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100/90 text-blue-900 border border-blue-200 rounded-md text-xs font-bold truncate max-w-xs">
          <BookOpen className="w-3 h-3 flex-shrink-0 text-blue-700" />
          <span className="truncate">
            {currentBankFileName ? currentBankFileName : '🚫 尚未加載 any 單字庫'}
          </span>
        </div>
      </div>

      {/* Manual Upload and Clear */}
      <div className="flex items-center gap-2">
        <input
          ref={bankInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleBankUpload}
        />
        <button
          onClick={() => bankInputRef.current?.click()}
          tabIndex={-1}
          className="px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs flex items-center gap-1 cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>📥 手動上傳本地 JSON</span>
        </button>

        <button
          onClick={onClearBank}
          tabIndex={-1}
          className="px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition shadow-xs flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>🗑️ 清空單字庫</span>
        </button>
      </div>
    </div>
  );
};
