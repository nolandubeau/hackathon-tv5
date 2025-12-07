# AI Media Discovery - Discover

## overview {#overview}
> Machine-readable view for: Discover Page
> ARW Profile: ARW-1
> Content Type: page
> URL: /discover

The discover page allows users to browse content by categories, genres, and various filters. It provides curated collections of movies and TV shows organized for easy exploration.

## categories {#categories}

### Available Categories

| Category | Endpoint | Description |
|----------|----------|-------------|
| trending | `/api/discover?category=trending` | Currently popular content |
| popular | `/api/discover?category=popular` | All-time popular content |
| top_rated | `/api/discover?category=top_rated` | Highest rated content |
| upcoming | `/api/discover?category=upcoming` | Coming soon (movies) |
| now_playing | `/api/discover?category=now_playing` | In theaters now |
| on_the_air | `/api/discover?category=on_the_air` | Currently airing (TV) |

### Category API

```
GET /api/discover?category=trending&type=movie&page=1
```

## genres {#genres}

### Movie Genres

| ID | Name | Example Content |
|----|------|-----------------|
| 28 | Action | Mission: Impossible, John Wick |
| 12 | Adventure | Indiana Jones, Jurassic Park |
| 16 | Animation | Pixar, Studio Ghibli |
| 35 | Comedy | Superbad, The Hangover |
| 80 | Crime | The Godfather, Goodfellas |
| 99 | Documentary | Planet Earth, Making a Murderer |
| 18 | Drama | The Shawshank Redemption |
| 10751 | Family | Home Alone, Frozen |
| 14 | Fantasy | Lord of the Rings, Harry Potter |
| 36 | History | Schindler's List, Lincoln |
| 27 | Horror | The Exorcist, Get Out |
| 10402 | Music | La La Land, Bohemian Rhapsody |
| 9648 | Mystery | Knives Out, Gone Girl |
| 10749 | Romance | The Notebook, Pride & Prejudice |
| 878 | Science Fiction | Star Wars, The Matrix |
| 53 | Thriller | Se7en, Silence of the Lambs |
| 10752 | War | Saving Private Ryan, Dunkirk |
| 37 | Western | Django Unchained, True Grit |

### TV Genres

| ID | Name | Example Content |
|----|------|-----------------|
| 10759 | Action & Adventure | Game of Thrones |
| 16 | Animation | Rick and Morty |
| 35 | Comedy | The Office, Friends |
| 80 | Crime | Breaking Bad, True Detective |
| 99 | Documentary | Our Planet |
| 18 | Drama | The Sopranos, Mad Men |
| 10751 | Family | Stranger Things |
| 10762 | Kids | SpongeBob |
| 9648 | Mystery | Sherlock |
| 10763 | News | - |
| 10764 | Reality | Survivor |
| 10765 | Sci-Fi & Fantasy | The Mandalorian |
| 10766 | Soap | - |
| 10767 | Talk | - |
| 10768 | War & Politics | Band of Brothers |
| 37 | Western | Westworld |

## api {#api}

### Discover Endpoint

```
GET /api/discover
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| category | string | trending | Category to browse |
| type | string | all | "movie", "tv", or "all" |
| genre | number | - | Filter by genre ID |
| page | number | 1 | Page number |
| sort_by | string | popularity.desc | Sort order |

### Response Format

```json
{
  "success": true,
  "results": [
    {
      "id": 550,
      "title": "Fight Club",
      "mediaType": "movie",
      "overview": "...",
      "posterPath": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      "releaseDate": "1999-10-15",
      "voteAverage": 8.4
    }
  ],
  "page": 1,
  "totalPages": 500,
  "totalResults": 10000
}
```

## filters {#filters}

### Available Filters

| Filter | Parameter | Options |
|--------|-----------|---------|
| Media Type | type | movie, tv, all |
| Genre | genre | Genre ID |
| Year | year | 1900-2024 |
| Rating | vote_average.gte | 0-10 |
| Sort | sort_by | popularity.desc, vote_average.desc, release_date.desc |

### Sort Options

| Value | Description |
|-------|-------------|
| popularity.desc | Most popular first |
| popularity.asc | Least popular first |
| vote_average.desc | Highest rated first |
| vote_average.asc | Lowest rated first |
| release_date.desc | Newest first |
| release_date.asc | Oldest first |

## layout

### Page Structure

1. **Category Tabs**
   - Trending
   - Popular
   - Top Rated
   - New Releases

2. **Filter Sidebar**
   - Media type selector
   - Genre list
   - Year range
   - Rating filter

3. **Content Grid**
   - Responsive poster grid
   - Hover details
   - Quick actions

4. **Infinite Scroll**
   - Load more on scroll
   - Page indicators

## navigation

- [Homepage](/) - Return to main page
- [Search](/search) - Natural language search
- [Movie Details](/movie/[id]) - View movie info
- [TV Details](/tv/[id]) - View show info

## actions {#actions}

| Action | Endpoint | Method | Auth |
|--------|----------|--------|------|
| Browse | `/api/discover` | GET | None |
| Filter by Genre | `/api/discover?genre=28` | GET | None |
| Get Details | `/api/movies/:id` | GET | None |

---
*Machine view for AI Media Discovery Discover*
*ARW Profile: ARW-1*
