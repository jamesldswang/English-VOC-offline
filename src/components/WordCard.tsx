import React, { useEffect, useRef } from 'react';
import { Volume2, Check, X, Flame } from 'lucide-react';
import { WordItem, WordProgressStatus } from '../types';
import { speakText } from '../utils/speech';
import { evaluateSpellingInput } from '../utils/spellCheck';

interface WordCardProps {
  word: WordItem;
  status: WordProgressStatus;
  wrongCount: number;
  isFlipped: boolean;
  isActiveFocus: boolean;
  isSystemLocked?: boolean;
  onFlipToggle: () => void;
  onStatusChange: (status: WordProgressStatus) => void;
  onFocus: () => void;
}

export const WordCard: React.FC<WordCardProps> = ({
  word,
  status,
  wrongCount,
  isFlipped,
  isActiveFocus,
  isSystemLocked = false,
  onFlipToggle,
  onStatusChange,
  onFocus,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [typedValue, setTypedValue] = React.useState('');

  // Synchronize focus if active
  useEffect(() => {
    if (isActiveFocus && !isFlipped && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActiveFocus, isFlipped]);

  // Reset input if status resets
  useEffect(() => {
    if (!status && inputRef.current) {
      setTypedValue('');
    }
  }, [status]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSystemLocked) {
      setTypedValue('');
      return;
    }

    const val = e.target.value;
    setTypedValue(val);

    if (!val.trim()) return;

    const result = evaluateSpellingInput(val, word.en);
    if (result.isCorrect) {
      speakText(word.en);
      onStatusChange('correct');
    } else if (result.isWrong) {
      onStatusChange('wrong');
    }
  };

  const handleFrontClick = (e: React.MouseEvent) => {
    if (isSystemLocked) return;
    // Don't flip if clicked inside input or sentence audio button
    if (
      (e.target as HTMLElement).tagName === 'INPUT' ||
      (e.target as HTMLElement).closest('.audio-trigger')
    ) {
      return;
    }
    onFlipToggle();
    speakText(word.en);
  };

  const handleBackClick = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest('.btn-grade') ||
      (e.target as HTMLElement).closest('.example-box') ||
      (e.target as HTMLElement).closest('.word-audio-trigger') ||
      (e.target as HTMLElement).closest('.word-audio-box')
    ) {
      return;
    }
    onFlipToggle();
  };

  const handleWordSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakText(word.en);
  };

  const handleSentenceSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakText(word.exampleEn || word.en);
  };

  return (
    <div
      className={`relative w-full h-[335px] [perspective:1000px] select-none transition-transform duration-200 ${
        isActiveFocus ? 'scale-[1.01]' : ''
      }`}
      data-en={word.en}
    >
      <div
        className={`relative w-full h-full text-center transition-transform duration-400 [transform-style:preserve-3d] rounded-2xl ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* ==================== FRONT SIDE ==================== */}
        <div
          onClick={handleFrontClick}
          className={`absolute inset-0 w-full h-full rounded-2xl p-4 flex flex-col justify-between items-center bg-white border cursor-pointer shadow-xs [backface-visibility:hidden] transition-all duration-200 ${
            status === 'correct'
              ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-400'
              : status === 'wrong'
              ? 'border-rose-400 bg-rose-50/40 ring-1 ring-rose-300'
              : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
          } ${isActiveFocus ? 'ring-2 ring-blue-500 ring-offset-2 border-blue-500' : ''}`}
        >
          {/* Top Badges */}
          <div className="w-full flex justify-between items-start pointer-events-none">
            {wrongCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300 shadow-xs">
                <Flame className="w-3 h-3 text-amber-600" />
                錯 {wrongCount} 次
              </span>
            ) : (
              <span />
            )}

            {status === 'correct' && (
              <span className="text-emerald-600 font-extrabold text-base animate-bounce">
                🟢
              </span>
            )}
            {status === 'wrong' && (
              <span className="text-rose-600 font-extrabold text-base animate-pulse">
                🔴
              </span>
            )}
          </div>

          {/* Center Content */}
          <div className="flex flex-col items-center pointer-events-none -mt-1">
            <span className="text-4xl sm:text-5xl mb-1.5 filter drop-shadow-xs">
              {word.icon || '📝'}
            </span>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-tight">
              {word.ch}
            </h3>
            {word.pos && (
              <span className="text-xs font-semibold text-blue-600 mt-0.5">
                {word.pos}
              </span>
            )}
          </div>

          {/* Bottom Section */}
          <div className="w-full flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleSentenceSpeak}
              className="audio-trigger text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-dashed border-blue-200 px-3 py-1 rounded-full transition cursor-pointer flex items-center gap-1"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>🔊 聽整句</span>
            </button>

            <input
              ref={inputRef}
              type="text"
              value={typedValue}
              onChange={handleInputChange}
              onFocus={onFocus}
              disabled={isSystemLocked}
              placeholder="試著拼拼看英文..."
              autoComplete="off"
              spellCheck={false}
              className="w-11/12 px-3 py-1.5 text-center text-sm font-medium border border-slate-300 focus:border-blue-500 rounded-full outline-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-200 transition text-slate-800"
            />

            <span className="text-[10px] text-slate-400 font-medium">
              或點擊空白處看答案發音
            </span>
          </div>
        </div>

        {/* ==================== BACK SIDE ==================== */}
        <div
          onClick={handleBackClick}
          className={`absolute inset-0 w-full h-full rounded-2xl p-3.5 flex flex-col justify-between items-center bg-blue-50/90 border cursor-pointer shadow-md [backface-visibility:hidden] [transform:rotateY(180deg)] transition-all duration-200 ${
            status === 'correct'
              ? 'border-emerald-500 bg-emerald-50/90 ring-2 ring-emerald-400'
              : status === 'wrong'
              ? 'border-rose-500 bg-rose-50/90 ring-2 ring-rose-400'
              : 'border-blue-200 hover:border-blue-400'
          } ${isActiveFocus ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
        >
          {/* Audio & Word Section */}
          <div
            onClick={handleWordSpeak}
            title="點擊播放單字發音 (或按 Ctrl + `)"
            className="word-audio-box w-full py-2 px-2.5 rounded-xl bg-white/80 hover:bg-white border border-blue-200/80 transition flex flex-col items-center cursor-pointer group shadow-2xs"
          >
            <span
              className={`text-xl font-black tracking-tight leading-snug group-hover:text-blue-700 transition ${
                status === 'correct'
                  ? 'text-emerald-800'
                  : status === 'wrong'
                  ? 'text-rose-800'
                  : 'text-blue-900'
              }`}
            >
              {word.en}
            </span>
            {word.kk && (
              <span className="text-xs font-mono font-bold text-amber-700 mt-0.5">
                {word.kk}
              </span>
            )}
            {word.pos && (
              <span className="text-[11px] font-semibold text-blue-600">
                {word.pos}
              </span>
            )}
            <button
              type="button"
              onClick={handleWordSpeak}
              className="word-audio-trigger mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 active:bg-blue-300 border border-blue-300 shadow-2xs transition cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>🔊 聽單字</span>
            </button>
          </div>

          {/* Example Sentence Box */}
          <div
            onClick={handleSentenceSpeak}
            title="點擊朗讀完整例句 (或按 ` / ~)"
            className="example-box w-full p-2.5 rounded-xl bg-white/85 hover:bg-white border border-dashed border-blue-300 hover:border-blue-500 transition text-left cursor-pointer shadow-2xs"
          >
            <div className="text-xs font-medium text-slate-800 italic leading-snug">
              {word.exampleEn || 'No example sentence provided.'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 leading-snug">
              {word.exampleCh || '暫無例句翻譯。'}
            </div>
            <div className="text-right text-[10px] text-blue-600 font-bold mt-0.5 flex items-center justify-end gap-0.5">
              <Volume2 className="w-2.5 h-2.5" />
              <span>點擊讀整句</span>
            </div>
          </div>

          {/* Quiz Action Buttons */}
          <div className="w-full grid grid-cols-2 gap-2 mt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange('wrong');
                setTimeout(() => {
                  onFlipToggle();
                }, 200);
              }}
              className="btn-grade py-1.5 px-2 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer border border-rose-300"
            >
              <X className="w-3.5 h-3.5" />
              <span>❌ 錯了</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange('correct');
              }}
              className="btn-grade py-1.5 px-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer border border-emerald-300"
            >
              <Check className="w-3.5 h-3.5" />
              <span>⭕ 對了</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
