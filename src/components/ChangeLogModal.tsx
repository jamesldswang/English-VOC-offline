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
               <span>🏆 V8.34 卡片背面萬能快捷鍵 & 導航修復版 (最新)</span>
             </div>
             <ul className="list-disc list-inside space-y-1 text-slate-600">
               <li>
                 <strong>背面按 ` 朗讀例句全鍵相容</strong>：支援跨系統與中文輸入法（相容 <code>Backquote</code>、<code>keyCode 192</code>、<code>`</code> 與 <code>~</code>），在字卡翻至背面看答案時，按 <code>`</code> 立即朗讀完整例句，按 <code>Ctrl+`</code> 立即朗讀單字。
               </li>
               <li>
                 <strong>上下鍵 (ArrowUp/Down) 雙向無縫翻面</strong>：解除原先限定輸入框焦點的限制，卡片正面翻至背面、背面翻回正面均可隨時按上下鍵翻轉並同步發音。
               </li>
               <li>
                 <strong>左右鍵 (ArrowLeft/Right) 智慧切換與滑動定位</strong>：卡片翻至背面時按左右鍵可連續瀏覽上一張/下一張卡片背後解析，畫面自動平滑滾動至目標卡片。
               </li>
               <li>
                 <strong>全卡點擊焦點綁定</strong>：點擊卡片正面或背面任何區域立即鎖定為當前作用卡片，確保所有快捷鍵精準作用。
               </li>
             </ul>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
              <GitCommit className="w-3.5 h-3.5 text-slate-500" />
              <span>🔥 V8.33 弱點特訓 Ctrl+3 快捷啟動版</span>
            </div>
            <p className="text-slate-500">
              按 Ctrl+3（或 Cmd+3）隨時啟動或切換弱點特訓模式，自動連動不熟悉度門檻。
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
              <GitCommit className="w-3.5 h-3.5 text-slate-500" />
              <span>🔥 V8.32 歷程看板 Ctrl+2 即刻關閉版</span>
            </div>
            <p className="text-slate-500">
              在「Global 存查歷史紀錄與學習歷程看板」開啟時，按 Ctrl+2 或 Esc 即可隨時關閉視窗。
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
              <GitCommit className="w-3.5 h-3.5 text-slate-500" />
              <span>🔥 V8.31 存查歷史特訓狀態即刻復原版</span>
            </div>
            <p className="text-slate-500">
              按下「存查歷史紀錄 (Ctrl+S)」時，自動儲存並校準門檻，弱點特訓狀態自動恢復為初始未執行狀態。
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
              <GitCommit className="w-3.5 h-3.5 text-slate-500" />
              <span>🔥 V8.30 存查與特訓雙向即時校準門檻版</span>
            </div>
            <p className="text-slate-500">
              存查歷史 (Ctrl+S) 與弱點特訓同軌動態校準門檻：未達 100% 門檻為 maxWrong，達 100% 門檻推升為 maxWrong+1，考錯即改回 maxWrong。
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
              <GitCommit className="w-3.5 h-3.5 text-slate-500" />
              <span>🔥 V8.29 特訓門檻首擊精準鎖定 & 最新錯字即刻列考版</span>
            </div>
            <p className="text-slate-500">
              錯最多次字單擊即定位，最新複習錯字即刻納入特訓名單。
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
              <GitCommit className="w-3.5 h-3.5 text-slate-500" />
              <span>🔥 V8.28 舊生即選即登入 & 新生手動確認雙軌流暢版</span>
            </div>
            <p className="text-slate-500">
              歷史舊生下拉即時登入免按確認，手打新生維持確認登入保護。
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
              <GitCommit className="w-3.5 h-3.5 text-slate-500" />
              <span>🔥 V8.27 存查雙鍵極簡合一 & 不熟悉度滑軌自動定位版</span>
            </div>
            <p className="text-slate-500">
              介面按鈕極簡整合，滑軌最大值與當前值精確依錯字紀錄自適應。
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
              <GitCommit className="w-3.5 h-3.5 text-slate-500" />
              <span>🔥 V8.26 全字庫分母精準對齊與 50% 正確率終極校準版</span>
            </div>
            <p className="text-slate-500">
              歷史紀錄看板分母對齊全庫題數，動態回溯校正歷史錯字與比率。
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
              <GitCommit className="w-3.5 h-3.5 text-slate-500" />
              <span>🔥 V8.25 存查歷程自動儲存整合與不熟悉度門檻自適應強化版</span>
            </div>
            <p className="text-slate-500">
              整合儲存成果於存查按鈕，更新門檻自適應與閉環正確率。
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
              <GitCommit className="w-3.5 h-3.5 text-slate-500" />
              <span>🔥 V8.24 學習歷程看板正確率與總題數追溯對齊版</span>
            </div>
            <p className="text-slate-500">
              修復歷程看板百分比與各模式總題數分母嚴謹對齊。
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
              <GitCommit className="w-3.5 h-3.5 text-slate-500" />
              <span>🔥 V8.23 測驗成績與正確率精準數學對齊版</span>
            </div>
            <p className="text-slate-500">
              存查結算嚴格依據答對題數比率計算，確保各模式統計邏輯閉環。
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
              <GitCommit className="w-3.5 h-3.5 text-slate-500" />
              <span>🔥 V8.22 門檻拉桿即時響應與單字錯誤標記對齊版</span>
            </div>
            <p className="text-slate-500">
              修復門檻拉桿可自由拖曳滑動、錯字次數標記完全對齊。
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
              <GitCommit className="w-3.5 h-3.5 text-slate-500" />
              <span>🔥 V8.21 弱點特訓考題範圍隔離修復與面板即時對齊版</span>
            </div>
            <p className="text-slate-500">
              弱點特訓存查歷程僅針對當前特訓題目評估，已答對字不再誤計。
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
              <GitCommit className="w-3.5 h-3.5 text-slate-500" />
              <span>🔥 V8.20 歷史不熟悉度門檻精準校準與全題型未測全錯重訓版</span>
            </div>
            <p className="text-slate-500">
              門檻最高數值校準、100%全對門檻自動進階、錯字持續特訓。
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
              <GitCommit className="w-3.5 h-3.5 text-slate-500" />
              <span>🔥 V8.19 100%全對自動進階門檻與最新測驗動態判定版</span>
            </div>
            <p className="text-slate-500">
              支援全對門檻自動躍升與最新紀錄判定。
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
              <GitCommit className="w-3.5 h-3.5 text-slate-500" />
              <span>🔥 V8.18 弱點特訓卡片即時過濾與大數據錯字比對修復版</span>
            </div>
            <p className="text-slate-500">
              修復錯字計數大小寫與多重答案字串比對，弱點模式即刻顯示歷史錯字卡。
            </p>
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
