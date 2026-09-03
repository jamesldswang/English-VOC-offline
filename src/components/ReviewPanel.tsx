import React from 'react';
import { Sliders, RotateCcw, Flame, Headphones, Square } from 'lucide-react';

interface ReviewPanelProps {
  sliderValue: number;
  sliderMax: number;
  isTrainingMode: boolean;
  isPlayingAll: boolean;
  playAllProgressText?: string;
  onSliderChange: (val: number) => void;
  onResetAllQuestions: () => void;
  onToggleWeaknessTraining: () => void;
  onTogglePlayAll: () => void;
}

export const ReviewPanel: React.FC<ReviewPanelProps> = ({
  sliderValue,
  sliderMax,
  isTrainingMode,
  isPlayingAll,
  playAllProgressText,
  onSliderChange,
  onResetAllQuestions,
  onToggleWeaknessTraining,
  onTogglePlayAll,
}) => {
  return (
    <div className="bg-amber-50/60 p-4 rounded-xl shadow-xs border border-amber-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      {/* Slider Filter Area */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-amber-900 font-bold text-sm">
          <Sliders className="w-4 h-4 text-amber-600" />
          <span>🎯 篩選歷史不熟悉度門檻：</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="range"
            min={1}
            max={Math.max(1, sliderMax)}
            value={sliderValue}
            onChange={(e) => onSliderChange(parseInt(e.target.value, 10))}
            tabIndex={-1}
            className="w-28 sm:w-36 h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600 hover:bg-amber-300 transition"
          />
          <span className="font-extrabold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 min-w-8 text-center text-sm shadow-xs">
            {sliderValue}
          </span>
        </div>

        <span className="text-xs text-amber-800/80 font-medium">
          (代表該單字在歷史中至少答錯 {sliderValue} 次)
        </span>
      </div>

      {/* Buttons Area */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Continuous Playback (Ctrl + 1) */}
        <button
          onClick={onTogglePlayAll}
          tabIndex={-1}
          title="依序自動朗讀目前所有考題的單字與例句 (快捷鍵: Ctrl+1)"
          className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer ${
            isPlayingAll
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white ring-2 ring-indigo-400 ring-offset-1 animate-pulse'
              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-300'
          }`}
        >
          {isPlayingAll ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>⏹️ 停止朗讀 ({playAllProgressText || '播放中'})</span>
            </>
          ) : (
            <>
              <Headphones className="w-3.5 h-3.5 text-indigo-600" />
              <span>🎧 連續朗讀考題 (Ctrl+1)</span>
            </>
          )}
        </button>

        <button
          onClick={onResetAllQuestions}
          tabIndex={-1}
          className="px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>🔄 全部重考</span>
        </button>

        <button
          onClick={onToggleWeaknessTraining}
          tabIndex={-1}
          title={isTrainingMode ? '退出弱點特訓 (快捷鍵: Ctrl+3)' : '啟動弱點特訓 (快捷鍵: Ctrl+3)'}
          className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer ${
            isTrainingMode
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400 ring-offset-1'
              : 'bg-amber-600 hover:bg-amber-700 text-white'
          }`}
        >
          <Flame className={`w-3.5 h-3.5 ${isTrainingMode ? 'text-emerald-200 animate-pulse' : 'text-amber-200'}`} />
          <span>{isTrainingMode ? '🟢 弱點特訓中' : '🔥 弱點特訓'}</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.2 bg-black/20 rounded font-mono text-[10px] text-white/90">
            Ctrl+3
          </kbd>
        </button>
      </div>
    </div>
  );
};
