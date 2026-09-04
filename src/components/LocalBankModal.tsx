import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Database,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  BarChart2,
  ArrowRight,
  FolderOpen,
} from 'lucide-react';
import { CloudBankItem } from '../types';

interface LocalBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  localBanks: CloudBankItem[];
  currentBankFileName: string;
  unansweredCounts: Record<string, number>;
  onSelectBank: (fileName: string) => void;
  onUploadNewBank: (file: File) => void;
  onReplaceBank: (targetFileName: string, file: File) => void;
  onDeleteBank: (fileName: string) => void;
}

export const LocalBankModal: React.FC<LocalBankModalProps> = ({
  isOpen,
  onClose,
  localBanks,
  currentBankFileName,
  unansweredCounts,
  onSelectBank,
  onUploadNewBank,
  onReplaceBank,
  onDeleteBank,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replacingTargetName, setReplacingTargetName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadNewBank(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleStartReplace = (targetFileName: string) => {
    setReplacingTargetName(targetFileName);
    if (replaceInputRef.current) {
      replaceInputRef.current.value = '';
      replaceInputRef.current.click();
    }
  };

  const handleReplaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && replacingTargetName) {
      onReplaceBank(replacingTargetName, file);
      setReplacingTargetName(null);
      if (replaceInputRef.current) {
        replaceInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.json')) {
        alert('請上傳 .json 格式的題庫檔案');
        return;
      }
      onUploadNewBank(file);
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '未知時間';
    const date = new Date(timestamp);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      id="local-bank-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="local-bank-modal-card"
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Hidden inputs */}
        <input
          ref={fileInputRef}
          id="local-bank-file-input"
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleUploadChange}
        />
        <input
          ref={replaceInputRef}
          id="local-bank-replace-input"
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleReplaceChange}
        />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-2xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-800">
                  📁 本地字庫管理看板
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                  共 {localBanks.length} 個題庫
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                永久保存於瀏覽器 LocalStorage，下次開啟免再上傳 • 支援覆蓋取代與個別弱點統計
              </p>
            </div>
          </div>
          <button
            id="close-local-bank-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            title="關閉看板 (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Upload / Drag & Drop Area */}
          <div
            id="local-bank-dropzone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/80 scale-[0.99]'
                : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/40 bg-slate-50/60'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100/90 text-emerald-700 flex items-center justify-center shadow-2xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800">
                點擊上傳或將 JSON 題庫檔案拖曳至此
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                支援分類陣列 <code>[{'{'}category, list: [...]{'}'}]</code> 或純單字清單 <code>[{'{'}en, ch...{'}'}]</code>
              </div>
            </div>
            <button
              type="button"
              id="browse-local-bank-btn"
              tabIndex={-1}
              className="mt-1 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-xs flex items-center gap-1.5"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>瀏覽本機檔案 (.json)</span>
            </button>
          </div>

          {/* Stored Word Banks List */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                已儲存本機字庫紀錄列表
              </span>
              <span className="text-xs text-slate-400">
                單字答對自動併入全域統計
              </span>
            </div>

            {localBanks.length === 0 ? (
              <div
                id="local-bank-empty-state"
                className="py-10 text-center rounded-xl border border-slate-200 bg-slate-50/60 px-4"
              >
                <Database className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <div className="text-sm font-bold text-slate-700">尚未儲存任何本地字庫</div>
                <div className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  請將您的單字 JSON 檔案上傳，系統將自動永久保存於此瀏覽器中，供隨時測驗與個別字庫掌握度追蹤。
                </div>
              </div>
            ) : (
              <div id="local-bank-list" className="space-y-3">
                {localBanks.map((bank) => {
                  const isCurrent = bank.fileName === currentBankFileName;
                  const total = bank.totalWords || 0;
                  const unans = unansweredCounts[bank.fileName] ?? total;
                  const mastered = Math.max(0, total - unans);
                  const masteryRate = total > 0 ? Math.round((mastered / total) * 100) : 0;
                  const isAllMastered = total > 0 && unans === 0;

                  return (
                    <div
                      key={bank.fileName}
                      id={`local-bank-item-${bank.fileName.replace(/[^a-zA-Z0-9_-]/g, '_')}`}
                      className={`p-3.5 sm:p-4 rounded-xl border transition ${
                        isCurrent
                          ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                      }`}
                    >
                      {/* Bank Header Info */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-sm sm:text-base truncate">
                              {bank.fileName}
                            </span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-2xs font-bold">
                                🎯 目前測驗中
                              </span>
                            )}
                            {isAllMastered && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-2xs font-bold flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                100% 全部掌握
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                            <span className="text-slate-700 font-medium">
                              🏷️ {bank.categoryTitle || '本地題庫'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(bank.uploadedAt)}
                            </span>
                          </div>
                        </div>

                        {/* Actions for this bank */}
                        <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center">
                          {!isCurrent ? (
                            <button
                              id={`load-bank-btn-${bank.fileName.replace(/[^a-zA-Z0-9_-]/g, '_')}`}
                              onClick={() => {
                                onSelectBank(bank.fileName);
                                onClose();
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                              title="立即切換至此題庫進行測驗與特訓"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                              <span>載入測驗</span>
                            </button>
                          ) : (
                            <span className="px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>使用中</span>
                            </span>
                          )}

                          <button
                            id={`replace-bank-btn-${bank.fileName.replace(/[^a-zA-Z0-9_-]/g, '_')}`}
                            onClick={() => handleStartReplace(bank.fileName)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1 cursor-pointer border border-slate-200"
                            title={`以新的 JSON 檔案覆蓋更新 [${bank.fileName}]`}
                          >
                            <RefreshCw className="w-3 h-3 text-slate-600" />
                            <span>覆蓋取代</span>
                          </button>

                          <button
                            id={`delete-bank-btn-${bank.fileName.replace(/[^a-zA-Z0-9_-]/g, '_')}`}
                            onClick={() => onDeleteBank(bank.fileName)}
                            className="px-2 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition flex items-center gap-1 cursor-pointer border border-rose-200"
                            title={`自瀏覽器移除本機題庫 [${bank.fileName}]`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">刪除</span>
                          </button>
                        </div>
                      </div>

                      {/* Word Bank Statistics: (不熟字/總字數) */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                            <BarChart2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>
                              不熟字/總字數：
                              <strong className={unans > 0 ? 'text-amber-700' : 'text-emerald-700'}>
                                {unans}
                              </strong>
                              {' / '}
                              <span className="text-slate-800">{total}</span>
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 font-medium">
                            掌握度{' '}
                            <strong className="text-emerald-700">{masteryRate}%</strong> (已熟{' '}
                            {mastered} 題)
                          </div>
                        </div>

                        {/* Mastery Progress Bar */}
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isAllMastered
                                ? 'bg-emerald-500'
                                : masteryRate > 50
                                ? 'bg-emerald-600'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${masteryRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>支援一鍵切換與覆蓋更新，測驗成果即時同步至雲端與全域指標。</span>
          </div>
          <button
            id="close-local-bank-footer-btn"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold transition cursor-pointer shadow-xs"
          >
            關閉看板
          </button>
        </div>
      </div>
    </div>
  );
};
