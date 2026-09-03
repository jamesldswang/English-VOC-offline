---
name: english-voc-trainer
description: English Vocabulary Smart Voice Interactive Training Platform (智慧英文單字語音互動特訓看板). Guides data structures, user session lifecycle, speech synthesis, 3D flip card interactions, real-time strict spelling evaluation, big-data weakness training algorithms, Gist cloud bank syncing, and keyboard navigation.
---

# English VOC Smart Voice Interactive Training Platform Skill

This skill defines the architecture, data structures, interaction workflows, algorithms, user lifecycle rules, and keyboard navigation rules for the English Vocabulary Smart Voice Interactive Training Platform (智慧英文單字語音互動特訓看板).

## 1. Core Architecture & Mandatory User Lifecycle Guidelines

> [!IMPORTANT]
> **CRITICAL RULE - INITIAL USER STATE & UNLOCKED ACCESS**:
> 1. **Initial Username Cleanliness**: When the app starts, if there is no previous `localStorage` username, `username` MUST start **EMPTY (`""`)** — NEVER hardcode mock names like "James", "Student", or "Admin".
> 2. **Never Block Word Cards (No Blocking Mask)**: Word cards and teaching materials MUST ALWAYS be fully rendered and visible immediately upon loading. Do NOT hide or cover cards with a blur lock screen/overlay just because the user has not clicked login yet.
> 3. **Graceful Name Input**: If the user starts testing or presses `Ctrl+S` without a username, prompt them cleanly or use their input on the fly.
> 4. **Remembered Users**: Read previous historical users from `fhl_job_quiz_history` and populate the dropdown so users can click to select their name.

---

## 2. Core Functional Modules

1. **Cloud & Local Word Banks**: Fetches categorized word banks dynamically from GitHub Gist or loads custom local JSON packs.
2. **User Profiles & Progress Persistence**: Multi-user session tracking with resume-progress detection and local storage sync.
3. **Strict Blind-Spelling & Instant Feedback**: Real-time evaluation against multiple slash-separated standard answers (`word1 / word2`), detecting valid prefixes or immediate error classification.
4. **3D Flip Cards & Dual Audio**: Front audio for full example sentences, back audio for target vocabulary (`Ctrl + \`` or "🔊 聽單字" button) and phonetic symbols, plus interactive rating (⭕ Correct / ❌ Wrong).
5. **Continuous Sequential Audio Drills (`Ctrl + 1`)**: Auto-plays all visible cards sequentially ("Word ➔ Pause ➔ Example Sentence ➔ Pause ➔ Next Card"), smooth-scrolling each card into view. Interruptible via `Esc` or `Ctrl + 1`.
6. **Big Data Weakness Training (弱點特訓模式)**: Analyzes past test history to calculate an unfamiliarity score (wrong count) per word, allowing learners to filter and drill specifically on their weakest vocabulary using a dynamic threshold slider.
7. **Lossless History Merge & Export**: JSON export and import with deduplication across students and textbooks.

---

## 3. Data Schemas & TypeScript Definitions

### 3.1 Word Item & Word Category Schema (`WordBank`)
A word bank is a JSON array of `WordCategory` objects:

```json
[
  {
    "id": "jobs_tech",
    "category": "科技與軟體 (Tech & Software)",
    "list": [
      {
        "en": "software engineer / developer",
        "ch": "軟體工程師",
        "pos": "n.",
        "kk": "[ˈsɔːftwer ˌendʒɪˈnɪr]",
        "icon": "💻",
        "exampleEn": "The software engineer designed a scalable distributed architecture.",
        "exampleCh": "軟體工程師設計了一個可擴展的分散式架構。"
      }
    ]
  }
]
```

### 3.2 Quiz History Record Schema (`QuizRecord`)
History records are stored in `localStorage` under `fhl_job_quiz_history`:

```json
{
  "name": "Alex",
  "time": "2026/09/01 18點30分",
  "tested": 25,
  "correct": 23,
  "wrong": 2,
  "rate": "92%",
  "wrongWords": [
    { "en": "entrepreneur", "ch": "企業家 / 創業家" }
  ],
  "bankPrefix": "TOEIC_Advanced",
  "isReviewRound": false,
  "reviewSessionId": ""
}
```

### 3.3 User Progress Cache Schema (`UserProgressCache`)
Stored under `fhl_user_progress_cache`:

