# AI Media Discovery - Search

## overview {#overview}
> Machine-readable view for: Search Page
> ARW Profile: ARW-1
> Content Type: page
> URL: /search

The search page provides a powerful natural language search interface for discovering movies and TV shows. Users describe what they want to watch, and the system uses semantic embeddings to find matching content.

## capabilities {#capabilities}

### Semantic Search

The search system understands natural language queries and finds content based on:

- **Themes & Mood**: "dark and atmospheric", "feel-good comedy"
- **Plot Elements**: "time travel", "heist", "coming of age"
- **Style**: "visually stunning", "dialogue-driven"
- **Audience**: "family-friendly", "mature themes"
- **Era**: "80s nostalgia", "futuristic"

### Search Features

| Feature | Description |
|---------|-------------|
| Natural Language | Describe what you want in plain English |
| Filters | Refine by media type, year, rating |
| Sorting | Order by relevance, rating, popularity, date |
| Pagination | Browse through all results |

## api {#api}

### Search Endpoint

```json
POST /api/search
Content-Type: application/json

{
  "query": "exciting sci-fi adventure with time travel",
  "filters": {
    "mediaType": "movie",
    "yearMin": 2010,
    "yearMax": 2024,
    "ratingMin": 7.0,
    "genres": [878, 28]
  },
  "sort": "relevance",
  "page": 1,
  "limit": 20
}
```

### Response Format

```json
{
  "success": true,
  "results": [
    {
      "id": 157336,
      "title": "Interstellar",
      "mediaType": "movie",
      "overview": "...",
      "posterPath": "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      "releaseDate": "2014-11-05",
      "voteAverage": 8.4,
      "similarity": 0.92
    }
  ],
  "totalResults": 150,
  "page": 1,
  "totalPages": 8
}
```

## filters {#filters}

### Available Filters

| Filter | Type | Options |
|--------|------|---------|
| mediaType | string | "movie", "tv", "all" |
| yearMin | number | 1900-2024 |
| yearMax | number | 1900-2024 |
| ratingMin | number | 0-10 |
| genres | array | Genre IDs from TMDB |

### Genre IDs

| ID | Genre |
|----|-------|
| 28 | Action |
| 12 | Adventure |
| 16 | Animation |
| 35 | Comedy |
| 80 | Crime |
| 99 | Documentary |
| 18 | Drama |
| 10751 | Family |
| 14 | Fantasy |
| 36 | History |
| 27 | Horror |
| 10402 | Music |
| 9648 | Mystery |
| 10749 | Romance |
| 878 | Science Fiction |
| 10770 | TV Movie |
| 53 | Thriller |
| 10752 | War |
| 37 | Western |

## examples {#examples}

### Example Queries

1. **Mood-based**
   - "something uplifting and inspiring"
   - "dark and suspenseful thriller"
   - "light-hearted comedy for a lazy Sunday"

2. **Plot-based**
   - "movies about artificial intelligence"
   - "shows with political intrigue"
   - "stories about unlikely friendships"

3. **Comparison-based**
   - "movies like Inception"
   - "shows similar to Breaking Bad"
   - "something between comedy and drama"

4. **Specific requests**
   - "Oscar-winning dramas from the 2010s"
   - "animated movies for adults"
   - "true crime documentaries"

## layout

### Page Structure

1. **Search Header**
   - Large search input field
   - Search button
   - Voice search option (future)

2. **Filters Panel**
   - Media type toggle
   - Year range slider
   - Minimum rating slider
   - Genre multi-select

3. **Results Grid**
   - Poster thumbnails
   - Title and year
   - Rating badge
   - Media type indicator

4. **Pagination**
   - Page numbers
   - Previous/Next navigation

## navigation

- [Homepage](/) - Return to main page
- [Discover](/discover) - Browse by category
- [Movie Details](/movie/[id]) - View movie info
- [TV Details](/tv/[id]) - View show info

## actions {#actions}

| Action | Endpoint | Method | Auth |
|--------|----------|--------|------|
| Search | `/api/search` | POST | None |
| Get Movie | `/api/movies/:id` | GET | None |
| Get TV Show | `/api/tv/:id` | GET | None |

---
*Machine view for AI Media Discovery Search*
*ARW Profile: ARW-1*
