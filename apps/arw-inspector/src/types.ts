export interface ARWDiscovery {
  version: string;
  site: {
    name: string;
    description: string;
    homepage: string;
    contact?: string;
  };
  content?: ContentEntry[];
  actions?: Action[];
  protocols?: Protocol[];
  policies?: Policies;
}

export interface ContentEntry {
  url: string;
  machine_view?: string;
  purpose?: string;
  priority?: 'high' | 'medium' | 'low';
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface Action {
  id: string;
  name: string;
  endpoint: string;
  method: string;
  auth?: string;
  scopes?: string[];
  schema?: Record<string, unknown>;
  description?: string;
}

export interface Protocol {
  name: string;
  type: string;
  endpoint: string;
  schema?: string;
  description?: string;
}

export interface Policies {
  training?: {
    allowed: boolean;
    note?: string;
  };
  inference?: {
    allowed: boolean;
    restrictions?: string[];
  };
  attribution?: {
    required: boolean;
    format?: string;
    template?: string;
  };
  rate_limits?: {
    requests_per_minute?: number;
    authenticated?: string;
    unauthenticated?: string;
    note?: string;
  };
}

export interface ViewComparison {
  machineView: {
    content: string;
    size: number;
    lines: number;
    chunks: number;
    estimatedTokens: number;
  };
  htmlView: {
    content: string;
    size: number;
    lines: number;
    estimatedTokens: number;
  };
  savings: {
    sizePercent: number;
    tokenPercent: number;
    absoluteTokens: number;
  };
}

export interface TokenCostModel {
  provider: string;
  model: string;
  id: string;
  inputCostPerMToken: number;
  outputCostPerMToken: number;
  contextWindow: number;
  category: 'flagship' | 'fast' | 'premium';
  note?: string;
}

export interface CostComparison {
  model: TokenCostModel;
  machineViewCost: number;
  htmlViewCost: number;
  savings: number;
  savingsPercent: number;
}

export interface WellKnownFile {
  url: string;
  exists: boolean;
  content?: string;
  error?: string;
}

export interface SitemapInfo {
  exists: boolean;
  url: string;
  entryCount?: number;
  content?: string;
  error?: string;
}

export interface RobotsInfo {
  exists: boolean;
  url: string;
  content?: string;
  hasArwHints?: boolean;
  error?: string;
}

export interface AIHeaders {
  found: boolean;
  headers: Record<string, string>;
}

export interface DiscoveryInfo {
  wellKnown: {
    manifest?: WellKnownFile;
    contentIndex?: WellKnownFile;
    policies?: WellKnownFile;
  };
  sitemap?: SitemapInfo;
  robots?: RobotsInfo;
  aiHeaders?: AIHeaders;
}

export interface InspectionResult {
  url: string;
  discovery: ARWDiscovery | null;
  rawYaml?: string;
  errors: string[];
  warnings: string[];
  htmlHeaders?: Record<string, string>;
  machineViews: Map<string, string>;
  chunks: Map<string, string[]>;
  comparisons: Map<string, ViewComparison>;
  usedProxy?: boolean;
  discoveryInfo?: DiscoveryInfo;
}
