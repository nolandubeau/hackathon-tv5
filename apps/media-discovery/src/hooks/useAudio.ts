import { useRef, useEffect, useCallback } from 'react';

export function useAudio() {
  const hoverAudioRef = useRef<HTMLAudioElement | null>(null);
  const clickAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements
  useEffect(() => {
    hoverAudioRef.current = new Audio('/audio/hover.mp3');
    clickAudioRef.current = new Audio('/audio/click.mp3');

    // Preload audio
    hoverAudioRef.current.load();
    clickAudioRef.current.load();

    // Set volume
    hoverAudioRef.current.volume = 0.3;
    clickAudioRef.current.volume = 0.5;
  }, []);

  // Play hover sound
  const playHover = useCallback(() => {
    if (hoverAudioRef.current) {
      hoverAudioRef.current.currentTime = 0;
      hoverAudioRef.current.play().catch(() => {
        // Ignore errors from autoplay restrictions
      });
    }
  }, []);

  // Play click sound
  const playClick = useCallback(() => {
    if (clickAudioRef.current) {
      clickAudioRef.current.currentTime = 0;
      clickAudioRef.current.play().catch(() => {
        // Ignore errors from autoplay restrictions
      });
    }
  }, []);

  return { playHover, playClick };
}
