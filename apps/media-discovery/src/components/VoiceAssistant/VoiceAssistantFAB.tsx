'use client';

import { useState, useEffect } from 'react';
import { VoiceAssistant } from './VoiceAssistant';

interface VoiceAssistantFABProps {
  onSearchResult?: (query: string) => void;
}

/**
 * Floating Action Button (FAB) wrapper for the Voice Assistant
 * Positioned in the bottom-right corner of the screen
 */
export function VoiceAssistantFAB({ onSearchResult }: VoiceAssistantFABProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if voice features are available
  useEffect(() => {
    async function checkAvailability() {
      try {
        const response = await fetch('/api/voice/token');
        const data = await response.json();
        setIsAvailable(data.configured);
      } catch (error) {
        console.warn('Voice assistant not available:', error);
        setIsAvailable(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAvailability();
  }, []);

  // Don't render if voice features aren't available or still loading
  if (isLoading) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isExpanded ? (
        <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/10">
          {/* Header with close button */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎙️</span>
              <span className="text-white font-medium text-sm">Morgan</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-white/60 hover:text-white transition-colors p-1"
              aria-label="Minimize voice assistant"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Voice Assistant Component */}
          <VoiceAssistant onSearchResult={onSearchResult} />

          {/* Helper text */}
          <p className="text-xs text-white/40 text-center mt-3 max-w-[200px]">
            Ask Morgan to find movies, get recommendations, or discover trending content
          </p>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className={`
            w-14 h-14 rounded-full
            ${isAvailable
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'
              : 'bg-gray-600 cursor-not-allowed'
            }
            flex items-center justify-center
            shadow-lg hover:shadow-xl
            transition-all duration-300
            border-2 border-white/20
            group
          `}
          aria-label="Open voice assistant"
          disabled={!isAvailable}
          title={isAvailable ? 'Talk to Morgan' : 'Voice assistant not configured'}
        >
          <svg
            className="w-6 h-6 text-white group-hover:scale-110 transition-transform"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>

          {/* Notification dot for "available" state */}
          {isAvailable && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-pulse" />
          )}
        </button>
      )}
    </div>
  );
}

export default VoiceAssistantFAB;
