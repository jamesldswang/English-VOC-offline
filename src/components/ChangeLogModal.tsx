import React from 'react';
import { X, GitCommit, Sparkles, CheckCircle } from 'lucide-react';

interface ChangeLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangeLogModal: React.FC<ChangeLogModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-800">
              📜 系統版本更新日誌 (Change Log)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 max-h-[70vh] text-xs leading-relaxed text-slate-700">
          <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900 text-sm mb-1.5">
              <GitCommit className="w-4 h-4 text-indigo-600" />
              <span>🔥 V8.18 弱點特訓卡片即時過濾與大數據錯字比對修復版 (最新)</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>
                <strong>弱點特訓錯字比對全面強化</strong>：修復錯字計數大小寫與多重答案字串比對，弱點模式開啟時門檻預設為 1，即刻顯示所有歷史曾錯單字卡。
              </li>
              <li>
                <strong>歷史紀錄即時同步 (State Sync)</strong>：新增歷程版本聯動機制，儲存、清除或匯入紀錄後立即精準更新弱點特訓卡片池。
              </li>
              <li>
                <strong>自動遞增版本</strong>：版本號推進至 V8.18。
              </li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm mb-1.5">
              <GitCommit className="w-4 h-4 text-slate-500" />
              <span>🔧 V8.13 本地字庫相容修復版</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>
                <strong>優化檔名識別邏輯</strong>：解決手動上傳本地 JSON 時檔名無底線導致 `bankPrefix` 判讀失敗的問題。
              </li>
              <li>
                <strong>修正作答時卡片消失 BUG</strong>：修復作答途中自動儲存會觸發弱點過濾導致卡片突然消失的狀況。
              </li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm mb-1.5">
              <GitCommit className="w-4 h-4 text-slate-500" />
              <span>🛑 V8.12 嚴格拼字防錯版</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>
                <strong>多字 / 錯字即時判定</strong>：當輸入長度超出標準答案，或字元無法組成正確答案前綴時，系統立即判定為答錯 (❌)。
              </li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm mb-1.5">
              <GitCommit className="w-4 h-4 text-slate-500" />
              <span>⚡ V8.10 快捷鍵盲打支援</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>
                加入全套鍵盤快捷鍵：`Tab` 切換卡片、`ArrowUp/Down` 翻卡朗讀、`Shift+Y/N` 批改。
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-900 text-white transition cursor-pointer"
          >
            關閉日誌
          </button>
        </div>
      </div>
    </div>
  );
};
