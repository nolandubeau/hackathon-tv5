/**
 * GEO (Generative Engine Optimization) Analysis Types
 */

export interface GEOAnalysisResult {
  url: string;
  profile: 'ARW-2.1' | 'ARW-2.2';
  domain: string;
  timestamp: string;

  overall: {
    score: number;
    citations: number;
    statistics: number;
    quotations: number;
    entities: number;
    qualityScore: number;
  };

  citations: Citation[];
  statistics: Statistic[];
  quotations: Quotation[];
  entities: Entity[];
  quality: QualityAnalysis | null;

  usedLLM: boolean;
  analysisTime: number;
}

export interface Citation {
  id: string;
  source: string;
  type: 'academic' | 'industry_report' | 'government' | 'news' | 'book' | 'website';
  url?: string;
  date?: string;
  author?: string;
  publisher?: string;
  authority_score?: number;
}

export interface Statistic {
  id: string;
  value: string | number;
  context: string;
  source?: string;
  date?: string;
  verified?: boolean;
}

export interface Quotation {
  id: string;
  text: string;
  speaker: {
    name: string;
    title?: string;
    affiliation?: string;
    credentials?: string[];
  };
  date?: string;
  source?: string;
  type?: 'expert_opinion' | 'case_study' | 'research_finding';
}

export interface Entity {
  id: string;
  type: 'Person' | 'Organization' | 'Product' | 'Place' | 'Concept';
  name: string;
  wikidata_id?: string;
  schema_type?: string;
  properties?: Record<string, unknown>;
  confidence?: number;
}

export interface QualityAnalysis {
  score: number;
  issues: string[];
  recommendations: string[];
}

export interface GEOConfig {
  profile?: 'ARW-2.1' | 'ARW-2.2';
  domain?: string;
  useLLM?: boolean;
  llm?: {
    provider: 'anthropic' | 'openai';
    model: string;
    apiKey: string;
    temperature?: number;
    maxTokens?: number;
  };
}
