/**
 * Movie LLM Machine View API
 * GET /api/movies/[id]/llm
 *
 * Returns machine-readable markdown for a specific movie
 * Used for dynamic .llm.md generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFullMovieDetails } from '@/lib/tmdb';

function generateMovieLLM(data: any): string {
  // Extract nested movie object and other properties
  const movie = data.movie;
  const { credits, videos, similar, recommendations, genres } = data;

  const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'Unknown';
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 'Unknown';
  const genreNames = genres?.map((g: any) => g.name).join(', ') || 'Unknown';
  const rating = movie.voteAverage?.toFixed(1) || 'N/A';
  const voteCount = movie.voteCount?.toLocaleString() || '0';

  // Get top cast (limit to 10)
  const cast = credits?.cast?.slice(0, 10) || [];
  const castList = cast.map((c: any) => `- **${c.name}** as ${c.character}`).join('\n');

  // Get director(s)
  const directors = credits?.crew?.filter((c: any) => c.job === 'Director') || [];
  const directorNames = directors.map((d: any) => d.name).join(', ') || 'Unknown';

  // Get trailer
  const trailer = videos?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
  const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;

  // Get similar movies
  const similarList = similar?.slice(0, 5).map((s: any) =>
    `- [${s.title}](/movie/${s.id}) (${s.voteAverage?.toFixed(1)})`
  ).join('\n') || 'No similar movies found.';

  // Get recommendations
  const recommendationsList = recommendations?.slice(0, 5).map((r: any) =>
    `- [${r.title}](/movie/${r.id}) (${r.voteAverage?.toFixed(1)})`
  ).join('\n') || 'No recommendations available.';

  return `# ${movie.title} (${releaseYear})

## overview {#overview}
> Machine-readable view for: ${movie.title}
> ARW Profile: ARW-1
> Content Type: movie
> ID: ${movie.id}

${movie.tagline ? `*"${movie.tagline}"*\n\n` : ''}${movie.overview || 'No overview available.'}

## metadata {#metadata}

| Property | Value |
|----------|-------|
| **Title** | ${movie.title} |
| **Original Title** | ${movie.originalTitle || movie.title} |
| **Release Date** | ${movie.releaseDate || 'Unknown'} |
| **Runtime** | ${runtime} |
| **Status** | ${movie.status || 'Unknown'} |
| **Genres** | ${genreNames} |
| **Rating** | ${rating}/10 (${voteCount} votes) |
| **Popularity** | ${movie.popularity?.toFixed(0) || 'N/A'} |
| **Budget** | ${movie.budget ? `$${movie.budget.toLocaleString()}` : 'Unknown'} |
| **Revenue** | ${movie.revenue ? `$${movie.revenue.toLocaleString()}` : 'Unknown'} |
| **Original Language** | ${movie.originalLanguage?.toUpperCase() || 'Unknown'} |

## media {#media}

### Images
- **Poster**: https://image.tmdb.org/t/p/w500${movie.posterPath || ''}
- **Backdrop**: https://image.tmdb.org/t/p/w1280${movie.backdropPath || ''}

${trailerUrl ? `### Trailer\n- [Watch on YouTube](${trailerUrl})\n` : ''}

## cast {#cast}

${castList || 'Cast information not available.'}

## crew {#crew}

- **Director**: ${directorNames}

## similar {#similar}

${similarList}

## recommendations {#recommendations}

${recommendationsList}

## actions {#actions}

Available actions for this movie:

- **Get Full Details**: \`GET /api/movies/${movie.id}\`
- **Get Similar Movies**: \`POST /api/recommendations\` with \`{ "basedOn": { "contentId": ${movie.id}, "mediaType": "movie" } }\`
- **Search Related**: \`POST /api/search\` with genre or keyword queries

## navigation {#navigation}

- [Back to Homepage](/)
- [Search](/search)
- [Discover Movies](/discover)

---
*Generated dynamically by AI Media Discovery*
*Data provided by TMDB*
`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const movieId = parseInt(id, 10);

    if (isNaN(movieId)) {
      return new NextResponse('# Error\n\nInvalid movie ID', {
        status: 400,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'X-ARW-Version': '0.1',
        },
      });
    }

    const movie = await getFullMovieDetails(movieId);
    const markdown = generateMovieLLM(movie);

    return new NextResponse(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'X-ARW-Version': '0.1',
        'X-ARW-Content-Type': 'movie',
        'X-ARW-Content-ID': id,
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Movie LLM generation error:', error);
    return new NextResponse('# Error\n\nFailed to generate movie machine view', {
      status: 500,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
      },
    });
  }
}
