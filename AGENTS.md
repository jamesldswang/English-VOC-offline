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
2. **Cloud Gist Word Bank Market**: Loads official Gist banks (`bc604e8856c3cc383aaab925f2f7c222`), custom JSON drag-and-drop, and offline starter packs.
3. **Interactive 3D Flashcards**: Chinese definition, POS, phonetic symbols, example sentences, listen sentence (front), listen word (back `Ctrl+\`` or button), and strict instant spell checker.
4. **Continuous Voice Drilling (`Ctrl+1`)**: Sequentially pronounces all visible cards ("Word ➔ Pause ➔ Example ➔ Next Card") with auto-scrolling.
5. **Weakness Training Mode**: Calculates wrong counts from test history, filters by unfamiliarity slider, and drills until mastery.
6. **Keyboard Shortcuts Matrix**: Tab navigation, Arrow keys flip, Shift+Y/N or Shift+O/X grading, Ctrl+` word audio, ` sentence audio, Ctrl+S save.
7. **Data Merging & Export**: Lossless JSON export and import for teachers and students.
