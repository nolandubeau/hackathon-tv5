/**
 * Background Image API
 * GET /api/background-image
 *
 * Returns a personalized background image based on user preferences stored in ruvector
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserPreferences } from '@/lib/preferences';
import { GENRES } from '@/lib/discovery-store';

/**
 * GET - Get background image based on user preferences
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');

  if (!userId) {
    // Return a default random image if no userId
    const randomGenre = GENRES[Math.floor(Math.random() * GENRES.length)];
    return NextResponse.json({
      success: true,
      imageUrl: randomGenre.src,
      genre: randomGenre.name,
      color: randomGenre.color,
    });
  }

  try {
    const prefs = await getUserPreferences(userId);

    // Get favorite genres or use random if none
    let selectedGenre;
    if (prefs.favoriteGenres && prefs.favoriteGenres.length > 0) {
      // Find the genre that matches the user's top preference
      const topGenreId = prefs.favoriteGenres[0];
      selectedGenre = GENRES.find(g => g.tmdbId === topGenreId) || GENRES[0];
    } else {
      // Random genre if no preferences
      selectedGenre = GENRES[Math.floor(Math.random() * GENRES.length)];
    }

    return NextResponse.json({
      success: true,
      imageUrl: selectedGenre.src,
      genre: selectedGenre.name,
      color: selectedGenre.color,
    });
  } catch (error) {
    console.error('Error fetching background image:', error);

    // Fallback to random genre
    const randomGenre = GENRES[Math.floor(Math.random() * GENRES.length)];
    return NextResponse.json({
      success: true,
      imageUrl: randomGenre.src,
      genre: randomGenre.name,
      color: randomGenre.color,
    });
  }
}
