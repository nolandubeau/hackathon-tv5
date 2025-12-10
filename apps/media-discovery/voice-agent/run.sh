#!/bin/bash
# Run the Media Discovery Voice Agent

# Load environment variables
set -a
source ../.env.local 2>/dev/null || true
set +a

# Check for required environment variables
if [ -z "$GOOGLE_API_KEY" ] && [ -z "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    echo "Warning: Neither GOOGLE_API_KEY nor GOOGLE_APPLICATION_CREDENTIALS is set"
    echo "Please set one of these for Gemini API access"
fi

if [ -z "$LIVEKIT_URL" ] || [ -z "$LIVEKIT_API_KEY" ] || [ -z "$LIVEKIT_API_SECRET" ]; then
    echo "Warning: LiveKit credentials not fully configured"
    echo "Required: LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET"
fi

# Run the agent
python agent.py "$@"
