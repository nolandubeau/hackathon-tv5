import type { Movie, TVShow } from '@/types/media';
import type { Genre } from './discovery-store';

export interface RecommendationSource {
  type: 'ai' | 'preference' | 'trending';
  conversationSnippet?: string;
}

/**
 * Fetches a recommendation based on user preferences
 * This will eventually integrate with AI conversation context
 */
export async function getFirstRecommendation(
  preferences: Genre[]
): Promise<(Movie | TVShow) | null> {
  try {
    // Get top preference genre
    const topGenre = preferences[0];
    if (!topGenre || !topGenre.tmdbId) {
      console.log('No valid genre preference, using trending');
      return getTrendingRecommendation();
    }

    console.log('Fetching recommendation for genre:', topGenre.name, 'ID:', topGenre.tmdbId);

    // Query TMDB discover endpoint for popular content in this genre
    // Use correct API parameters: category=discover, genres=ID
    const response = await fetch(
      `/api/discover?category=discover&genres=${topGenre.tmdbId}&type=all&page=1`
    );

    if (!response.ok) {
      console.error('API response not OK:', response.status);
      throw new Error('Failed to fetch recommendations');
    }

    const data = await response.json();
    console.log('API response:', data);

    if (data.results && data.results.length > 0) {
      // Get a random item from top 10 to add variety
      const topResults = data.results.slice(0, 10);
      const randomIndex = Math.floor(Math.random() * topResults.length);
      console.log('Selected recommendation:', topResults[randomIndex].title);
      return topResults[randomIndex];
    }

    // Fallback to trending if no results
    console.log('No results found, using trending');
    return getTrendingRecommendation();
  } catch (error) {
    console.error('Error fetching recommendation:', error);
    return getTrendingRecommendation();
  }
}

/**
 * Fetches a trending recommendation as fallback
 */
export async function getTrendingRecommendation(): Promise<(Movie | TVShow) | null> {
  try {
    const response = await fetch('/api/trending?timeWindow=day&page=1');

    if (!response.ok) {
      throw new Error('Failed to fetch trending content');
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0];
    }

    return null;
  } catch (error) {
    console.error('Error fetching trending recommendation:', error);
    return null;
  }
}

/**
 * Gets recommendation with source information
 */
export async function getRecommendationWithSource(
  preferences: Genre[]
): Promise<{ content: Movie | TVShow; source: RecommendationSource } | null> {
  const content = await getFirstRecommendation(preferences);

  if (!content) {
    return null;
  }

  const source: RecommendationSource = preferences.length > 0
    ? { type: 'preference' }
    : { type: 'trending' };

  return { content, source };
}
