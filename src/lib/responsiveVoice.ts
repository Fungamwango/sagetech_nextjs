"use client";

declare global {
  interface Window {
    responsiveVoice?: {
      speak: (
        text: string,
        voice?: string,
        options?: {
          onstart?: () => void;
          onend?: () => void;
          onerror?: () => void;
          rate?: number;
          pitch?: number;
          volume?: number;
        },
      ) => void;
      cancel?: () => void;
    };
  }
}

const DEFAULT_MALE_VOICE = "UK English Male";

export function stopResponsiveSpeech() {
  if (typeof window === "undefined") return;

  window.responsiveVoice?.cancel?.();
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function speakResponsiveText(
  text: string,
  options?: {
    voice?: string;
    onstart?: () => void;
    onend?: () => void;
    onerror?: () => void;
  },
) {
  if (typeof window === "undefined" || !text.trim()) return false;

  stopResponsiveSpeech();

  if (window.responsiveVoice?.speak) {
    window.responsiveVoice.speak(text, options?.voice ?? DEFAULT_MALE_VOICE, {
      rate: 0.95,
      pitch: 1,
      volume: 1,
      onstart: options?.onstart,
      onend: options?.onend,
      onerror: options?.onerror,
    });
    return true;
  }

  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = options?.onstart ?? null;
    utterance.onend = options?.onend ?? null;
    utterance.onerror = options?.onerror ?? null;
    window.speechSynthesis.speak(utterance);
    return true;
  }

  return false;
}
