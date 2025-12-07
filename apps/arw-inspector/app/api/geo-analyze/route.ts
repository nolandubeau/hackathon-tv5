import { NextRequest, NextResponse } from 'next/server';
import { GEOOptimizer } from '@arw/geo';
import type { GEOConfig } from '../../../src/types-geo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, url, config } = body as {
      content: string;
      url: string;
      config: GEOConfig;
    };

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const startTime = performance.now();

    // Initialize GEO optimizer
    const optimizer = new GEOOptimizer({
      profile: config.profile || 'ARW-2.2',
      ...(config.domain && { domain: config.domain as import('@arw/geo').DomainType }),
      ...(config.llm && { llm: config.llm })
    });

    // Run analysis
    const analysis = await optimizer.analyze(content, {
      extractCitations: true,
      extractStatistics: true,
      extractQuotations: true,
      calculateQuality: true,
      extractEntities: true,
      useLLM: config.useLLM || false
    });

    const analysisTime = (performance.now() - startTime) / 1000;

    // Format response
    const result = {
      url,
      profile: config.profile || 'ARW-2.2',
      domain: config.domain || 'saas',
      timestamp: new Date().toISOString(),
      overall: {
        score: calculateOverallScore(analysis),
        citations: analysis.citations?.length || 0,
        statistics: analysis.statistics?.length || 0,
        quotations: analysis.quotations?.length || 0,
        entities: analysis.entities?.length || 0,
        qualityScore: analysis.quality?.score || 0
      },
      citations: analysis.citations || [],
      statistics: analysis.statistics || [],
      quotations: analysis.quotations || [],
      entities: analysis.entities || [],
      quality: analysis.quality || null,
      usedLLM: config.useLLM || false,
      analysisTime
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('GEO analysis error:', error);
    return NextResponse.json(
      {
        error: 'Analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function calculateOverallScore(analysis: any): number {
  let score = 0;
  let maxScore = 0;

  // Citations (40 points max)
  const citationCount = analysis.citations?.length || 0;
  score += Math.min(citationCount * 5, 40);
  maxScore += 40;

  // Statistics (20 points max)
  const statCount = analysis.statistics?.length || 0;
  score += Math.min(statCount * 4, 20);
  maxScore += 20;

  // Quotations (20 points max)
  const quoteCount = analysis.quotations?.length || 0;
  score += Math.min(quoteCount * 5, 20);
  maxScore += 20;

  // Entities (10 points max)
  const entityCount = analysis.entities?.length || 0;
  score += Math.min(entityCount * 2, 10);
  maxScore += 10;

  // Quality (10 points max)
  const qualityScore = analysis.quality?.score || 0;
  score += qualityScore * 10;
  maxScore += 10;

  return (score / maxScore) * 100;
}
