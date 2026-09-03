import React from 'react';
import { X, Keyboard, Command, Volume2, ArrowUpDown, CornerDownLeft, Sparkles } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    {
      keys: ['Ctrl/Cmd', '+', '1'],
      label: '連續朗讀所有考題 🎧',
      desc: '自動依序連續朗讀目前所有可見題目的英文單字與完整例句，直至最後一張 (按 Esc 或再按一次 Ctrl+1 停止)',
    },
    {
      keys: ['Tab'],
      label: '快速切換焦點',
      desc: '依序切換至下一張可見單字卡的拼字輸入框',
    },
    {
      keys: ['↑', '↓'],
      label: '翻轉卡片 / 單字發音',
      desc: '在輸入框中按方向鍵上下，可翻轉卡片並自動朗讀英文單字',
    },
    {
      keys: ['←', '→'],
      label: '翻面導航',
      desc: '卡片翻至背面時，按左右箭頭直接切換上一張或下一張卡片',
    },
    {
      keys: ['Shift', '+', 'Y / O'],
      label: '判定為正確 ⭕',
      desc: '快速給予當前卡片正確成績，標記綠燈',
    },
    {
      keys: ['Shift', '+', 'N / X'],
      label: '判定為錯誤 ❌',
      desc: '快速給予當前卡片錯誤成績，標記紅燈並翻回正面重練',
    },
    {
      keys: ['Ctrl/Cmd', '+', '`'],
      label: '朗讀英文單字 🔊',
      desc: '隨時重聽當前選中卡片的核心英文發音 (卡片背面的「聽單字」按鈕同此功能)',
    },
    {
      keys: ['`', '或', '~'],
      label: '朗讀英文例句 📢',
      desc: '聆聽當前單字的完整例句發音與語調練習',
    },
    {
      keys: ['Ctrl/Cmd', '+', 'S'],
      label: '即時儲存成果 💾',
      desc: '手動將本次測驗統計數據與錯字清單寫入歷史紀錄，並開啟歷史歷程看板',
    },
    {
      keys: ['Ctrl/Cmd', '+', '2'],
      label: '關閉歷史歷程看板 ✖️',
      desc: '隨時關閉 Global 存查歷史紀錄與學習歷程看板視窗 (按 Esc 亦可關閉)',
    },
    {
      keys: ['Ctrl/Cmd', '+', '3'],
      label: '啟動/退出弱點特訓 🔥',
      desc: '一鍵開啟或切換弱點特訓模式，自動根據歷史錯字與不熟悉度門檻展開特訓卡片',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                ⌨️ 全套鍵盤特訓快捷鍵指南
              </h2>
              <p className="text-[11px] text-slate-500">
                雙手不用離開鍵盤，輕鬆實現高速盲打與複習
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto max-h-[70vh] divide-y divide-slate-100">
          {shortcuts.map((item, idx) => (
            <div key={idx} className="py-2.5 flex items-start justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-800 block mb-0.5">
                  {item.label}
                </span>
                <span className="text-slate-500 text-[11px] leading-relaxed">
                  {item.desc}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {item.keys.map((k, kIdx) => (
                  <kbd
                    key={kIdx}
                    className="px-2 py-1 bg-slate-100 border border-slate-300 rounded shadow-2xs font-mono font-bold text-slate-700 text-[11px]"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer"
          >
            我瞭解了，開始特訓！
          </button>
        </div>
      </div>
    </div>
  );
};
