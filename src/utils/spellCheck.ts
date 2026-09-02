export interface SpellCheckResult {
  isCorrect: boolean;
  isWrong: boolean;
  matchedAnswer?: string;
}

/**
 * Strict real-time spelling checker (V8.12/V8.13 algorithm):
 * 1. Checks if typed text matches any slash-separated standard answer.
 * 2. Checks if typed text is a valid prefix of any answer.
 * 3. Immediately marks wrong if typed text exceeds length or fails prefix match.
 */
export function evaluateSpellingInput(
  userTyped: string,
  standardWordEn: string
): SpellCheckResult {
  const trimmed = userTyped.trim();
  if (!trimmed) {
    return { isCorrect: false, isWrong: false };
  }

  const standardAnswers = standardWordEn
    .split('/')
    .map((ans) => ans.trim())
    .filter(Boolean);

  if (standardAnswers.length === 0) {
    return { isCorrect: false, isWrong: false };
  }

  // Exact match (case-insensitive)
  const matched = standardAnswers.find(
    (ans) => ans.toLowerCase() === trimmed.toLowerCase()
  );
  if (matched) {
    return { isCorrect: true, isWrong: false, matchedAnswer: matched };
  }

  // Check prefix match
  const isValidPrefix = standardAnswers.some((ans) =>
    ans.toLowerCase().startsWith(trimmed.toLowerCase())
  );
  const maxAnswerLength = Math.max(...standardAnswers.map((ans) => ans.length));

  // If not a valid prefix or exceeds maximum answer length, mark wrong immediately
  if (!isValidPrefix || trimmed.length > maxAnswerLength) {
    return { isCorrect: false, isWrong: true };
  }

  // In-progress typing
  return { isCorrect: false, isWrong: false };
}
