# English VOC Trainer Project Context & Instructions

## Project Overview
This application is the **English VOC 智慧英文單字語音互動特訓看板** (English Vocabulary Smart Voice Interactive Training Platform), designed for keyboard-driven, voice-assisted interactive vocabulary learning with cloud Gist marketplace synchronization, instant spelling evaluation, 3D flip cards, continuous voice playback (Ctrl+1), and big data weakness training.

## Architecture & State Rules
- **Frontend Framework**: React 18+ with TypeScript and Vite.
- **Styling**: Tailwind CSS with clean modern slate palette, emerald accents, smooth 3D transform perspectives for card flips, and high-contrast typography.
- **State Management**: React state + LocalStorage for multi-user history (`fhl_job_quiz_history`), active bank (`fhl_dynamic_word_bank`, `fhl_bank_file_name`), and in-progress cache (`fhl_user_progress_cache`).
- **Initial User State Rule (MANDATORY)**:
  - Initial `username` MUST start **EMPTY (`""`)** unless found in `localStorage`. NEVER hardcode mock usernames like "James" or "Admin".
  - Initial `isLoggedIn` is `false`.
  - **NEVER use a blocking overlay / blur lock screen** that hides cards when logged out. Cards, categories, and word lists must ALWAYS be 100% visible and interactive immediately upon page load.
- **Audio & TTS**: Web Speech API (`SpeechSynthesisUtterance`) with rate 0.85, language `en-US`, and queue cancellation.
- **Data Schemas & Protocols**: Follow `/skills/english-voc-trainer/SKILL.md`.

## Key Features & User Controls
1. **User Profile & History**: Multi-user login with clean empty initial state, remembered historical user selector, and progress resume prompt.
   - **存查與儲存整合 (Save & History Integration)**: 「儲存本次成果」與「存查歷史紀錄」整合為單一核心按鈕 `存查歷史紀錄 (Ctrl+S)`。點擊時自動將當前已測成果存檔入歷史歷程，並即時彈出歷程看板。
   - **弱點不熟悉度門檻自動計算 (Unfamiliarity Slider Auto-Calibration)**:
     - **本次測驗未達 100% 時**：門檻自動校準為最大錯誤累積值 (`sliderMax = sliderValue = maxWrong`，若無錯字則至少 1)。
     - **本次測驗達 100% 時**：門檻推升為 `maxWrong + 1` (如 3 錯則推升為 4，`sliderMax = sliderValue = maxWrong + 1`)，展現已完全掌握該門檻。
     - **曾達 100% 但本次測驗又有錯**：在按 `Ctrl+S` / 存查歷史紀錄時，門檻再度自動改回最大錯誤累積值 (`sliderMax = sliderValue = maxWrong`)。
     - **弱點特訓同軌校準 (Part B)**：在點擊「弱點特訓」時，呼叫同一套演算法自動計算並設定好正確門檻 (不開啟歷史頁面)，立即展現符合該門檻的特訓卡片。
   - **精準正確率公式 (Strict Accuracy Formula)**:
     - 歷程與看板正確率嚴格以 `(總題數 - 錯題數) / 總題數` 計算。
     - 一共 4 題，錯 2 題時，正確率精準顯示為 **50%**，已測 / 總數精確顯示為 **4 / 4**。未測驗題在存查時算錯，確保數據嚴謹閉環。
2. **Cloud Gist Word Bank Market**: Loads official Gist banks (`bc604e8856c3cc383aaab925f2f7c222`), custom JSON drag-and-drop, and offline starter packs.
3. **Interactive 3D Flashcards**: Chinese definition, POS, phonetic symbols, example sentences, listen sentence (front), listen word (back `Ctrl+\`` or button), and strict instant spell checker.
4. **Continuous Voice Drilling (`Ctrl+1`)**: Sequentially pronounces all visible cards ("Word ➔ Pause ➔ Example ➔ Next Card") with auto-scrolling.
5. **Weakness Training Mode**: Calculates wrong counts from test history, filters by unfamiliarity slider, and drills until mastery.
6. **Keyboard Shortcuts Matrix**: Tab navigation, Arrow keys flip, Shift+Y/N or Shift+O/X grading, Ctrl+` word audio, ` sentence audio, Ctrl+S save & view history, Ctrl+2 close history modal, Ctrl+3 toggle weakness training.
7. **Data Merging & Export**: Lossless JSON export and import for teachers and students.

