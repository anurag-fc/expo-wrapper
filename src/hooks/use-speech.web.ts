import { useCallback, useEffect, useRef, useState } from 'react';

export interface SpeechHook {
  isListening: boolean;
  transcript: string;
  /** True when speech recognition ended due to natural silence (not manual stop) */
  isSilent: boolean;
  startListening: () => void;
  stopListening: () => void;
  reset: () => void;
  isSupported: boolean;
}

// Extend the Window type for webkit prefix
declare global {
  interface Window {
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

/**
 * Web implementation using the browser's SpeechRecognition API.
 * Fires isSilent=true when speech ends naturally (silence detected).
 */
export function useSpeech(): SpeechHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSilent, setIsSilent] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const stoppedManuallyRef = useRef(false);

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startListening = useCallback(() => {
    if (!isSupported) return;

    setTranscript('');
    setIsSilent(false);
    stoppedManuallyRef.current = false;

    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let full = '';
      for (let i = 0; i < event.results.length; i++) {
        full += event.results[i][0].transcript;
      }
      setTranscript(full);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (!stoppedManuallyRef.current) {
        // Natural silence — signal the screen to transition
        setIsSilent(true);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isSupported]);

  const stopListening = useCallback(() => {
    stoppedManuallyRef.current = true;
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const reset = useCallback(() => {
    stoppedManuallyRef.current = true;
    recognitionRef.current?.stop();
    setIsListening(false);
    setTranscript('');
    setIsSilent(false);
  }, []);

  useEffect(() => {
    return () => {
      stoppedManuallyRef.current = true;
      recognitionRef.current?.stop();
    };
  }, []);

  return {
    isListening,
    transcript,
    isSilent,
    startListening,
    stopListening,
    reset,
    isSupported,
  };
}
