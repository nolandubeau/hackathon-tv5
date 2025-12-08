'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export type VoiceAssistantState = 'idle' | 'connecting' | 'connected' | 'error';

interface UseVoiceAssistantOptions {
  onTranscript?: (text: string) => void;
  onStateChange?: (state: VoiceAssistantState) => void;
  autoConnect?: boolean;
}

interface UseVoiceAssistantReturn {
  state: VoiceAssistantState;
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  transcript: string;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  toggleMute: () => void;
}

/**
 * Custom hook for managing LiveKit voice assistant connection
 *
 * This hook handles:
 * - WebRTC connection to LiveKit room
 * - Audio track management (microphone)
 * - Voice activity detection state
 * - Transcript updates from the agent
 */
export function useVoiceAssistant(options: UseVoiceAssistantOptions = {}): UseVoiceAssistantReturn {
  const { onTranscript, onStateChange, autoConnect = false } = options;

  const [state, setState] = useState<VoiceAssistantState>('idle');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  // References for LiveKit room and tracks
  const roomRef = useRef<any>(null);
  const audioTrackRef = useRef<any>(null);

  // Notify state changes
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  /**
   * Connect to the LiveKit room
   */
  const connect = useCallback(async () => {
    if (state === 'connecting' || state === 'connected') {
      return;
    }

    setState('connecting');
    setError(null);

    try {
      // Dynamically import LiveKit client (to avoid SSR issues)
      const { Room, RoomEvent, Track } = await import('livekit-client');

      // Get token from API
      const tokenResponse = await fetch('/api/voice/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identity: `user-${Date.now()}`,
          name: 'Media Discovery User',
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get voice token');
      }

      const { token, url } = await tokenResponse.json();

      // Create and connect to room
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      // Set up event listeners
      room.on(RoomEvent.Connected, () => {
        setState('connected');
        setIsListening(true);
      });

      room.on(RoomEvent.Disconnected, () => {
        setState('idle');
        setIsListening(false);
        setIsSpeaking(false);
      });

      room.on(RoomEvent.TrackSubscribed, (track: any, publication: any, participant: any) => {
        // When we receive audio from the agent
        if (track.kind === Track.Kind.Audio && participant.identity.startsWith('agent')) {
          const audioElement = track.attach();
          audioElement.play();
          setIsSpeaking(true);
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, (track: any, publication: any, participant: any) => {
        if (track.kind === Track.Kind.Audio && participant.identity.startsWith('agent')) {
          track.detach();
          setIsSpeaking(false);
        }
      });

      room.on(RoomEvent.ActiveSpeakersChanged, (speakers: any[]) => {
        const agentSpeaking = speakers.some(s => s.identity.startsWith('agent'));
        setIsSpeaking(agentSpeaking);

        const userSpeaking = speakers.some(s => !s.identity.startsWith('agent'));
        setIsListening(userSpeaking || (!agentSpeaking && state === 'connected'));
      });

      room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant: any, kind: any) => {
        // Handle transcript data from agent
        try {
          const data = JSON.parse(new TextDecoder().decode(payload));
          if (data.type === 'transcript') {
            setTranscript(data.text);
            onTranscript?.(data.text);
          }
        } catch (e) {
          // Not JSON data, ignore
        }
      });

      // Connect to the room
      await room.connect(url, token);
      roomRef.current = room;

      // Enable microphone
      await room.localParticipant.setMicrophoneEnabled(true);
      audioTrackRef.current = room.localParticipant.getTrackPublication(Track.Source.Microphone);

    } catch (err) {
      console.error('Voice assistant connection error:', err);
      setError(err instanceof Error ? err.message : 'Connection failed');
      setState('error');
    }
  }, [state, onTranscript]);

  /**
   * Disconnect from the LiveKit room
   */
  const disconnect = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    audioTrackRef.current = null;
    setState('idle');
    setIsListening(false);
    setIsSpeaking(false);
    setIsMuted(false);
    setTranscript('');
    setError(null);
  }, []);

  /**
   * Toggle microphone mute state
   */
  const toggleMute = useCallback(async () => {
    if (!roomRef.current) return;

    const { Track } = await import('livekit-client');
    const newMuted = !isMuted;

    await roomRef.current.localParticipant.setMicrophoneEnabled(!newMuted);
    setIsMuted(newMuted);
  }, [isMuted]);

  // Auto-connect if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, [autoConnect]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    state,
    isConnected: state === 'connected',
    isListening,
    isSpeaking,
    isMuted,
    transcript,
    error,
    connect,
    disconnect,
    toggleMute,
  };
}

export default useVoiceAssistant;