## Version History
- **V8.41**: 本地字庫記錄管理與即時覆蓋取代版，點擊手動上傳按鈕即開啟「本地字庫管理看板」，清晰列出已上傳之本機字庫紀錄清單、個別字庫「不熟字/總字數」指標與掌握度百分比，支援「載入測驗」、「覆蓋取代 (Replace)」新 JSON 檔案更新字庫內容與「刪除」，並內建拖曳/瀏覽上傳新字庫。
- **V8.40**: 本地上傳題庫瀏覽器持久化保存版，手動上傳本地 JSON 題庫後自動永久保存於瀏覽器 LocalStorage (`fhl_custom_uploaded_banks`)，關閉或重新整理網頁免再上傳；題庫選單新增專屬 `[本地儲存]` 群組供自由即時切換，並支援一鍵自瀏覽器刪除本機題庫管理。
- **V8.39**: 本地題庫與雲端教材市集單字答對雙向併入統計版，手動上傳本地 JSON，若考的單字與智慧雲端教材市集相同，若該字對了（包含當前作答即時進度與 Ctrl+S 存查入庫），即自動即時併入智慧雲端教材市集對應題庫之答對統計與全域三大核心指標（不熟字扣減、熟悉字累計），並以 `correctWords` 全面貫通雲端同步與掌握度追蹤。
- **V8.38**: 弱點特訓卡片留存 & Ctrl+S 結算對錯版，移除作答當下自動存查算分之副作用，特訓時答對卡片完整保留於畫面並標示綠勾，直到按下 Ctrl+S（或存查歷史紀錄）時才一併統一結算本次成果入庫、動態校準門檻與同步 Firebase。
- **V8.37**: 雲端教材市集分子最新測驗實況精準校準版，修正過去因特定篩選規則抓取舊常規輪次而非最新特訓輪次之盲點，使 100% 全對時智慧市集選項即時精確顯示為 `[0/4]`（已答對全部題目，0 題未熟），全域統計指標同步精準歸零扣減。
- **V8.36**: Firebase 雲端同步 & 全域掌握度指標雙軌版，正式串接 Firebase Firestore 雲端資料庫儲存歷程與同步，並於快捷鍵指南右側設置「📊 不熟字/總題數： [未熟題]/[全庫總題] | 熟悉字： [已熟題]」三大核心即時統計指標。
- **V8.35**: 雲端教材市集分子分母精確顯示版，下拉選單選項格式為「題庫名稱 [分子/分母] (分類說明)」，分母為該字庫單字總數，分子為受測者還未答對題數，即時連動歷史歷程與測驗進度。
- **V8.34**: 卡片背面萬能快捷鍵 & 導航修復版，背面按 ` 朗讀例句（相容 Backquote 與 keyCode 192）、上下鍵解鎖雙向翻轉發音、左右鍵連續瀏覽背面解析與滑動聚焦。
- **V8.33**: 弱點特訓 Ctrl+3 快捷啟動版，按 Ctrl+3（或 Cmd+3）隨時啟動或切換弱點特訓模式。
- **V8.32**: 歷程看板 Ctrl+2 即刻關閉版，在「Global 存查歷史紀錄與學習歷程看板」開啟時，可按 Ctrl+2（或 Cmd+2，亦支援 Esc）隨時關閉視窗。
- **V8.31**: 存查歷史特訓狀態即刻復原版，當按「存查歷史 (Ctrl+S)」時，自動將本次成果入庫並動態校準門檻，弱點特訓狀態自動恢復為初始未執行狀態（退出特訓模式、按鈕重置為 🔥 弱點特訓、題庫回到完整字庫）。
- **V8.30**: 存查與特訓雙向即時校準門檻版，存查與特訓同軌聯動：未達 100% 門檻為 maxWrong，達 100% 門檻推升為 maxWrong+1，最新考錯即刻改回 maxWrong。
- **V8.29**: 特訓門檻首擊精準鎖定 & 最新錯字即刻列考版，修正 100% 過度推升為 4 的問題，單擊即定位最高錯次 3，最新複習錯字必列入。
- **V8.28**: 舊生名冊即選即登入 & 新生手動確認雙軌流暢版，歷史受測者下拉即刻登入免按確認，手打新受測者維持按確認登入。
- **V8.27**: 存查雙鍵極簡合一 & 不熟悉度滑軌自動定位版，徹底移除獨立儲存鈕，不熟悉度門檻自動計算並定位。
- **V8.26**: 全字庫分母精準對齊與 50% 正確率終極校準版，整合「存查歷史紀錄 (Ctrl+S)」與自適應門檻。
