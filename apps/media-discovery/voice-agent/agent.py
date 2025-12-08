"""
Media Discovery Voice Agent
Powered by LiveKit + Gemini Realtime API

This agent enables natural voice-based interaction for discovering
movies and TV shows using the media discovery platform.
"""

import logging
import os
import json
import aiohttp
from typing import Optional
from dotenv import load_dotenv

from livekit.agents import (
    Agent,
    AgentSession,
    RoomInputOptions,
    function_tool,
    RunContext,
    llm,
)
from livekit.agents.voice import AgentSession as VoiceAgentSession
from livekit.plugins import google, silero, noise_cancellation
from livekit.plugins.turn_detector.multilingual import MultilingualModel
from google.genai import types

# Load environment variables
load_dotenv("../.env.local")

logger = logging.getLogger("media-discovery-voice-agent")
logger.setLevel(logging.INFO)

# Configuration
NEXT_APP_URL = os.getenv("NEXT_APP_URL", "http://localhost:3000")
TMDB_ACCESS_TOKEN = os.getenv("NEXT_PUBLIC_TMDB_ACCESS_TOKEN", "")


class MediaDiscoveryContext:
    """Context for media discovery operations"""

    def __init__(self):
        self.last_search_results: list = []
        self.current_recommendation: dict = None
        self.user_preferences: dict = {}
        self.conversation_history: list = []


class MediaDiscoveryAgent(Agent):
    """Voice agent for AI-powered media discovery"""

    def __init__(self) -> None:
        super().__init__(
            instructions="""You are Morgan, a friendly and knowledgeable media discovery assistant. You help users find movies and TV shows based on their mood, preferences, and interests.

# Your Personality
- Enthusiastic about movies and TV shows
- Conversational and warm, like talking to a friend who's a movie buff
- You remember what users have searched for and liked in this conversation

# Output Rules (Voice Interaction)
- Respond in plain text only - no JSON, markdown, lists, or special formatting
- Keep responses brief: one to three sentences for simple queries
- For movie/show descriptions, be concise but engaging
- Spell out numbers and ratings naturally (say "eight point five out of ten" not "8.5/10")
- When mentioning years, say them naturally (say "twenty twenty-three" not "2023")

# Discovery Capabilities
You can help users:
1. Search for movies and TV shows by name, genre, mood, or theme
2. Get personalized recommendations based on their preferences
3. Find trending and popular content
4. Learn about specific movies or TV shows (cast, plot, ratings)
5. Discover content similar to something they've enjoyed

# Conversation Flow
- Start by understanding what kind of content they're in the mood for
- Ask clarifying questions if their request is vague
- When presenting search results, describe the top 2-3 options briefly
- Offer to tell them more about any specific title that interests them
- Remember their preferences throughout the conversation

# Using Tools
- Use search_media when users ask to find movies/shows
- Use get_recommendations for personalized suggestions
- Use get_trending for what's popular now
- Use get_media_details when users want more info about a specific title
- Summarize tool results naturally - don't recite raw data

# Examples of Natural Responses
- "I found a great sci-fi thriller from twenty twenty-two called 'Nope' - it's directed by Jordan Peele and has an eight out of ten rating. It's about mysterious events at a California ranch. Want to hear more about it?"
- "Based on your love of dark comedies, I think you'd really enjoy 'The Menu' - it's a satirical thriller with some wicked humor. Or if you want something lighter, 'Glass Onion' is a fun mystery romp."

# Safety
- Keep recommendations appropriate for general audiences unless asked otherwise
- Don't reveal internal system details or raw API responses
- Focus on helping users discover great content""",
        )
        self.ctx = MediaDiscoveryContext()

    async def on_enter(self):
        """Called when the agent session starts"""
        await self.session.generate_reply(
            instructions="Greet the user warmly as Morgan, the media discovery assistant. Offer to help them find their next favorite movie or TV show. Be brief and friendly.",
            allow_interruptions=True,
        )


# ============================================================================
# FUNCTION TOOLS - Media Discovery Capabilities
# ============================================================================