```json
{
  "username": "Alex",
  "bankName": "TOEIC_Advanced_V1.json",
  "progress": {
    "entrepreneur": "wrong",
    "accountant": "correct"
  }
}
```

---

## 4. Core Algorithms

### 4.1 Strict Spell Checking Engine
When the student types into a card's spelling input:
1. Split `job.en` by `/` and trim each element to get `standardAnswers: string[]`.
2. Normalize both user input and standard answers (lowercase, trimmed).
3. **Exact Match**: If `standardAnswers.some(ans => ans.toLowerCase() === input)`, mark card as `correct` (⭕), speak the word, and trigger next card focus.
4. **Instant Error Classification**:
   - Calculate `maxLen = Math.max(...standardAnswers.map(a => a.length))`.
   - Check if input is a valid prefix: `standardAnswers.some(ans => ans.toLowerCase().startsWith(input))`.
   - If `!isValidPrefix` or `input.length > maxLen`: mark card as `wrong` (❌) immediately, alerting the student to typo or spelling mistake without waiting for Enter.

### 4.2 Weakness Calculation & Slider Thresholding (V8.26 Specification)
1. Iterate over all history records matching the user name and current `bankPrefix`.
2. Aggregate wrong occurrences per word: `currentUserWrongCounter[word.en] = (currentUserWrongCounter[word.en] || 0) + 1`.
3. Compute `maxWrongCount = Math.max(0, ...Object.values(currentUserWrongCounter))`.
4. Configure slider:
   - **Default State**: `sliderMax = maxWrongCount > 0 ? maxWrongCount : 1`, and `sliderValue = sliderMax`.
   - **100% Perfect State**: If the latest test is 100% correct, `sliderMax = maxWrongCount + 1`, and `sliderValue = sliderMax` (filtering to 0 cards).
5. In Weakness Mode (`isTrainingMode = true`):
   - Only cards where `currentUserWrongCounter[word.en] >= sliderThreshold` remain visible.
   - Hide categories with 0 visible cards.

### 4.3 Accuracy Calculation & History Table Rule (V8.26 Specification)
- **Strict Accuracy Formula**: In all cases (regular mode, training mode, and historical retro-calibration), the accuracy is strictly:
  $$\text{Accuracy Rate} = \frac{\text{Total Words Base} - \text{Wrong Words Count}}{\text{Total Words Base}} \times 100\%$$
- Total Words Base is always the full word bank size (`totalWordsCount`, e.g. 4).
- Example: 4 questions with 2 wrong answers (`act`, `audience`) = **50%** accuracy, with Tested / Total displayed as **4 / 4**.
- Any unattempted question within the evaluated scope counts as wrong in the final submission to maintain mathematical rigor.
- "儲存本次成果" is seamlessly combined into "存查歷史紀錄 (Ctrl+S)".

---

## 5. Keyboard Shortcuts Matrix

| Key Combination | Scope / Target | Action |
| :--- | :--- | :--- |
| `Ctrl + 1` / `Cmd + 1` | Global | 連續自動朗讀目前所有考題的單字與例句 (按 Esc 或 Ctrl+1 停止) |
| `Tab` | In spelling input | Switch focus to next visible card input |
| `ArrowUp` / `ArrowDown` | In spelling input | Toggle 3D card flip & speak vocabulary pronunciation |
| `ArrowLeft` / `ArrowRight` | When card is flipped | Switch active focus to previous / next card |
| `Shift + Y` or `Shift + O` | Active card | Mark current word as Correct (⭕) |
| `Shift + N` or `Shift + X` | Active card | Mark current word as Wrong (❌) |
| `Ctrl + \`` / `Cmd + \`` | Active card | Pronounce target English word (TTS) |
| `` ` `` or `~` (without Ctrl) | Active card | Pronounce full English example sentence (TTS) |
| `Ctrl + S` / `Cmd + S` | Global | Save current test results immediately |
| `Ctrl + F1` / `Cmd + F1` | Global | Emergency full memory reset & reload |

---

## 6. Web Speech API (TTS) Integration Rules
- Use `window.speechSynthesis` with `SpeechSynthesisUtterance`.
- Set `lang = 'en-US'` and speech rate around `0.85` for clear educational enunciation.
- Strip slashes if present when pronouncing multi-variant words: `cleanText = text.split('/')[0].trim()`.
- Always invoke `window.speechSynthesis.cancel()` before speaking new phrases to avoid queue buildup.
