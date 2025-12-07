/**
 * TV Show LLM Machine View API
 * GET /api/tv/[id]/llm
 *
 * Returns machine-readable markdown for a specific TV show
 * Used for dynamic .llm.md generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFullTVShowDetails } from '@/lib/tmdb';

function generateTVLLM(data: any): string {
  // Extract nested show object and other properties
  const show = data.show;
  const { credits, videos, similar, recommendations, genres } = data;

  const firstAirYear = show.firstAirDate ? new Date(show.firstAirDate).getFullYear() : 'Unknown';
  const lastAirYear = show.lastAirDate ? new Date(show.lastAirDate).getFullYear() : 'Present';
  const yearRange = firstAirYear === lastAirYear ? firstAirYear : `${firstAirYear}-${lastAirYear}`;
  const genreNames = genres?.map((g: any) => g.name).join(', ') || 'Unknown';
  const rating = show.voteAverage?.toFixed(1) || 'N/A';
  const voteCount = show.voteCount?.toLocaleString() || '0';
  const episodeRuntime = show.episodeRunTime?.[0] ? `${show.episodeRunTime[0]} min` : 'Varies';

  // Get top cast (limit to 10)
  const cast = credits?.cast?.slice(0, 10) || [];
  const castList = cast.map((c: any) => `- **${c.name}** as ${c.character}`).join('\n');

  // Get creators (Note: This data might not be in the basic response, would need to be added to getFullTVShowDetails)
  const creators = 'Unknown'; // TODO: Add created_by to getFullTVShowDetails if needed

  // Get networks (Note: This data might not be in the basic response, would need to be added to getFullTVShowDetails)
  const networks = 'Unknown'; // TODO: Add networks to getFullTVShowDetails if needed

  // Get trailer
  const trailer = videos?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
  const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;

  // Get seasons summary (Note: This data might not be in the basic response, would need to be added to getFullTVShowDetails)
  const seasonsList = 'Season details not available.'; // TODO: Add seasons to getFullTVShowDetails if needed

  // Get similar shows
  const similarList = similar?.slice(0, 5).map((s: any) =>
    `- [${s.title || s.name}](/tv/${s.id}) (${s.voteAverage?.toFixed(1)})`
  ).join('\n') || 'No similar shows found.';

  // Get recommendations
  const recommendationsList = recommendations?.slice(0, 5).map((r: any) =>
    `- [${r.title || r.name}](/tv/${r.id}) (${r.voteAverage?.toFixed(1)})`
  ).join('\n') || 'No recommendations available.';

  return `# ${show.name || show.title} (${yearRange})

## overview {#overview}
> Machine-readable view for: ${show.name || show.title}
> ARW Profile: ARW-1
> Content Type: tv
> ID: ${show.id}

${show.tagline ? `*"${show.tagline}"*\n\n` : ''}${show.overview || 'No overview available.'}

## metadata {#metadata}

| Property | Value |
|----------|-------|
| **Name** | ${show.name || show.title} |
| **Original Name** | ${show.originalTitle || show.originalName || show.name || show.title} |
| **First Air Date** | ${show.firstAirDate || 'Unknown'} |
| **Last Air Date** | ${show.lastAirDate || 'Ongoing'} |
| **Status** | ${show.status || 'Unknown'} |
| **Genres** | ${genreNames} |
| **Rating** | ${rating}/10 (${voteCount} votes) |
| **Popularity** | ${show.popularity?.toFixed(0) || 'N/A'} |
| **Seasons** | ${show.numberOfSeasons || 0} |
| **Episodes** | ${show.numberOfEpisodes || 0} |
| **Episode Runtime** | ${episodeRuntime} |
| **Networks** | ${networks} |
| **In Production** | ${show.inProduction ? 'Yes' : 'No'} |
| **Original Language** | ${show.originalLanguage?.toUpperCase() || 'Unknown'} |

## media {#media}

### Images
- **Poster**: https://image.tmdb.org/t/p/w500${show.posterPath || ''}
- **Backdrop**: https://image.tmdb.org/t/p/w1280${show.backdropPath || ''}

${trailerUrl ? `### Trailer\n- [Watch on YouTube](${trailerUrl})\n` : ''}

## seasons {#seasons}

${seasonsList}

## cast {#cast}

${castList || 'Cast information not available.'}

## crew {#crew}

- **Created By**: ${creators}

## similar {#similar}

${similarList}

## recommendations {#recommendations}

${recommendationsList}

## actions {#actions}

Available actions for this TV show:

- **Get Full Details**: \`GET /api/tv/${show.id}\`
- **Get Similar Shows**: \`POST /api/recommendations\` with \`{ "basedOn": { "contentId": ${show.id}, "mediaType": "tv" } }\`
- **Search Related**: \`POST /api/search\` with genre or keyword queries

## navigation {#navigation}

- [Back to Homepage](/)
- [Search](/search)
- [Discover TV Shows](/discover)

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
    const tvId = parseInt(id, 10);

    if (isNaN(tvId)) {
      return new NextResponse('# Error\n\nInvalid TV show ID', {
        status: 400,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'X-ARW-Version': '0.1',
        },
      });
    }

    const tvShowData = await getFullTVShowDetails(tvId);
    const markdown = generateTVLLM(tvShowData);

    return new NextResponse(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'X-ARW-Version': '0.1',
        'X-ARW-Content-Type': 'tv',
        'X-ARW-Content-ID': id,
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('TV LLM generation error:', error);
    return new NextResponse('# Error\n\nFailed to generate TV show machine view', {
      status: 500,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
      },
    });
  }
}
