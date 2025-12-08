import { NextRequest, NextResponse } from 'next/server';

// LiveKit server SDK types (we'll generate tokens manually for now)
interface TokenClaims {
  identity: string;
  name?: string;
  video?: {
    room: string;
    roomJoin: boolean;
    canPublish: boolean;
    canSubscribe: boolean;
    canPublishData: boolean;
  };
  exp?: number;
  iss?: string;
  sub?: string;
}

/**
 * Generate a LiveKit access token for the voice assistant room
 *
 * In production, you would use the livekit-server-sdk:
 * ```
 * import { AccessToken } from 'livekit-server-sdk';
 * const token = new AccessToken(apiKey, apiSecret, { identity, name });
 * token.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });
 * return token.toJwt();
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identity, name } = body;

    if (!identity) {
      return NextResponse.json(
        { error: 'Identity is required' },
        { status: 400 }
      );
    }

    // Get LiveKit configuration from environment
    const livekitUrl = process.env.LIVEKIT_URL;
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!livekitUrl || !apiKey || !apiSecret) {
      // Return a mock response for development without LiveKit
      console.warn('LiveKit credentials not configured, returning mock token');
      return NextResponse.json({
        token: 'mock-token-for-development',
        url: livekitUrl || 'wss://localhost:7880',
        room: 'media-discovery-voice',
        identity,
        warning: 'LiveKit not configured - voice features disabled',
      });
    }

    // For production, use dynamic import of livekit-server-sdk
    // This avoids bundling issues with Next.js
    try {
      const { AccessToken } = await import('livekit-server-sdk');

      const roomName = 'media-discovery-voice';

      // Create a new access token
      const token = new AccessToken(apiKey, apiSecret, {
        identity,
        name: name || identity,
        ttl: 60 * 60, // 1 hour
      });

      // Grant permissions for the voice room
      token.addGrant({
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canPublishData: true,
        canSubscribe: true,
        canUpdateOwnMetadata: true,
      });

      const jwt = await token.toJwt();

      return NextResponse.json({
        token: jwt,
        url: livekitUrl,
        room: roomName,
        identity,
      });
    } catch (sdkError) {
      // SDK not available, generate a basic response
      console.error('LiveKit SDK error:', sdkError);

      return NextResponse.json({
        token: null,
        url: livekitUrl,
        room: 'media-discovery-voice',
        identity,
        error: 'LiveKit SDK not available',
      }, { status: 503 });
    }
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for health check and configuration status
 */
export async function GET() {
  const livekitUrl = process.env.LIVEKIT_URL;
  const hasCredentials = !!(
    process.env.LIVEKIT_API_KEY &&
    process.env.LIVEKIT_API_SECRET
  );

  return NextResponse.json({
    configured: hasCredentials,
    url: livekitUrl ? 'configured' : 'not configured',
    features: {
      voiceAssistant: hasCredentials,
      realtimeAudio: hasCredentials,
    },
  });
}
