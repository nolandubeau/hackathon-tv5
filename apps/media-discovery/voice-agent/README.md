# Media Discovery Voice Agent

Voice-powered media discovery assistant using LiveKit + Gemini Realtime API.

## Overview

Morgan is an AI voice assistant that helps users discover movies and TV shows through natural conversation. It integrates with the media discovery platform's search and recommendation APIs.

## Features

- **Natural Language Search**: Find movies/shows by describing mood, genre, or themes
- **Personalized Recommendations**: Get suggestions based on preferences
- **Trending Content**: Discover what's popular right now
- **Detailed Information**: Learn about cast, ratings, and plot details
- **Similar Content**: Find shows like ones you already love

## Prerequisites

1. **LiveKit Cloud Account** (or self-hosted LiveKit server)
   - Sign up at [livekit.io](https://livekit.io)
   - Create a project and get API credentials

2. **Google Cloud / Gemini API**
   - Get API key from [Google AI Studio](https://aistudio.google.com)
   - Or use Vertex AI with service account credentials

3. **Python 3.11+**

## Setup

### 1. Install Python Dependencies

```bash
cd voice-agent
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env.local` file in the `apps/media-discovery` directory:

```env
# LiveKit Credentials
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret

# Gemini API (choose one)
GOOGLE_API_KEY=your_gemini_api_key
# OR for Vertex AI:
# GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# App URL for API calls
NEXT_APP_URL=http://localhost:3000
```

### 3. Run the Agent

```bash
# Development mode
./run.sh dev

# Production mode
./run.sh start
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User's Browser                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │   VoiceAssistantFAB Component                       │   │
│  │   - Microphone capture                               │   │
│  │   - LiveKit room connection                          │   │
│  │   - Audio playback                                   │   │
│  └───────────────────────┬─────────────────────────────┘   │
└──────────────────────────┼──────────────────────────────────┘
                           │ WebRTC Audio
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    LiveKit Cloud                            │
│  - Room management                                          │
│  - Audio routing                                            │
│  - WebRTC signaling                                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Voice Agent (Python)                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │   MediaDiscoveryAgent                               │   │
│  │   - Gemini Realtime for voice processing            │   │
│  │   - Function calling for media operations           │   │
│  │   - Context management                               │   │
│  └───────────────────────┬─────────────────────────────┘   │
│                          │                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │   Function Tools                                     │   │
│  │   - search_media()                                   │   │
│  │   - get_recommendations()                            │   │
│  │   - get_trending()                                   │   │
│  │   - get_media_details()                              │   │
│  │   - find_similar()                                   │   │
│  └───────────────────────┬─────────────────────────────┘   │
└──────────────────────────┼──────────────────────────────────┘
                           │ HTTP API calls
                           ▼
┌─────────────────────────────────────────────────────────────┐
│            Next.js Media Discovery App                      │
│  /api/search - Natural language search                      │
│  /api/recommendations - Personalized suggestions            │
│  /api/discover - Trending & popular content                 │
│  /api/movies/[id] - Movie details                           │
│  /api/tv/[id] - TV show details                             │
└─────────────────────────────────────────────────────────────┘
```

## Voice Commands (Examples)

- "Find me a good sci-fi movie from the 90s"
- "What's trending this week?"
- "I'm in the mood for a romantic comedy"
- "Tell me more about Inception"
- "Find something similar to Breaking Bad"
- "What are some good thriller movies?"
- "Show me the top rated dramas"

## Development

### Running Locally

1. Start the Next.js app: `npm run dev`
2. Start the voice agent: `./run.sh dev`
3. Open the app and click the microphone button

### Agent Commands

```bash
# Start in development mode with hot reload
python agent.py dev

# Start production server
python agent.py start

# Connect to specific room
python agent.py connect --room my-room

# Run with verbose logging
python agent.py dev --log-level debug
```

## Troubleshooting

### No audio from agent
- Check that `GOOGLE_API_KEY` is set correctly
- Verify LiveKit credentials are valid
- Check browser microphone permissions

### Agent not responding
- Ensure the Next.js app is running (`npm run dev`)
- Check that `NEXT_APP_URL` points to the correct address
- Look at agent logs for API errors

### Connection fails
- Verify `LIVEKIT_URL` is correct (should start with `wss://`)
- Check that API key and secret match your LiveKit project
- Ensure firewall allows WebSocket connections

## API Reference

See the main app's API documentation for endpoint details:
- `/api/search` - Semantic search with AI intent parsing
- `/api/recommendations` - Personalized recommendations
- `/api/discover` - Browse categories (trending, popular, etc.)
- `/api/movies/[id]` - Full movie details with credits
- `/api/tv/[id]` - Full TV show details with credits
