# AI Media Discovery - TV Show Details

## Page Overview

The TV show details page provides comprehensive information about a specific television series, including seasons, episodes, cast, and related content recommendations.

## Dynamic Content

This is a template for TV detail pages at `/tv/[id]`.

For specific TV show data, use the API:

```
GET /api/tv/{id}
```

## Available Information

### Basic Metadata

- **Name**: Show title
- **Original Name**: Original language title
- **First Air Date**: Series premiere date
- **Last Air Date**: Most recent episode
- **Status**: Returning, Ended, Canceled
- **Tagline**: Marketing tagline
- **Overview**: Series summary

### Series Information

- **Number of Seasons**: Total seasons
- **Number of Episodes**: Total episodes
- **Episode Runtime**: Typical episode length
- **In Production**: Currently producing new episodes
- **Networks**: Broadcasting networks
- **Type**: Scripted, Reality, Documentary, etc.

### Media

- **Poster**: Primary show poster
- **Backdrop**: Wide promotional image
- **Videos**: Trailers, promos, clips
- **Season Posters**: Per-season artwork

### Credits

- **Cast**: Regular and recurring actors
- **Crew**: Creators, showrunners, writers
- **Created By**: Original creators
- **Production Companies**: Studios involved

### Classification

- **Genres**: Drama, Comedy, Sci-Fi, etc.
- **Keywords**: Thematic tags
- **Content Rating**: Age certification

### Metrics

- **Vote Average**: User rating (0-10)
- **Vote Count**: Number of ratings
- **Popularity**: TMDB popularity score

## API Endpoints

### Get TV Show Details

```
GET /api/tv/{id}
```

**Response**:
```json
{
  "id": number,
  "name": "string",
  "overview": "string",
  "posterPath": "string",
  "backdropPath": "string",
  "firstAirDate": "string",
  "lastAirDate": "string",
  "numberOfSeasons": number,
  "numberOfEpisodes": number,
  "status": "string",
  "voteAverage": number,
  "voteCount": number,
  "genres": [{ "id": number, "name": "string" }],
  "cast": [{ "id": number, "name": "string", "character": "string" }],
  "seasons": [{ "id": number, "name": "string", "episodeCount": number }],
  "videos": [{ "key": "string", "type": "string", "site": "string" }]
}
```

### Get Similar TV Shows

```
POST /api/recommendations
Content-Type: application/json

{
  "basedOn": {
    "contentId": {id},
    "mediaType": "tv"
  }
}
```

## Page Sections

1. **Hero**: Backdrop image with title overlay
2. **Details Panel**: Poster, metadata, actions
3. **Overview**: Series summary
4. **Seasons**: Season selector and episode list
5. **Cast**: Main cast members
6. **Videos**: Trailers and promos
7. **Similar Shows**: Recommendations

## User Actions

- **Watch Trailer**: Play embedded video
- **Add to Watchlist**: Save for later
- **Browse Seasons**: View episode guide
- **Find Similar**: Get recommendations
- **Share**: Copy link to show

## Navigation

- **Back**: Return to previous page
- **Search**: New search
- **Season**: Navigate between seasons
- **Episode**: View episode details (future)
- **Related**: Navigate to similar shows

## Technical Notes

- Server-side rendered with dynamic data
- Season/episode data loaded on demand
- Images optimized via Next.js Image
- ISR for popular shows

## Related Resources

- [Homepage](/) - Trending content
- [Search](/search) - Find specific shows
- [Discover](/discover) - Browse by genre
- [API Docs](/llms.md) - Full API documentation
