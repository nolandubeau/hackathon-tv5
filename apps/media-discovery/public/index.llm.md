# AI Media Discovery - Homepage

## overview {#overview}
> Machine-readable view for: Homepage
> ARW Profile: ARW-1
> Content Type: page
> URL: /

The homepage of AI Media Discovery is the primary entry point for discovering movies and TV shows through natural language search. It provides trending content, personalized recommendations, and an intelligent search interface.

## search {#search}

### Natural Language Search

Users can describe what they want to watch in plain English:

- **Endpoint**: `/api/search`
- **Method**: POST
- **Input**: Natural language query (e.g., "exciting sci-fi adventure with time travel")
- **Output**: Ranked list of movies and TV shows matching the query

Example queries:
- "exciting sci-fi adventure"
- "cozy romantic comedy"
- "dark psychological thriller"
- "inspiring true story"
- "animated movie for the whole family"

### Search API

```json
POST /api/search
Content-Type: application/json

{
  "query": "exciting sci-fi adventure with time travel",
  "filters": {
    "mediaType": "movie",
    "ratingMin": 7.0
  },
  "limit": 20
}
```

## trending {#trending}

### Browse Trending Content

- **Section**: Trending This Week
- **Endpoint**: `/api/discover?category=trending`
- **Content**: Currently popular movies and TV shows
- **Update Frequency**: Daily

### Trending API

```
GET /api/discover?category=trending&type=all&page=1
```

Returns movies and TV shows currently trending on TMDB.

## recommendations {#recommendations}

### Get Personalized Recommendations

- **Section**: Recommended For You
- **Endpoint**: `/api/recommendations`
- **Basis**: Content similarity and user preferences
- **Personalization**: Adapts based on viewing history

### Recommendations API

```json
POST /api/recommendations
Content-Type: application/json

{
  "basedOn": {
    "contentId": 550,
    "mediaType": "movie"
  },
  "preferences": {
    "genres": [28, 53, 878]
  },
  "limit": 10
}
```

## layout

### Page Structure

1. **Hero Section**
   - Title: AI Media Discovery
   - Description: Natural language search for movies and TV shows
   - Search Bar: Full-width search with autocomplete
   - Quick Prompts: Example searches to inspire users

2. **Trending This Week**
   - Grid layout of popular content
   - Poster images with title overlays
   - Click to view detailed information

3. **Recommended For You**
   - Personalized based on preferences
   - Similar grid layout to trending
   - Updates based on user interactions

## navigation

### Footer Links

- **llms.txt** - Machine-readable site index
- **llms.md** - Human-readable AI documentation
- **ARW Manifest** - API specification at `/.well-known/arw-manifest.json`

### Page Links

- [Search Page](/search) - Advanced search interface
- [Discover](/discover) - Browse by genre and filters

## actions {#actions}

Available actions from this page:

| Action | Endpoint | Method | Description |
|--------|----------|--------|-------------|
| Search | `/api/search` | POST | Natural language content search |
| Discover | `/api/discover` | GET | Browse trending content |
| Recommendations | `/api/recommendations` | POST | Get personalized suggestions |

## technical

### Performance
- Server-side rendering with React Server Components
- Suspense-based lazy loading
- Optimized TMDB image delivery
- Stale-while-revalidate caching

### Accessibility
- ARIA labels on all interactive elements
- Full keyboard navigation support
- Screen reader optimized
- WCAG AA color contrast

---
*Machine view for AI Media Discovery Homepage*
*ARW Profile: ARW-1*
