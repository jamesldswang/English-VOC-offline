/**
 * Web Speech API text-to-speech helper with robust Chrome/Safari lifecycle management
 */

let activeUtterance: SpeechSynthesisUtterance | null = null;
let speechTimeoutId: number | null = null;

export function stopSpeaking(): void {
  if (speechTimeoutId) {
    clearTimeout(speechTimeoutId);
    speechTimeoutId = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  activeUtterance = null;
}

export function speakText(
  text?: string,
  rate: number = 0.85,
  onEnd?: () => void
): void {
  if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  try {
    // If the word contains alternatives separated by '/', pick the primary phrase
    const cleanText = text.split('/')[0].replace(/[[\]]/g, '').trim();
    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    stopSpeaking();

    // Ensure audio subsystem is not paused
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    // Small timeout ensures cancel() finishes and prevents utterance drop in Chromium
    speechTimeoutId = window.setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'en-US';
        utterance.rate = rate;

        // Choose high quality English voice if available
        const voices = window.speechSynthesis.getVoices();
        const enVoice =
          voices.find(
            (v) =>
              (v.lang === 'en-US' || v.lang === 'en_US' || v.lang.startsWith('en')) &&
              (v.name.includes('Google') ||
                v.name.includes('Natural') ||
                v.name.includes('Samantha') ||
                v.name.includes('Daniel') ||
                v.name.includes('English') ||
                v.name.includes('US'))
          ) || voices.find((v) => v.lang.startsWith('en'));

        if (enVoice) {
          utterance.voice = enVoice;
        }

        let finished = false;
        const finalize = () => {
          if (!finished) {
            finished = true;
            activeUtterance = null;
            if (onEnd) onEnd();
          }
        };

        utterance.onend = finalize;
        utterance.onerror = (err) => {
          console.warn('SpeechSynthesis error event:', err);
          finalize();
        };

        // Retain reference to prevent garbage collection mid-speech
        activeUtterance = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (innerErr) {
        console.warn('Inner Speech synthesis error:', innerErr);
        if (onEnd) onEnd();
      }
    }, 20);
  } catch (error) {
    console.warn('Speech synthesis error:', error);
    if (onEnd) onEnd();
  }
}

