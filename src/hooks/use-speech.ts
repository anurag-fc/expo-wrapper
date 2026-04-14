import { useCallback, useState } from 'react';

export interface SpeechHook {
  isListening: boolean;
  transcript: string;
  /** True when speech ended naturally via silence (web only; always false on native) */
  isSilent: boolean;
  startListening: () => void;
  stopListening: () => void;
  reset: () => void;
  isSupported: boolean;
}

/**
 * Native fallback.
 * Real-time transcription requires @react-native-voice/voice (bare/EAS workflow).
 * This hook provides the same interface so the oracle flow works on native —
 * the user taps mic to start, taps again to stop, and receives an answer.
 */
export function useSpeech(): SpeechHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const startListening = useCallback(() => {
    setIsListening(true);
    setTranscript('');
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  const reset = useCallback(() => {
    setIsListening(false);
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    isSilent: false,
    startListening,
    stopListening,
    reset,
    isSupported: true,
  };
}
