import React, { useRef } from 'react';
import {
  UserCheck,
  Save,
  BarChart3,
  Download,
  Upload,
  FileText,
  Users,
} from 'lucide-react';

interface UserPanelProps {
  username: string;
  isLoggedIn: boolean;
  historyUsers: string[];
  onUsernameChange: (name: string) => void;
  onLogin: () => void;
  onSaveResult: () => void;
  onOpenHistory: () => void;
  onExportHistory: () => void;
  onImportHistory: (file: File) => void;
  onOpenChangelog: () => void;
}

export const UserPanel: React.FC<UserPanelProps> = ({
  username,
  isLoggedIn,
  historyUsers,
  onUsernameChange,
  onLogin,
  onSaveResult,
  onOpenHistory,
  onExportHistory,
  onImportHistory,
  onOpenChangelog,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onLogin();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportHistory(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
      {/* User Login Section */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-slate-700 font-bold text-sm">
          <UserCheck className="w-4 h-4 text-blue-600" />
          <span>🧑‍🎓 受測者：</span>
        </div>

        <input
          type="text"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="請輸入或選擇姓名"
          className={`px-3 py-1.5 text-sm border rounded-lg outline-none transition w-44 font-medium ${
            isLoggedIn
              ? 'border-emerald-400 bg-emerald-50 text-emerald-900 font-bold'
              : 'border-slate-300 focus:border-blue-500 bg-white'
          }`}
        />

        <div className="relative">
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) {
                onUsernameChange(e.target.value);
              }
            }}
            tabIndex={-1}
            className="px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg bg-slate-50 text-slate-700 font-medium outline-none hover:bg-slate-100 cursor-pointer"
          >
            <option value="" disabled>
              👥 本機歷史受測者 ({historyUsers.length})
            </option>
            {historyUsers.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onLogin}
          tabIndex={-1}
          className="px-3.5 py-1.5 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs cursor-pointer flex items-center gap-1"
        >
          {isLoggedIn ? '已確認登入' : '確認登入'}
        </button>
      </div>

      {/* Actions Section */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onSaveResult}
          tabIndex={-1}
          title="儲存本次測驗統計數據 (Ctrl+S)"
          className="px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>儲存本次成果 (Ctrl+S)</span>
        </button>

        <button
          onClick={onOpenHistory}
          tabIndex={-1}
          className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-slate-600 hover:bg-slate-700 text-white transition shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>📊 存查歷史紀錄</span>
        </button>

        <button
          onClick={onExportHistory}
          tabIndex={-1}
          title="一鍵打包全部學生、全部教材的大數據歷程"
          className="px-2.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition shadow-xs flex items-center gap-1 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>匯出歷程 JSON</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          tabIndex={-1}
          title="無損融合並倒入全部歷史 JSON"
          className="px-2.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-xs flex items-center gap-1 cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>匯入歷程 JSON</span>
        </button>

        <button
          onClick={onOpenChangelog}
          tabIndex={-1}
          className="px-2.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition flex items-center gap-1 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span>📜 更新日誌</span>
        </button>
      </div>
    </div>
  );
};
