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
          <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-300">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-sm mb-1.5">
              <GitCommit className="w-4 h-4 text-emerald-600" />
              <span>🏆 V8.41 本地字庫記錄管理與即時覆蓋取代版 (最新)</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>
                <strong>點擊手動上傳彈出專屬「本地字庫管理看板」</strong>：點擊「📥 手動上傳本地 JSON」時開啟管理記錄面板，完整列出所有已上傳並儲存於瀏覽器的本地字庫。
              </li>
              <li>
                <strong>個別字庫即時統計 (不熟字/總字數)</strong>：每張本地字庫紀錄卡片清晰顯示專屬的 <code>不熟字/總字數： [未熟]/[總數]</code>、掌握度進度條與百分比，掌握狀態一目了然。
              </li>
              <li>
                <strong>支援一鍵覆蓋取代 (Replace) 與刪除管理</strong>：每個字庫皆提供 <code>🔄 覆蓋取代</code> 按鈕，可直接挑選新 JSON 檔案無縫更新該字庫單字內容與題數；亦支援一鍵刪除。
              </li>
              <li>
                <strong>拖曳與點擊上傳新字庫</strong>：看板內建拖曳上傳與檔案挑選區，新上傳字庫自動永久儲存於瀏覽器並即時載入。
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
              <GitCommit className="w-3.5 h-3.5 text-slate-500" />
              <span>✨ V8.40 本地上傳題庫瀏覽器持久化保存版</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>
                <strong>手動上傳本地 JSON 題庫永久保存於瀏覽器</strong>：手動上傳本地 JSON 題庫後，系統立即自動將其永久儲存於瀏覽器 LocalStorage（<code>fhl_custom_uploaded_banks</code>）。
              </li>
              <li>
                <strong>題庫市集專屬分組與無縫切換</strong>：題庫下拉選單新增 <code>💾 本地上傳題庫</code> 專屬群組，標註 <code>📁 [本地儲存]</code>。
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
              <GitCommit className="w-3.5 h-3.5 text-slate-500" />
              <span>✨ V8.38 弱點特訓卡片留存 & Ctrl+S 結算對錯版</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>
                <strong>特訓卡片完整留存不消失</strong>：修正在特訓過程中每答對一題即觸發提早結算導致門檻推升、卡片瞬間消失的問題。現在無論拼字正確或標記答對，卡片皆安穩保留在畫面上並標註綠色勾勾，保持練習節奏流暢。
              </li>
              <li>
                <strong>Ctrl+S 統一結算對錯</strong>：作答進度僅於本機安全快取，直到受測者按下 <code>Ctrl+S</code>（或點擊「存查歷史紀錄」）時，才一併統一計算本次特訓的所有對錯、更新題庫歷程、校準門檻並同步 Firebase。
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
              <GitCommit className="w-3.5 h-3.5 text-slate-500" />
              <span>✨ V8.37 雲端教材市集分子最新測驗實況精準校準版</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>
                <strong>最新實況即時對齊</strong>：教材市集分子與全域統計指標精準對齊歷史歷程中最新一筆測驗結果，當測驗達成 100% 全對時，選項即時精確顯示為 <code>[0/4]</code>。
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
              <GitCommit className="w-3.5 h-3.5 text-slate-500" />
              <span>✨ V8.36 Firebase 雲端同步 & 全域掌握度指標雙軌版</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>
                <strong>受測者三大核心指標橫幅</strong>：在「快捷鍵指南」按鈕右側新增專屬膠囊面板，格式精確呈現 <code>📊 不熟字/總題數： 2721 / 3236 | 熟悉字： 515</code>。
              </li>
              <li>
                <strong>Firebase Firestore 雲端無縫整合</strong>：正式串接 Firebase 雲端資料庫，存查紀錄自動同步上傳與開機雙向無損聚合。
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
              <GitCommit className="w-3.5 h-3.5 text-slate-500" />
              <span>✨ V8.35 雲端教材市集分子分母精確顯示版</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>
                <strong>智慧雲端教材市集分子/分母精準對齊</strong>：下拉選單各題庫選項格式嚴格呈現 <code>題庫名稱 [分子/分母] (分類說明)</code>，如 <code>01_國中字庫.json [0/62] (01. 國中基礎單字清單 (A 名詞/代名詞篇))</code>。
              </li>
              <li>
                <strong>分母為每個字庫總數</strong>：精確讀取並統計所有雲端字庫真實單字總量（如 62、65、63 等）。
              </li>
              <li>
                <strong>分子為受測者還未答對題數</strong>：即時連動當前受測者的測驗歷程與當前答題狀態，未答對題目自動列為分子；完成且全對時精準顯示為 <code>0</code>。
              </li>
              <li>
                <strong>極速秒載與預設選單體驗</strong>：預先整合全套雲端字庫元資料，市集選單無延遲秒級展開；預設顯示 <code>-- 請選擇題庫 --</code>，選取即載入。
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
              <GitCommit className="w-3.5 h-3.5 text-slate-500" />
              <span>✨ V8.34 卡片背面萬能快捷鍵 & 導航修復版</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>
                <strong>背面按 ` 朗讀例句全鍵相容</strong>：支援跨系統與中文輸入法（相容 <code>Backquote</code>、<code>keyCode 192</code>、<code>`</code> 與 <code>~</code>），按 <code>`</code> 朗讀例句，按 <code>Ctrl+`</code> 朗讀單字。
              </li>
              <li>
                <strong>上下鍵 (ArrowUp/Down) 雙向翻面</strong>：隨時按上下鍵翻面並發音。
              </li>
              <li>
                <strong>左右鍵 (ArrowLeft/Right) 平滑切換</strong>：背面按左右鍵連續切換上一張/下一張卡片。
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