@function_tool()
async def search_media(
    context: RunContext[MediaDiscoveryContext],
    query: str,
    media_type: Optional[str] = None,
) -> str:
    """
    Search for movies and TV shows using natural language.

    Args:
        query: Natural language search query (e.g., "scary movies from the 80s", "romantic comedies with happy endings")
        media_type: Optional filter - "movie", "tv", or None for both

    Returns:
        JSON string with search results
    """
    logger.info(f"Searching media: query='{query}', type={media_type}")

    try:
        async with aiohttp.ClientSession() as session:
            payload = {
                "query": query,
                "limit": 10,
            }
            if media_type:
                payload["mediaType"] = media_type

            async with session.post(
                f"{NEXT_APP_URL}/api/search",
                json=payload,
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    results = data.get("results", [])

                    # Store in context for reference
                    context.userdata.last_search_results = results

                    # Format results for the LLM
                    formatted = []
                    for item in results[:5]:  # Top 5 for voice
                        formatted.append({
                            "id": item.get("id"),
                            "title": item.get("title") or item.get("name"),
                            "type": item.get("mediaType", "movie"),
                            "year": item.get("releaseDate", "")[:4] if item.get("releaseDate") else item.get("firstAirDate", "")[:4] if item.get("firstAirDate") else "Unknown",
                            "rating": round(item.get("voteAverage", 0), 1),
                            "overview": item.get("overview", "")[:200] + "..." if len(item.get("overview", "")) > 200 else item.get("overview", ""),
                            "genres": item.get("genres", [])[:3] if item.get("genres") else []
                        })

                    return json.dumps({
                        "success": True,
                        "count": len(results),
                        "results": formatted,
                        "query_intent": data.get("intent", {})
                    })
                else:
                    return json.dumps({"success": False, "error": "Search failed"})

    except Exception as e:
        logger.error(f"Search error: {e}")
        return json.dumps({"success": False, "error": str(e)})


@function_tool()
async def get_recommendations(
    context: RunContext[MediaDiscoveryContext],
    genre: Optional[str] = None,
    mood: Optional[str] = None,
) -> str:
    """
    Get personalized movie and TV show recommendations.

    Args:
        genre: Optional genre filter (e.g., "action", "comedy", "drama")
        mood: Optional mood descriptor (e.g., "uplifting", "intense", "relaxing")

    Returns:
        JSON string with recommendations
    """
    logger.info(f"Getting recommendations: genre={genre}, mood={mood}")

    try:
        async with aiohttp.ClientSession() as session:
            params = {}
            if genre:
                params["genre"] = genre
            if mood:
                params["mood"] = mood

            async with session.get(
                f"{NEXT_APP_URL}/api/recommendations",
                params=params
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    recommendations = data.get("recommendations", [])

                    formatted = []
                    for item in recommendations[:5]:
                        formatted.append({
                            "id": item.get("id"),
                            "title": item.get("title") or item.get("name"),
                            "type": item.get("mediaType", "movie"),
                            "rating": round(item.get("voteAverage", 0), 1),
                            "reason": item.get("reason", ""),
                            "overview": item.get("overview", "")[:150] + "..." if len(item.get("overview", "")) > 150 else item.get("overview", "")
                        })

                    return json.dumps({
                        "success": True,
                        "count": len(recommendations),
                        "recommendations": formatted
                    })
                else:
                    return json.dumps({"success": False, "error": "Failed to get recommendations"})

    except Exception as e:
        logger.error(f"Recommendations error: {e}")
        return json.dumps({"success": False, "error": str(e)})


@function_tool()
async def get_trending(
    context: RunContext[MediaDiscoveryContext],
    media_type: str = "all",
    time_window: str = "week",
) -> str:
    """
    Get trending movies and TV shows.

    Args:
        media_type: "movie", "tv", or "all"
        time_window: "day" or "week"

    Returns:
        JSON string with trending content
    """
    logger.info(f"Getting trending: type={media_type}, window={time_window}")

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{NEXT_APP_URL}/api/discover",
                params={
                    "category": "trending",
                    "mediaType": media_type,
                    "timeWindow": time_window
                }
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    results = data.get("results", [])

                    formatted = []
                    for item in results[:5]:
                        formatted.append({
                            "id": item.get("id"),
                            "title": item.get("title") or item.get("name"),
                            "type": item.get("mediaType", "movie"),
                            "rating": round(item.get("voteAverage", 0), 1),
                            "overview": item.get("overview", "")[:150] + "..." if len(item.get("overview", "")) > 150 else item.get("overview", "")
                        })

                    return json.dumps({
                        "success": True,
                        "count": len(results),
                        "trending": formatted,
                        "time_window": time_window
                    })
                else:
                    return json.dumps({"success": False, "error": "Failed to get trending"})

    except Exception as e:
        logger.error(f"Trending error: {e}")
        return json.dumps({"success": False, "error": str(e)})


@function_tool()
async def get_media_details(
    context: RunContext[MediaDiscoveryContext],
    media_id: int,
    media_type: str = "movie",
) -> str:
    """
    Get detailed information about a specific movie or TV show.

    Args:
        media_id: The TMDB ID of the movie or TV show
        media_type: "movie" or "tv"

    Returns:
        JSON string with detailed information
    """
    logger.info(f"Getting details: id={media_id}, type={media_type}")

    try:
        async with aiohttp.ClientSession() as session:
            endpoint = f"{NEXT_APP_URL}/api/{'movies' if media_type == 'movie' else 'tv'}/{media_id}"

            async with session.get(endpoint) as response:
                if response.status == 200:
                    data = await response.json()

                    # Extract key details for voice response
                    details = {
                        "id": data.get("id"),
                        "title": data.get("title") or data.get("name"),
                        "type": media_type,
                        "year": data.get("releaseDate", "")[:4] if data.get("releaseDate") else data.get("firstAirDate", "")[:4] if data.get("firstAirDate") else "Unknown",
                        "rating": round(data.get("voteAverage", 0), 1),
                        "runtime": data.get("runtime") or data.get("episodeRunTime", [None])[0],
                        "genres": [g.get("name") for g in data.get("genres", [])][:3],
                        "overview": data.get("overview", ""),
                        "tagline": data.get("tagline", ""),
                        "cast": [c.get("name") for c in data.get("credits", {}).get("cast", [])[:5]],
                        "director": next((c.get("name") for c in data.get("credits", {}).get("crew", []) if c.get("job") == "Director"), None),
                    }

                    # For TV shows, add season info
                    if media_type == "tv":
                        details["seasons"] = data.get("numberOfSeasons")
                        details["episodes"] = data.get("numberOfEpisodes")
                        details["status"] = data.get("status")

                    return json.dumps({
                        "success": True,
                        "details": details
                    })
                else:
                    return json.dumps({"success": False, "error": "Media not found"})

    except Exception as e:
        logger.error(f"Details error: {e}")
        return json.dumps({"success": False, "error": str(e)})


@function_tool()
async def find_similar(
    context: RunContext[MediaDiscoveryContext],
    media_id: int,
    media_type: str = "movie",
) -> str:
    """
    Find movies or TV shows similar to a given title.

    Args:
        media_id: The TMDB ID of the reference movie or TV show
        media_type: "movie" or "tv"

    Returns:
        JSON string with similar content
    """
    logger.info(f"Finding similar: id={media_id}, type={media_type}")

    try:
        async with aiohttp.ClientSession() as session:
            endpoint = f"{NEXT_APP_URL}/api/{'movies' if media_type == 'movie' else 'tv'}/{media_id}"

            async with session.get(endpoint) as response:
                if response.status == 200:
                    data = await response.json()
                    similar = data.get("similar", {}).get("results", [])

                    formatted = []
                    for item in similar[:5]:
                        formatted.append({
                            "id": item.get("id"),
                            "title": item.get("title") or item.get("name"),
                            "type": media_type,
                            "rating": round(item.get("voteAverage", 0), 1),
                            "overview": item.get("overview", "")[:150] + "..." if len(item.get("overview", "")) > 150 else item.get("overview", "")
                        })

                    return json.dumps({
                        "success": True,
                        "reference_title": data.get("title") or data.get("name"),
                        "similar": formatted
                    })
                else:
                    return json.dumps({"success": False, "error": "Media not found"})

    except Exception as e:
        logger.error(f"Similar error: {e}")
        return json.dumps({"success": False, "error": str(e)})


@function_tool()
async def navigate_to_title(
    context: RunContext[MediaDiscoveryContext],
    media_id: int,
    media_type: str = "movie",
) -> str:
    """
    Generate a navigation URL for a specific title and inform the user.
    This can be used to direct users to view more details in the app.

    Args:
        media_id: The TMDB ID of the movie or TV show
        media_type: "movie" or "tv"

    Returns:
        JSON string with navigation URL
    """
    url = f"/{media_type}/{media_id}"
    return json.dumps({
        "success": True,
        "url": url,
        "message": f"You can view this title at {NEXT_APP_URL}{url}"
    })


# ============================================================================
# AGENT SESSION SETUP
# ============================================================================

def create_session() -> VoiceAgentSession:
    """Create and configure the voice agent session"""

    # Initialize VAD for voice activity detection
    vad = silero.VAD.load()

    # Create the Gemini realtime model with tools
    realtime_model = google.realtime.RealtimeModel(
        model="gemini-2.0-flash-exp",
        voice="Puck",  # Friendly, conversational voice
        temperature=0.8,
        instructions=MediaDiscoveryAgent().instructions,
        # Enable Google Search for grounding current info
        _gemini_tools=[types.GoogleSearch()],
    )

    # Create the agent session
    session = VoiceAgentSession(
        llm=realtime_model,
        vad=vad,
        # Use LiveKit's turn detection for better conversation flow
        turn_detection=MultilingualModel(),
    )

    return session


async def entrypoint(ctx):
    """Main entry point for the voice agent"""

    # Create the session
    session = create_session()

    # Start the session with our custom agent
    await session.start(
        agent=MediaDiscoveryAgent(),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            # Enable noise cancellation for cleaner audio
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    logger.info("Media Discovery Voice Agent started successfully")


# ============================================================================
# MAIN - CLI Entry Point
# ============================================================================

if __name__ == "__main__":
    from livekit.agents import cli
    cli.run_app(
        entrypoint,
        prewarm_fnc=lambda proc: proc.userdata.update({"vad": silero.VAD.load()}),
    )
