# AI Media Discovery - Movie Details

## Page Overview

The movie details page provides comprehensive information about a specific movie, including metadata, cast, crew, videos, and related content recommendations.

## Dynamic Content

This is a template for movie detail pages at `/movie/[id]`.

For specific movie data, use the API:

```
GET /api/movies/{id}
```

## Available Information

### Basic Metadata

- **Title**: Movie title
- **Original Title**: Original language title
- **Release Date**: Theatrical release date
- **Runtime**: Duration in minutes
- **Status**: Released, In Production, etc.
- **Tagline**: Marketing tagline
- **Overview**: Plot summary

### Media

- **Poster**: Primary movie poster
- **Backdrop**: Wide promotional image
- **Videos**: Trailers, teasers, clips
- **Images**: Production stills, promotional images

### Credits

- **Cast**: Actors and their characters
- **Crew**: Directors, writers, producers
- **Production Companies**: Studios involved

### Classification

- **Genres**: Action, Drama, Comedy, etc.
- **Keywords**: Thematic tags
- **Content Rating**: Age certification (varies by region)

### Metrics

- **Vote Average**: User rating (0-10 scale)
- **Vote Count**: Number of ratings
- **Popularity**: TMDB popularity score
- **Budget**: Production budget (if available)
- **Revenue**: Box office earnings (if available)

## API Endpoints

### Get Movie Details

```
GET /api/movies/{id}
```

**Response**:
```json
{
  "id": number,
  "title": "string",
  "overview": "string",
  "posterPath": "string",
  "backdropPath": "string",
  "releaseDate": "string",
  "runtime": number,
  "voteAverage": number,
  "voteCount": number,
  "genres": [{ "id": number, "name": "string" }],
  "cast": [{ "id": number, "name": "string", "character": "string" }],
  "videos": [{ "key": "string", "type": "string", "site": "string" }]
}
```

### Get Similar Movies

```
POST /api/recommendations
Content-Type: application/json

{
  "basedOn": {
    "contentId": {id},
    "mediaType": "movie"
  }
}
```

## Page Sections

1. **Hero**: Backdrop image with title overlay
2. **Details Panel**: Poster, metadata, actions
3. **Overview**: Plot summary
4. **Cast**: Top billed actors
5. **Videos**: Trailers and clips
6. **Similar Movies**: Recommendations

## User Actions

- **Watch Trailer**: Play embedded video
- **Add to Watchlist**: Save for later (local storage)
- **Find Similar**: Get recommendations
- **Share**: Copy link to movie

## Navigation

- **Back**: Return to previous page
- **Search**: New search
- **Related**: Navigate to similar movies
- **Cast Member**: View actor filmography (future)

## Technical Notes

- Server-side rendered with dynamic data
- Images optimized via Next.js Image component
- Lazy loading for videos and images
- ISR for popular movies

## Related Resources

- [Homepage](/) - Trending content
- [Search](/search) - Find specific movies
- [Discover](/discover) - Browse by genre
- [API Docs](/llms.md) - Full API documentation
