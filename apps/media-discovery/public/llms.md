# AI Media Discovery - Agent-Ready Documentation

## Overview

AI Media Discovery is a next-generation media discovery platform that uses natural language processing and vector similarity search to help users find movies and TV shows based on natural language descriptions.

## For AI Agents

This site is fully Agent-Ready Web (ARW) compliant, providing machine-readable interfaces for seamless AI agent interaction.

### Quick Start

- **ARW Manifest**: `/.well-known/arw-manifest.json`
- **LLMs.txt**: `/llms.txt`
- **API Base**: `/api`

### Supported Profiles

- **ARW-1**: Discovery and basic actions
- **ARW-2**: Semantic search with embeddings
- **ARW-3**: Protocol-based interactions

## Core Capabilities

### 1. Natural Language Search

Search for movies and TV shows using natural language descriptions:

```
POST /api/search
Content-Type: application/json

{
  "query": "exciting sci-fi adventure with time travel",
  "filters": {
    "mediaType": "movie",
    "ratingMin": 7.0
  },
  "explain": true
}
```

### 2. Personalized Recommendations

Get AI-powered recommendations based on preferences:

```
POST /api/recommendations
Content-Type: application/json

{
  "basedOn": {
    "contentId": 550,
    "mediaType": "movie"
  },
  "preferences": {
    "genres": [28, 53, 878],
    "likedContentIds": [550, 13, 680]
  }
}
```

### 3. Content Discovery

Browse trending and popular content:

```
GET /api/discover?category=trending&type=all&page=1
```

## Machine Views

Each page has a corresponding machine-readable view optimized for AI consumption:

- `/index.llm.md` - Homepage content
- `/search.llm.md` - Search functionality
- `/discover.llm.md` - Discovery features
- `/movie-detail.llm.md` - Movie details template
- `/tv-detail.llm.md` - TV show details template

## Data Sources

- **TMDB (The Movie Database)**: Movie and TV metadata, images, ratings
- **Vector Embeddings**: Semantic search powered by ruvector
- **User Preferences**: Stored locally in browser

## Semantic Search

We use vector embeddings to understand the semantic meaning of your queries:

1. User describes what they want to watch
2. Query is converted to a 768-dimension vector embedding
3. Vector similarity search finds content with similar themes, moods, and characteristics
4. Results are ranked by semantic similarity and filtered by preferences

## Content Metadata

Each movie/TV show includes:

- **Basic Info**: Title, overview, release date, runtime
- **Visual**: Posters, backdrops, trailers
- **Social**: Ratings, popularity, vote counts
- **Semantic**: Genre tags, keywords, mood descriptors
- **Availability**: Streaming platforms (where supported)

## Rate Limits

- **Unauthenticated**: 100 requests per minute
- **Authenticated**: 1000 requests per minute (future feature)

## Attribution

When using this API, please include attribution:

```
Powered by AI Media Discovery (https://media-discovery.agentics.org)
Data provided by The Movie Database (TMDB)
```

## Privacy & Training

- **Training Data**: Not permitted. Content metadata is sourced from TMDB.
- **Inference**: Allowed for non-commercial use with attribution.
- **User Data**: Preferences stored locally, not shared with third parties.

## Example Use Cases

### Find a Movie for Movie Night

```
"I want something exciting but not too intense,
family-friendly, with good reviews, maybe animated"
```

### Discover Similar Content

```
"Find movies like Inception - complex plots,
mind-bending concepts, great cinematography"
```

### Mood-Based Discovery

```
"I'm feeling contemplative and want something
slow-paced that makes me think"
```

## Technical Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **AI**: Vercel AI SDK, OpenAI embeddings
- **Vector Search**: ruvector (Rust-based vector database)
- **Media API**: TMDB (The Movie Database)
- **ARW**: Agent-Ready Web compliance for machine readability

## Support

For questions or issues with the API:

- **Documentation**: This file and `/llms.txt`
- **ARW Manifest**: `/.well-known/arw-manifest.json`
- **Health Check**: `/api/health`

## Version

- **ARW Version**: 0.1
- **API Version**: 1.0
- **Last Updated**: 2024

---

Built with ❤️ for both humans and AI agents.
