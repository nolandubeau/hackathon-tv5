'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useVoiceAssistant, VoiceAssistantState } from './useVoiceAssistant';

interface VoiceAssistantProps {
  onSearchResult?: (query: string) => void;
  className?: string;
}

export function VoiceAssistant({ onSearchResult, className = '' }: VoiceAssistantProps) {
  const {
    state,
    isConnected,
    isListening,
    isSpeaking,
    transcript,
    error,
    connect,
    disconnect,
    toggleMute,
    isMuted,
  } = useVoiceAssistant({
    onTranscript: (text) => {
      // Could trigger search when certain phrases are detected
      if (text.toLowerCase().includes('search for')) {
        const query = text.replace(/search for/i, '').trim();
        onSearchResult?.(query);
      }
    },
  });

  const [showTranscript, setShowTranscript] = useState(false);
  const pulseRef = useRef<HTMLDivElement>(null);

  // Animate pulse based on state
  useEffect(() => {
    if (pulseRef.current) {
      if (isSpeaking) {
        pulseRef.current.style.animation = 'pulse-speaking 1s ease-in-out infinite';
      } else if (isListening) {
        pulseRef.current.style.animation = 'pulse-listening 2s ease-in-out infinite';
      } else {
        pulseRef.current.style.animation = 'none';
      }
    }
  }, [isListening, isSpeaking]);

  const handleClick = useCallback(() => {
    if (isConnected) {
      toggleMute();
    } else {
      connect();
    }
  }, [isConnected, connect, toggleMute]);

  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const getStatusText = () => {
    switch (state) {
      case 'connecting':
        return 'Connecting to Morgan...';
      case 'connected':
        if (isSpeaking) return 'Morgan is speaking...';
        if (isListening) return 'Listening...';
        if (isMuted) return 'Muted - tap to unmute';
        return 'Ready - ask me anything!';
      case 'error':
        return error || 'Connection error';
      default:
        return 'Tap to start voice assistant';
    }
  };

  const getButtonColor = () => {
    if (state === 'error') return 'from-red-500 to-red-600';
    if (isSpeaking) return 'from-purple-500 to-pink-500';
    if (isListening) return 'from-green-500 to-emerald-500';
    if (isConnected) return 'from-blue-500 to-indigo-500';
    return 'from-gray-600 to-gray-700';
  };

  return (
    <div className={`voice-assistant ${className}`}>
      {/* Main Voice Button */}
      <div className="relative">
        {/* Pulse Ring */}
        <div
          ref={pulseRef}
          className={`absolute inset-0 rounded-full bg-gradient-to-r ${getButtonColor()} opacity-30`}
          style={{ transform: 'scale(1.2)' }}
        />

        {/* Main Button */}
        <button
          onClick={handleClick}
          disabled={state === 'connecting'}
          className={`
            relative z-10 w-16 h-16 rounded-full
            bg-gradient-to-r ${getButtonColor()}
            flex items-center justify-center
            shadow-lg hover:shadow-xl
            transition-all duration-300
            disabled:opacity-50 disabled:cursor-not-allowed
            border-2 border-white/20
          `}
          aria-label={isConnected ? (isMuted ? 'Unmute' : 'Mute') : 'Start voice assistant'}
        >
          {state === 'connecting' ? (
            <LoadingSpinner />
          ) : isConnected ? (
            isMuted ? <MicOffIcon /> : <MicOnIcon />
          ) : (
            <MicOnIcon />
          )}
        </button>

        {/* Close Button (when connected) */}
        {isConnected && (
          <button
            onClick={handleDisconnect}
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white text-xs shadow-md transition-colors"
            aria-label="Disconnect voice assistant"
          >
            ×
          </button>
        )}
      </div>

      {/* Status Text */}
      <div className="mt-3 text-center">
        <p className="text-sm text-white/80 font-medium">
          {getStatusText()}
        </p>

        {/* Transcript Toggle */}
        {isConnected && transcript && (
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="mt-1 text-xs text-white/50 hover:text-white/70 underline"
          >
            {showTranscript ? 'Hide transcript' : 'Show transcript'}
          </button>
        )}
      </div>

      {/* Transcript Panel */}
      {showTranscript && transcript && (
        <div className="mt-3 p-3 bg-black/40 rounded-lg max-w-xs">
          <p className="text-xs text-white/70 leading-relaxed">
            {transcript}
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse-listening {
          0%, 100% {
            transform: scale(1.2);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.4);
            opacity: 0.1;
          }
        }

        @keyframes pulse-speaking {
          0%, 100% {
            transform: scale(1.2);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
  );
}

// Icon Components
function MicOnIcon() {
  return (
    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z" />
      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
  );
}

function MicOffIcon() {
  return (
    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg className="w-7 h-7 text-white animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export default VoiceAssistant;
