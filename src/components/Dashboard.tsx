import React from 'react';
import { Target, CheckCircle2, XCircle, Award, ListChecks } from 'lucide-react';

interface DashboardProps {
  totalWords: number;
  testedCount: number;
  correctCount: number;
  wrongCount: number;
  masteryRate: number;
}

export const Dashboard: React.FC<DashboardProps> = ({
  totalWords,
  testedCount,
  correctCount,
  wrongCount,
  masteryRate,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-center">
      {/* Total Words */}
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center justify-center">
        <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <ListChecks className="w-3.5 h-3.5" />
          <span>單字總數</span>
        </div>
        <div className="text-2xl font-black text-slate-800 tracking-tight">
          {totalWords}
        </div>
      </div>

      {/* Tested Count */}
      <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 flex flex-col items-center justify-center">
        <div className="flex items-center gap-1 text-blue-500 text-xs font-semibold uppercase tracking-wider mb-1">
          <Target className="w-3.5 h-3.5" />
          <span>已測驗數</span>
        </div>
        <div className="text-2xl font-black text-blue-700 tracking-tight">
          {testedCount}
        </div>
      </div>

      {/* Correct Count */}
      <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100 flex flex-col items-center justify-center">
        <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>答對 (⭕)</span>
        </div>
        <div className="text-2xl font-black text-emerald-600 tracking-tight">
          {correctCount}
        </div>
      </div>

      {/* Wrong Count */}
      <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-100 flex flex-col items-center justify-center">
        <div className="flex items-center gap-1 text-rose-500 text-xs font-semibold uppercase tracking-wider mb-1">
          <XCircle className="w-3.5 h-3.5" />
          <span>答錯 (❌)</span>
        </div>
        <div className="text-2xl font-black text-rose-600 tracking-tight">
          {wrongCount}
        </div>
      </div>

      {/* Mastery Rate */}
      <div className="col-span-2 sm:col-span-1 p-3 rounded-lg bg-indigo-50 border border-indigo-200 flex flex-col items-center justify-center shadow-xs">
        <div className="flex items-center gap-1 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-1">
          <Award className="w-3.5 h-3.5 text-indigo-600" />
          <span>當前掌握度 (扣分制)</span>
        </div>
        <div className="text-3xl font-black text-indigo-700 tracking-tight">
          {masteryRate}%
        </div>
      </div>
    </div>
  );
};
