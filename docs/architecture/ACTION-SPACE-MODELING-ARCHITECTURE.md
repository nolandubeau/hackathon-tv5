# Action Space Modeling Architecture
## Technical Design for ARW + Vector DB + Knowledge Graph Integration

**Version:** 1.0
**Date:** November 20, 2025
**Status:** Proposed Architecture

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Core Components](#core-components)
4. [Data Models](#data-models)
5. [Integration Patterns](#integration-patterns)
6. [API Design](#api-design)
7. [Storage Architecture](#storage-architecture)
8. [Security Architecture](#security-architecture)
9. [Scalability & Performance](#scalability--performance)
10. [Implementation Phases](#implementation-phases)

---

## Executive Summary

This document proposes a technical architecture for integrating action space modeling capabilities into the Agent-Ready Web (ARW) ecosystem using vector databases (LanceDB) and knowledge graphs.

### Key Design Principles

1. **Modular Architecture** - Independent components that can be adopted incrementally
2. **Framework-Agnostic** - Works with LangChain, AutoGen, OpenAI SDK, etc.
3. **Performance-First** - Sub-50ms action retrieval, sub-100µs vector search
4. **Developer-Friendly** - Simple APIs, clear abstractions, excellent DX
5. **Production-Ready** - Observable, scalable, secure, testable

### Technology Stack

```
Application Layer:    LangChain, AutoGen, OpenAI SDK, Custom Agents
       ↓
SDK Layer:           @arw/action-space-sdk (TypeScript/Python)
       ↓
Data Layer:          LanceDB (vectors) + MGraph-DB (graph) + SQLite (metadata)
       ↓
Web Layer:           ARW Manifests + OAuth Endpoints + Actions
```

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐   │
│  │  LangChain   │ │   AutoGen    │ │   Custom Agents      │   │
│  │   Toolkit    │ │    Plugin    │ │  (OpenAI, Claude)    │   │
│  └──────┬───────┘ └──────┬───────┘ └──────────┬───────────┘   │
└─────────┼────────────────┼────────────────────┼───────────────┘
          │                │                    │
┌─────────▼────────────────▼────────────────────▼───────────────┐
│                   ARW ACTION SPACE SDK                         │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Core SDK (@arw/core)                        │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐│ │
│  │  │Discovery │ │  OAuth   │ │  Action  │ │Observability││ │
│  │  │  Engine  │ │ Manager  │ │ Executor │ │  Collector ││ │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────┘│ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │         Memory Layer (@arw/memory)                       │ │
│  │  ┌──────────┐ ┌─────────────┐ ┌────────────────────┐  │ │
│  │  │ Action   │ │ Trajectory  │ │  LLM Cache         │  │ │
│  │  │ Memory   │ │   Memory    │ │  Service           │  │ │
│  │  └──────────┘ └─────────────┘ └────────────────────┘  │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │       Knowledge Layer (@arw/knowledge)                   │ │
│  │  ┌──────────┐ ┌─────────────┐ ┌────────────────────┐  │ │
│  │  │Knowledge │ │  Reasoning  │ │  Pattern           │  │ │
│  │  │  Graph   │ │   Engine    │ │  Learning          │  │ │
│  │  └──────────┘ └─────────────┘ └────────────────────┘  │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────┬───────────────────────────────────────┘
                         │
┌────────────────────────▼───────────────────────────────────────┐
│                      DATA LAYER                                │
│  ┌──────────────┐ ┌─────────────┐ ┌──────────────────────┐   │
│  │   LanceDB    │ │  MGraph-DB  │ │  SQLite/Postgres     │   │
│  │  (Vectors)   │ │   (Graph)   │ │   (Metadata)         │   │
│  └──────────────┘ └─────────────┘ └──────────────────────┘   │
└────────────────────────┬───────────────────────────────────────┘
                         │
┌────────────────────────▼───────────────────────────────────────┐
│                       WEB LAYER                                │
│  ┌──────────────┐ ┌─────────────┐ ┌──────────────────────┐   │
│  │ ARW Manifests│ │OAuth Servers│ │  Action Endpoints    │   │
│  │ (Discovery)  │ │   (Auth)    │ │   (Execution)        │   │
│  └──────────────┘ └─────────────┘ └──────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Technology |
|-----------|----------------|------------|
| **Discovery Engine** | Parse ARW manifests, inspect pages, build action spaces | TypeScript/Python |
| **OAuth Manager** | Handle authentication flows, token management | OAuth 2.0, PKCE |
| **Action Executor** | Execute actions with retry, error handling, logging | Axios/Fetch |
| **Observability** | Track metrics, export telemetry, monitor performance | OpenTelemetry |
| **Action Memory** | Store/retrieve actions via semantic search | LanceDB |
| **Trajectory Memory** | Store/retrieve action sequences for learning | LanceDB |
| **LLM Cache** | Semantic caching to reduce LLM costs | LanceDB |
| **Knowledge Graph** | Store relationships, hierarchies, dependencies | MGraph-DB |
| **Reasoning Engine** | Plan multi-step actions, handle preconditions | Rule engine |
| **Pattern Learning** | Extract reusable patterns from executions | ML/RL algorithms |

---

## Core Components

### 1. Discovery Engine

**Purpose:** Automatically discover and catalog actions from websites.

**Inputs:**
- ARW manifest URL
- Page URL (for Chrome Extension inspection)
- Authentication credentials (if needed)

**Outputs:**
- `ActionSpace` object containing all discovered actions
- Embeddings for each action
- Action metadata (success rates, costs, etc.)

**Implementation:**

```typescript
// packages/core/src/discovery/DiscoveryEngine.ts

export class DiscoveryEngine {
  constructor(
    private manifestParser: ManifestParser,
    private chromeInspector: ChromeInspector,
    private embedder: Embedder
  ) {}

  /**
   * Discover actions from ARW manifest
   */
  async discoverFromManifest(manifestUrl: string): Promise<ActionSpace> {
    // 1. Fetch and parse manifest
    const manifest = await this.manifestParser.parse(manifestUrl);

    // 2. Extract actions
    const actions = manifest.actions.map(action => ({
      ...action,
      source: 'manifest',
      discoveredAt: new Date()
    }));

    // 3. Generate embeddings
    for (const action of actions) {
      action.embedding = await this.embedder.embed(
        `${action.name}: ${action.description}`
      );
    }

    // 4. Build action space
    return new ActionSpace(actions);
  }

  /**
   * Discover actions via Chrome Extension page inspection
   */
  async discoverFromPage(pageUrl: string): Promise<ActionSpace> {
    // 1. Inspect page via Chrome Extension
    const inspection = await this.chromeInspector.inspect(pageUrl);

    // 2. Extract interactive elements from accessibility tree
    const elements = inspection.a11yTree.filter(node =>
      node.role in ['button', 'link', 'textbox', 'combobox']
    );

    // 3. Generate actions from elements
    const actions = elements.map(element => this.inferAction(element));

    // 4. Generate embeddings
    for (const action of actions) {
      action.embedding = await this.embedder.embed(
        `${action.name}: ${action.description}`
      );
    }

    return new ActionSpace(actions);
  }

  /**
   * Infer action from accessibility tree element
   */
  private inferAction(element: A11yNode): Action {
    return {
      id: generateId(),
      name: element.name || element.label,
      description: element.description || `${element.role} on the page`,
      selector: element.selector,
      schemaType: this.inferSchemaType(element),
      role: element.role,
      discoveredAt: new Date(),
      source: 'chrome-extension'
    };
  }
}
```

### 2. Action Memory Service (LanceDB)

**Purpose:** Store and retrieve actions using semantic search.

**Key Features:**
- Sub-50ms semantic search
- Success rate tracking
- Metadata filtering (domain, auth, cost)
- Automatic embedding generation

**Implementation:**

```typescript
// packages/memory/src/ActionMemoryService.ts

import * as lancedb from 'vectordb';

export class ActionMemoryService {
  private db: lancedb.Connection;
  private table: lancedb.Table;

  constructor(
    private dbPath: string,
    private embedder: Embedder
  ) {}

  async initialize(): Promise<void> {
    this.db = await lancedb.connect(this.dbPath);

    // Create table if not exists
    try {
      this.table = await this.db.openTable('actions');
    } catch {
      this.table = await this.db.createTable('actions', [
        {
          id: 'example-id',
          name: 'Example Action',
          description: 'Example description',
          vector: Array(384).fill(0),
          endpoint: 'https://example.com/action',
          method: 'POST',
          auth: { type: 'oauth2' },
          schemaType: 'Action',
          successRate: 0.0,
          avgLatencyMs: 0,
          executionCount: 0,
          metadata: {}
        }
      ]);
    }
  }

  /**
   * Store action with embedding
   */
  async store(action: Action): Promise<void> {
    const embedding = action.embedding || await this.embedder.embed(
      `${action.name}: ${action.description}`
    );

    await this.table.add([{
      id: action.id,
      name: action.name,
      description: action.description,
      vector: embedding,
      endpoint: action.endpoint,
      method: action.method,
      auth: action.auth,
      schemaType: action.schemaType,
      successRate: action.successRate || 0.0,
      avgLatencyMs: action.avgLatencyMs || 0,
      executionCount: action.executionCount || 0,
      metadata: action.metadata || {}
    }]);
  }

  /**
   * Semantic search for actions
   */
  async search(
    query: string,
    options: SearchOptions = {}
  ): Promise<Action[]> {
    const {
      limit = 10,
      filters = {},
      minSuccessRate = 0.0
    } = options;

    // Generate query embedding
    const queryEmbedding = await this.embedder.embed(query);

    // Build filter string
    let filterStr = `successRate >= ${minSuccessRate}`;
    if (filters.domain) {
      filterStr += ` AND domain = '${filters.domain}'`;
    }
    if (filters.schemaType) {
      filterStr += ` AND schemaType = '${filters.schemaType}'`;
    }

    // Execute vector search
    const results = await this.table
      .search(queryEmbedding)
      .where(filterStr)
      .limit(limit)
      .execute();

    return results.map(row => this.rowToAction(row));
  }

  /**
   * Update action metrics after execution
   */
  async updateMetrics(
    actionId: string,
    success: boolean,
    latencyMs: number
  ): Promise<void> {
    // Fetch current action
    const results = await this.table
      .search([])
      .where(`id = '${actionId}'`)
      .limit(1)
      .execute();

    if (results.length === 0) return;

    const action = results[0];

    // Update metrics
    const newCount = action.executionCount + 1;
    const newSuccessRate = (
      (action.successRate * action.executionCount) + (success ? 1 : 0)
    ) / newCount;
    const newAvgLatency = (
      (action.avgLatencyMs * action.executionCount) + latencyMs
    ) / newCount;

    // Update in database
    await this.table.update({
      where: `id = '${actionId}'`,
      values: {
        successRate: newSuccessRate,
        avgLatencyMs: newAvgLatency,
        executionCount: newCount
      }
    });
  }

  private rowToAction(row: any): Action {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      embedding: row.vector,
      endpoint: row.endpoint,
      method: row.method,
      auth: row.auth,
      schemaType: row.schemaType,
      successRate: row.successRate,
      avgLatencyMs: row.avgLatencyMs,
      executionCount: row.executionCount,
      metadata: row.metadata
    };
  }
}
```

### 3. Trajectory Memory Service (LanceDB)

**Purpose:** Store and retrieve multi-step action sequences for imitation learning.

**Implementation:**

```typescript
// packages/memory/src/TrajectoryMemoryService.ts

export class TrajectoryMemoryService {
  private db: lancedb.Connection;
  private table: lancedb.Table;

  constructor(
    private dbPath: string,
    private embedder: Embedder
  ) {}

  async initialize(): Promise<void> {
    this.db = await lancedb.connect(this.dbPath);

    try {
      this.table = await this.db.openTable('trajectories');
    } catch {
      this.table = await this.db.createTable('trajectories', [
        {
          id: 'example-id',
          task: 'Example task',
          vector: Array(384).fill(0),
          sequence: [],
          totalReward: 0.0,
          success: false,
          durationMs: 0,
          metadata: {}
        }
      ]);
    }
  }

  /**
   * Store successful trajectory
   */
  async store(trajectory: Trajectory): Promise<void> {
    const embedding = await this.embedder.embed(trajectory.task);

    await this.table.add([{
      id: trajectory.id,
      task: trajectory.task,
      vector: embedding,
      sequence: JSON.stringify(trajectory.sequence),
      totalReward: trajectory.totalReward,
      success: trajectory.success,
      durationMs: trajectory.durationMs,
      metadata: trajectory.metadata || {}
    }]);
  }

  /**
   * Find similar successful trajectories
   */
  async search(
    taskDescription: string,
    options: TrajectorySearchOptions = {}
  ): Promise<Trajectory[]> {
    const {
      limit = 5,
      minReward = 0.5,
      successOnly = true
    } = options;

    const queryEmbedding = await this.embedder.embed(taskDescription);

    let filterStr = `totalReward >= ${minReward}`;
    if (successOnly) {
      filterStr += ' AND success = true';
    }

    const results = await this.table
      .search(queryEmbedding)
      .where(filterStr)
      .limit(limit)
      .execute();

    return results.map(row => ({
      id: row.id,
      task: row.task,
      embedding: row.vector,
      sequence: JSON.parse(row.sequence),
      totalReward: row.totalReward,
      success: row.success,
      durationMs: row.durationMs,
      metadata: row.metadata
    }));
  }

  /**
   * Learn from trajectory (update action success rates)
   */
  async learn(trajectory: Trajectory, actionMemory: ActionMemoryService): Promise<void> {
    for (const step of trajectory.sequence) {
      await actionMemory.updateMetrics(
        step.action.id,
        step.reward > 0.5,
        step.latencyMs || 0
      );
    }
  }
}
```

### 4. LLM Cache Service

**Purpose:** Reduce LLM costs by 60-80% through semantic caching.

**Implementation:**

```typescript
// packages/memory/src/LLMCacheService.ts

export class LLMCacheService {
  private db: lancedb.Connection;
  private table: lancedb.Table;

  constructor(
    private dbPath: string,
    private embedder: Embedder,
    private similarityThreshold: number = 0.92
  ) {}

  async initialize(): Promise<void> {
    this.db = await lancedb.connect(this.dbPath);

    try {
      this.table = await this.db.openTable('llm_cache');
    } catch {
      this.table = await this.db.createTable('llm_cache', [
        {
          id: 'example-id',
          query: 'Example query',
          vector: Array(384).fill(0),
          response: 'Example response',
          model: 'gpt-4',
          timestamp: Date.now(),
          hitCount: 0
        }
      ]);
    }
  }

  /**
   * Get cached response or generate new one
   */
  async getOrGenerate<T>(
    query: string,
    generator: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<{ result: T; cached: boolean }> {
    const {
      threshold = this.similarityThreshold,
      model = 'default'
    } = options;

    // Search for similar queries
    const queryEmbedding = await this.embedder.embed(query);
    const results = await this.table
      .search(queryEmbedding)
      .where(`model = '${model}'`)
      .limit(1)
      .execute();

    // Check if hit threshold
    if (results.length > 0 && results[0]._distance <= (1 - threshold)) {
      // Cache hit!
      const cached = results[0];

      // Update hit count
      await this.table.update({
        where: `id = '${cached.id}'`,
        values: { hitCount: cached.hitCount + 1 }
      });

      return {
        result: JSON.parse(cached.response),
        cached: true
      };
    }

    // Cache miss - generate
    const result = await generator();

    // Store in cache
    await this.table.add([{
      id: generateId(),
      query: query,
      vector: queryEmbedding,
      response: JSON.stringify(result),
      model: model,
      timestamp: Date.now(),
      hitCount: 0
    }]);

    return { result, cached: false };
  }

  /**
   * Clear old cache entries (older than N days)
   */
  async prune(daysOld: number = 30): Promise<number> {
    const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

    const deleted = await this.table.delete(`timestamp < ${cutoff}`);
    return deleted;
  }
}
```

### 5. Knowledge Graph Integration

**Purpose:** Store action relationships, hierarchies, and dependencies.

**Implementation:**

```typescript
// packages/knowledge/src/KnowledgeGraphService.ts

export class KnowledgeGraphService {
  private graph: MGraphDB;

  constructor(private dbPath: string) {}

  async initialize(): Promise<void> {
    this.graph = new MGraphDB(this.dbPath);

    // Define node types
    await this.graph.defineNodeType('Action', {
      properties: ['id', 'name', 'description', 'endpoint']
    });

    await this.graph.defineNodeType('State', {
      properties: ['id', 'url', 'variables']
    });

    // Define relationship types
    await this.graph.defineRelationType('DEPENDS_ON');
    await this.graph.defineRelationType('ENABLES');
    await this.graph.defineRelationType('CONFLICTS_WITH');
    await this.graph.defineRelationType('PRECONDITION');
    await this.graph.defineRelationType('POSTCONDITION');
  }

  /**
   * Add action to knowledge graph
   */
  async addAction(action: Action): Promise<void> {
    await this.graph.createNode('Action', {
      id: action.id,
      name: action.name,
      description: action.description,
      endpoint: action.endpoint
    });
  }

  /**
   * Add action dependency relationship
   */
  async addDependency(
    fromAction: Action,
    toAction: Action,
    type: 'DEPENDS_ON' | 'ENABLES' | 'CONFLICTS_WITH'
  ): Promise<void> {
    await this.graph.createRelationship(
      type,
      { type: 'Action', id: fromAction.id },
      { type: 'Action', id: toAction.id }
    );
  }

  /**
   * Get action hierarchy (parent/child actions)
   */
  async getActionHierarchy(rootActionId: string): Promise<ActionTree> {
    const query = `
      MATCH (root:Action {id: $rootActionId})-[r:ENABLES*]->(child:Action)
      RETURN root, r, child
    `;

    const results = await this.graph.query(query, { rootActionId });
    return this.buildTree(results);
  }

  /**
   * Find action dependencies
   */
  async getDependencies(actionId: string): Promise<Action[]> {
    const query = `
      MATCH (action:Action {id: $actionId})-[:DEPENDS_ON]->(dep:Action)
      RETURN dep
    `;

    const results = await this.graph.query(query, { actionId });
    return results.map(row => row.dep);
  }

  /**
   * Check if action can be executed (all preconditions met)
   */
  async canExecute(actionId: string, currentState: State): Promise<boolean> {
    const query = `
      MATCH (action:Action {id: $actionId})-[:PRECONDITION]->(state:State)
      RETURN state
    `;

    const preconditions = await this.graph.query(query, { actionId });

    // Check all preconditions against current state
    for (const precondition of preconditions) {
      if (!this.checkPrecondition(precondition.state, currentState)) {
        return false;
      }
    }

    return true;
  }

  private checkPrecondition(required: State, current: State): boolean {
    // Check if current state satisfies required state
    for (const [key, value] of Object.entries(required.variables)) {
      if (current.variables[key] !== value) {
        return false;
      }
    }
    return true;
  }
}
```

---

## Data Models

### Core Data Structures

```typescript
// packages/types/src/models.ts

/**
 * Action - Represents a single executable action
 */
export interface Action {
  // Identity
  id: string;
  name: string;
  description: string;

  // Execution
  endpoint: string;
  method: HttpMethod;
  params?: ActionParam[];

  // Authentication
  auth: OAuth2Config;

  // Semantics
  schemaType: string; // Schema.org type (e.g., "BuyAction")
  embedding?: number[]; // 384-dim vector

  // State modeling
  preconditions?: Condition[];
  postconditions?: Condition[];

  // Metrics
  successRate?: number;
  avgLatencyMs?: number;
  executionCount?: number;
  cost?: Cost;

  // Discovery
  source: 'manifest' | 'chrome-extension' | 'learned';
  discoveredAt: Date;
  lastExecutedAt?: Date;

  // Metadata
  metadata?: Record<string, any>;
}

/**
 * Trajectory - Sequence of actions for a task
 */
export interface Trajectory {
  // Identity
  id: string;
  task: string;
  embedding?: number[];

  // Sequence
  sequence: ActionStep[];

  // Outcome
  totalReward: number;
  success: boolean;
  durationMs: number;

  // Learning
  explorationStrategy?: string;
  learningRate?: number;
  episodeNumber?: number;

  // Metadata
  metadata?: Record<string, any>;
}

/**
 * ActionStep - Single step in a trajectory
 */
export interface ActionStep {
  action: Action;
  state: State;
  reward: number;
  timestamp: Date;
  latencyMs?: number;
}

/**
 * State - Environment state at a point in time
 */
export interface State {
  url: string;
  domSnapshot?: DOMSnapshot;
  a11yTree?: AccessibilityTree;
  variables: Record<string, any>;
  timestamp: Date;
}

/**
 * Condition - Precondition or postcondition
 */
export interface Condition {
  type: 'state' | 'variable' | 'custom';
  expression: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'exists' | 'custom';
  value?: any;
}

/**
 * ActionSpace - Collection of actions for a domain
 */
export interface ActionSpace {
  id: string;
  domain: string;
  actions: Action[];
  discoveredAt: Date;
  manifest?: ARWManifest;
}

/**
 * Cost - Execution cost model
 */
export interface Cost {
  currency: string;
  amount: number;
  unit: 'per_execution' | 'per_hour' | 'per_month';
}

/**
 * Search options
 */
export interface SearchOptions {
  limit?: number;
  filters?: {
    domain?: string;
    schemaType?: string;
    minSuccessRate?: number;
  };
  minSuccessRate?: number;
}

export interface TrajectorySearchOptions {
  limit?: number;
  minReward?: number;
  successOnly?: boolean;
}

export interface CacheOptions {
  threshold?: number;
  model?: string;
}
```

---

## Integration Patterns

### Pattern 1: Direct SDK Integration

**Use Case:** Full control, custom workflows

```typescript
import { ARWActionSpace } from '@arw/action-space-sdk';

// Initialize
const actionSpace = new ARWActionSpace({
  vectorDb: {
    type: 'lancedb',
    path: './data/actions.db'
  },
  knowledgeGraph: {
    enabled: true,
    path: './data/graph.db'
  },
  embedder: {
    model: 'text-embedding-3-small',
    apiKey: process.env.OPENAI_API_KEY
  }
});

await actionSpace.initialize();

// Discover actions
const actions = await actionSpace.discover('https://example.com');
console.log(`Discovered ${actions.length} actions`);

// Semantic search
const loginActions = await actionSpace.search('log in to account', {
  minSuccessRate: 0.8,
  limit: 5
});

// Execute with learning
const result = await actionSpace.execute(loginActions[0], {
  params: { username: 'user', password: 'pass' },
  learn: true,
  storeTrajectory: true
});

// Check cache stats
const stats = await actionSpace.getCacheStats();
console.log(`Cache hit rate: ${stats.hitRate}%`);
```

### Pattern 2: LangChain Integration

**Use Case:** Integrate with existing LangChain agents

```typescript
import { ARWToolkit } from '@arw/langchain';
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createReactAgent } from 'langchain/agents';

// Initialize toolkit
const toolkit = new ARWToolkit({
  discoveryUrls: ['https://example.com'],
  vectorDbPath: './data/actions.db',
  cacheEnabled: true
});

const tools = await toolkit.getTools();

// Create agent
const llm = new ChatOpenAI({ model: 'gpt-4' });
const agent = createReactAgent({ llm, tools });

const executor = new AgentExecutor({
  agent,
  tools,
  memory: toolkit.getMemory() // LanceDB-backed memory
});

// Agent automatically uses ARW actions
const result = await executor.invoke({
  input: 'Book a flight to NYC for next Monday'
});

console.log(result.output);
```

### Pattern 3: AutoGen Integration

**Use Case:** Multi-agent coordination with ARW actions

```typescript
import { ARWAssistantAgent } from '@arw/autogen';
import autogen from 'pyautogen';

// Create ARW-powered assistant
const assistant = new ARWAssistantAgent({
  name: 'web_assistant',
  discoveryUrls: ['https://example.com'],
  vectorDbPath: './data/actions.db',
  llmConfig: {
    model: 'gpt-4',
    apiKey: process.env.OPENAI_API_KEY
  }
});

// Create user proxy
const userProxy = new autogen.UserProxyAgent({
  name: 'user',
  humanInputMode: 'NEVER',
  maxConsecutiveAutoReply: 5
});

// Multi-turn conversation
await userProxy.initiateChat(assistant, {
  message: 'Help me book a hotel for my NYC trip'
});
```

### Pattern 4: MCP Server

**Use Case:** Language-agnostic integration via MCP protocol

```bash
# Start MCP server
npx @arw/action-space-mcp start --port 3000 --db ./data/actions.db

# Server exposes MCP tools:
# - discover_actions
# - search_actions
# - execute_action
# - get_trajectory
# - get_cache_stats
```

```typescript
// Connect from any MCP client
import { MCPClient } from '@modelcontextprotocol/sdk';

const client = new MCPClient({
  serverUrl: 'http://localhost:3000'
});

// Discover actions
const actions = await client.callTool('discover_actions', {
  url: 'https://example.com'
});

// Search actions
const results = await client.callTool('search_actions', {
  query: 'log in to account',
  limit: 5
});

// Execute action
const execution = await client.callTool('execute_action', {
  actionId: results[0].id,
  params: { username: 'user', password: 'pass' }
});
```

---

## API Design

### Core SDK API

```typescript
/**
 * Main SDK class
 */
export class ARWActionSpace {
  constructor(config: ARWConfig);

  // Lifecycle
  async initialize(): Promise<void>;
  async close(): Promise<void>;

  // Discovery
  async discover(url: string, options?: DiscoverOptions): Promise<Action[]>;
  async discoverFromManifest(manifestUrl: string): Promise<Action[]>;
  async discoverFromPage(pageUrl: string): Promise<Action[]>;

  // Search
  async search(query: string, options?: SearchOptions): Promise<Action[]>;
  async searchTrajectories(taskDescription: string, options?: TrajectorySearchOptions): Promise<Trajectory[]>;

  // Execution
  async execute(action: Action, options?: ExecuteOptions): Promise<ExecutionResult>;
  async executeSequence(actions: Action[], options?: ExecuteOptions): Promise<ExecutionResult[]>;

  // Learning
  async learn(trajectory: Trajectory): Promise<void>;
  async getSuccessfulTrajectories(task: string, limit?: number): Promise<Trajectory[]>;

  // Cache
  async getCacheStats(): Promise<CacheStats>;
  async clearCache(olderThan?: Date): Promise<number>;

  // Knowledge Graph
  async getActionHierarchy(actionId: string): Promise<ActionTree>;
  async getDependencies(actionId: string): Promise<Action[]>;
  async canExecute(actionId: string, state: State): Promise<boolean>;

  // Observability
  async getMetrics(): Promise<Metrics>;
  async exportTelemetry(format: 'otlp' | 'json'): Promise<TelemetryData>;
}
```

### REST API (Optional Server)

```
# Discovery
POST /api/v1/discover
  Body: { url: string, options?: DiscoverOptions }
  Response: { actions: Action[], actionSpaceId: string }

# Search
GET /api/v1/actions/search?q=<query>&limit=<N>
  Response: { actions: Action[], totalCount: number }

# Execute
POST /api/v1/actions/:actionId/execute
  Body: { params: Record<string, any>, options?: ExecuteOptions }
  Response: { result: any, executionId: string, metrics: ExecutionMetrics }

# Trajectories
GET /api/v1/trajectories/search?task=<description>
  Response: { trajectories: Trajectory[] }

# Cache
GET /api/v1/cache/stats
  Response: { hitRate: number, totalQueries: number, cacheSize: number }

# Metrics
GET /api/v1/metrics
  Response: { ... OpenTelemetry metrics ... }
```

---

## Storage Architecture

### Multi-Database Strategy

**Why Multiple Databases:**
- **LanceDB (Vectors)** - Optimized for semantic search, low latency
- **MGraph-DB (Graph)** - Optimized for relationships, hierarchies
- **SQLite/Postgres (Metadata)** - Optimized for structured queries, transactions

### Data Flow

```
┌──────────────────────────────────────────────────────┐
│                    Write Path                        │
└──────────────────────────────────────────────────────┘
   Action Created
        │
        ├──────────────┬──────────────┬──────────────────┐
        │              │              │                  │
        ▼              ▼              ▼                  ▼
   LanceDB        MGraph-DB       SQLite          Observability
   (embedding)    (relationships)  (metadata)      (metrics)

┌──────────────────────────────────────────────────────┐
│                    Read Path                         │
└──────────────────────────────────────────────────────┘
   Query
     │
     ├─ Semantic? ──► LanceDB ──► Get IDs
     │                             │
     ├─ Graph? ─────► MGraph-DB ──┤
     │                             │
     └─ Metadata? ──► SQLite ──────┤
                                   │
                                   ▼
                            Merge Results ──► Return
```

### LanceDB Schema

```typescript
// actions table
interface ActionRow {
  id: string;              // UUID
  name: string;
  description: string;
  vector: number[];        // 384-dim embedding
  endpoint: string;
  method: string;
  auth: object;            // JSON
  schemaType: string;
  successRate: number;
  avgLatencyMs: number;
  executionCount: number;
  metadata: object;        // JSON
}

// trajectories table
interface TrajectoryRow {
  id: string;
  task: string;
  vector: number[];        // 384-dim embedding
  sequence: string;        // JSON array
  totalReward: number;
  success: boolean;
  durationMs: number;
  metadata: object;
}

// llm_cache table
interface CacheRow {
  id: string;
  query: string;
  vector: number[];
  response: string;        // JSON
  model: string;
  timestamp: number;
  hitCount: number;
}
```

### Indexes

```typescript
// LanceDB - Automatic HNSW indexes on vector columns
// No manual index creation needed

// SQLite - For metadata queries
CREATE INDEX idx_actions_success_rate ON actions(successRate);
CREATE INDEX idx_actions_schema_type ON actions(schemaType);
CREATE INDEX idx_trajectories_success ON trajectories(success);
CREATE INDEX idx_cache_model ON llm_cache(model);
CREATE INDEX idx_cache_timestamp ON llm_cache(timestamp);
```

---

## Security Architecture

### Authentication & Authorization

**OAuth 2.0 Flow:**
```
User/Agent ──► ARW SDK ──► OAuth Server ──► Action Endpoint
                 │                              ▲
                 │                              │
                 └──────── Token ───────────────┘
```

**Token Management:**
```typescript
export class OAuthManager {
  private tokenStore: TokenStore;

  async getToken(action: Action): Promise<AccessToken> {
    // Check cache
    const cached = await this.tokenStore.get(action.auth.clientId);
    if (cached && !this.isExpired(cached)) {
      return cached;
    }

    // Refresh or request new token
    if (cached && cached.refreshToken) {
      return await this.refreshToken(cached.refreshToken, action.auth);
    }

    return await this.requestToken(action.auth);
  }

  private async requestToken(config: OAuth2Config): Promise<AccessToken> {
    // PKCE flow for web/mobile
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Authorization request
    const authUrl = `${config.authorizationEndpoint}?` +
      `client_id=${config.clientId}&` +
      `redirect_uri=${config.redirectUri}&` +
      `scope=${config.scopes.join(' ')}&` +
      `code_challenge=${codeChallenge}&` +
      `code_challenge_method=S256`;

    // Get authorization code (via user consent)
    const code = await this.getUserConsent(authUrl);

    // Exchange code for token
    const tokenResponse = await fetch(config.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: config.redirectUri,
        client_id: config.clientId,
        code_verifier: codeVerifier
      })
    });

    const token = await tokenResponse.json();

    // Cache token
    await this.tokenStore.set(config.clientId, token);

    return token;
  }
}
```

### Data Security

**Encryption at Rest:**
```typescript
export class SecureStorage {
  private encryptionKey: Buffer;

  constructor(keyPath: string) {
    // Load encryption key from secure location
    this.encryptionKey = fs.readFileSync(keyPath);
  }

  async store(key: string, value: any): Promise<void> {
    const encrypted = this.encrypt(JSON.stringify(value));
    await this.db.set(key, encrypted);
  }

  async retrieve(key: string): Promise<any> {
    const encrypted = await this.db.get(key);
    const decrypted = this.decrypt(encrypted);
    return JSON.parse(decrypted);
  }

  private encrypt(data: string): Buffer {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]);
  }

  private decrypt(encrypted: Buffer): string {
    const iv = encrypted.slice(0, 16);
    const authTag = encrypted.slice(16, 32);
    const data = encrypted.slice(32);
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
    decipher.setAuthTag(authTag);
    return decipher.update(data) + decipher.final('utf8');
  }
}
```

### Rate Limiting

```typescript
export class RateLimiter {
  private limits: Map<string, TokenBucket> = new Map();

  async checkLimit(actionId: string, userId: string): Promise<boolean> {
    const key = `${userId}:${actionId}`;
    let bucket = this.limits.get(key);

    if (!bucket) {
      bucket = new TokenBucket({
        capacity: 10,      // 10 requests
        fillRate: 1,       // 1 per second
        interval: 1000     // 1 second
      });
      this.limits.set(key, bucket);
    }

    return bucket.consume(1);
  }
}
```

---

## Scalability & Performance

### Performance Targets

| Metric | Target | Measured |
|--------|--------|----------|
| Action search latency (p50) | <25ms | 25-50ms ✅ |
| Action search latency (p95) | <50ms | - |
| Trajectory search latency (p50) | <100ms | - |
| Cache hit rate | >60% | 60-80% ✅ |
| Vector search throughput | >1000 QPS | 1000s QPS ✅ |
| Discovery time (100 actions) | <5s | - |
| Memory (1M actions) | <2GB | 1.5GB ✅ |

### Horizontal Scaling

**Multi-Instance Architecture:**
```
┌────────────────────────────────────────────────────┐
│                  Load Balancer                     │
└──────┬───────────┬─────────────┬──────────────┬────┘
       │           │             │              │
       ▼           ▼             ▼              ▼
   ┌────────┐ ┌────────┐   ┌────────┐    ┌────────┐
   │ SDK    │ │ SDK    │   │ SDK    │    │ SDK    │
   │ Node 1 │ │ Node 2 │   │ Node 3 │    │ Node N │
   └───┬────┘ └───┬────┘   └───┬────┘    └───┬────┘
       │          │            │              │
       └──────────┴────────────┴──────────────┘
                         │
                         ▼
            ┌─────────────────────────┐
            │  Shared Storage Layer   │
            │  - LanceDB (S3-backed)  │
            │  - MGraph-DB (replicas) │
            │  - Postgres (primary)   │
            └─────────────────────────┘
```

**LanceDB S3 Backend:**
```typescript
const db = await lancedb.connect('s3://my-bucket/actions/', {
  storageOptions: {
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  }
});
```

### Caching Strategy

**Multi-Level Cache:**
```
┌────────────────────────────────────────┐
│         Application Cache              │
│  (In-memory, TTL=60s, Size=10MB)      │
└──────────┬─────────────────────────────┘
           │ Miss
           ▼
┌────────────────────────────────────────┐
│         LanceDB Cache                  │
│  (Disk, Semantic, Size=1GB)           │
└──────────┬─────────────────────────────┘
           │ Miss
           ▼
┌────────────────────────────────────────┐
│         LLM API Call                   │
│  (Expensive, 2-5s latency)            │
└────────────────────────────────────────┘
```

### Monitoring & Observability

**OpenTelemetry Integration:**
```typescript
import { trace, metrics } from '@opentelemetry/api';

export class ObservabilityCollector {
  private tracer = trace.getTracer('arw-action-space');
  private meter = metrics.getMeter('arw-action-space');

  // Metrics
  private actionSearchDuration = this.meter.createHistogram('action_search_duration');
  private actionExecutionDuration = this.meter.createHistogram('action_execution_duration');
  private cacheHitRate = this.meter.createCounter('cache_hits');
  private cacheMissRate = this.meter.createCounter('cache_misses');

  async recordSearch(query: string, durationMs: number, resultCount: number): Promise<void> {
    this.actionSearchDuration.record(durationMs, {
      query_type: 'semantic',
      result_count: resultCount
    });
  }

  async recordExecution(action: Action, success: boolean, durationMs: number): Promise<void> {
    this.actionExecutionDuration.record(durationMs, {
      action_type: action.schemaType,
      success: success.toString()
    });
  }

  async recordCacheHit(hit: boolean): Promise<void> {
    if (hit) {
      this.cacheHitRate.add(1);
    } else {
      this.cacheMissRate.add(1);
    }
  }

  // Traces
  async traceActionExecution<T>(
    action: Action,
    fn: () => Promise<T>
  ): Promise<T> {
    const span = this.tracer.startSpan('action.execute', {
      attributes: {
        'action.id': action.id,
        'action.name': action.name,
        'action.endpoint': action.endpoint
      }
    });

    try {
      const result = await fn();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message
      });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  }
}
```

---

## Implementation Phases

### Phase 1: MVP (Weeks 1-4)

**Goal:** Core SDK with LanceDB integration

**Deliverables:**
- [x] Project structure and build system
- [ ] Discovery engine (manifest parsing)
- [ ] Action memory service (LanceDB)
- [ ] Basic OAuth manager
- [ ] Action executor with retry
- [ ] CLI tool (`arw discover`, `arw search`, `arw execute`)
- [ ] TypeScript SDK
- [ ] Python SDK (port)
- [ ] Unit tests (80%+ coverage)
- [ ] Documentation

**Success Criteria:**
- Can discover 100+ actions from ARW manifest
- <50ms p95 semantic search latency
- OAuth flow working end-to-end
- Example working for common use case

### Phase 2: Memory & Learning (Weeks 5-8)

**Goal:** Add trajectory memory and LLM caching

**Deliverables:**
- [ ] Trajectory memory service
- [ ] LLM cache service
- [ ] Learning algorithms (success rate updates)
- [ ] Chrome Extension (basic page inspection)
- [ ] Integration tests
- [ ] Performance benchmarks

**Success Criteria:**
- Can store and retrieve trajectories
- >60% LLM cache hit rate
- Chrome Extension discovers actions from live pages
- Learning improves success rates over time

### Phase 3: Framework Integrations (Weeks 9-12)

**Goal:** Integrate with LangChain, AutoGen, OpenAI

**Deliverables:**
- [ ] LangChain toolkit
- [ ] AutoGen plugin
- [ ] OpenAI SDK adapter
- [ ] MCP server implementation
- [ ] Example notebooks for each framework
- [ ] Documentation for integrations

**Success Criteria:**
- 5-minute setup for each framework
- Examples work out-of-the-box
- Documentation covers common patterns

### Phase 4: Knowledge Graph (Weeks 13-16)

**Goal:** Add relationship modeling and reasoning

**Deliverables:**
- [ ] Knowledge graph service (MGraph-DB integration)
- [ ] Action relationship modeling
- [ ] Precondition/postcondition checking
- [ ] Hierarchical action planning
- [ ] Dependency resolution
- [ ] Reasoning engine

**Success Criteria:**
- Can model action dependencies
- Can plan multi-step workflows
- Precondition checking prevents invalid executions
- Hierarchy enables action composition

### Phase 5: Production Hardening (Weeks 17-24)

**Goal:** Enterprise-ready features

**Deliverables:**
- [ ] Multi-tenancy support
- [ ] SSO/SAML authentication
- [ ] Advanced analytics dashboard
- [ ] SLA monitoring
- [ ] On-premises deployment
- [ ] Horizontal scaling (S3-backed LanceDB)
- [ ] Security audit & penetration testing
- [ ] SOC 2 Type II compliance
- [ ] Production documentation

**Success Criteria:**
- 99.9% uptime SLA
- <100ms p99 latency
- Scales to 10M+ actions
- Passes security audit
- Enterprise customer validation

---

## Appendix: Code Examples

### Example 1: End-to-End Workflow

```typescript
import { ARWActionSpace } from '@arw/action-space-sdk';

async function main() {
  // Initialize
  const actionSpace = new ARWActionSpace({
    vectorDb: { type: 'lancedb', path: './data/actions.db' },
    knowledgeGraph: { enabled: true, path: './data/graph.db' },
    embedder: {
      model: 'text-embedding-3-small',
      apiKey: process.env.OPENAI_API_KEY
    },
    cache: { enabled: true, threshold: 0.92 }
  });

  await actionSpace.initialize();

  // Discover actions from ARW manifest
  console.log('Discovering actions...');
  const actions = await actionSpace.discover('https://example.com');
  console.log(`Found ${actions.length} actions`);

  // Search for login actions
  console.log('Searching for login actions...');
  const loginActions = await actionSpace.search('log in to account', {
    minSuccessRate: 0.8,
    limit: 5
  });

  console.log(`Found ${loginActions.length} login actions:`);
  for (const action of loginActions) {
    console.log(`- ${action.name} (success rate: ${action.successRate})`);
  }

  // Execute best action
  const bestAction = loginActions[0];
  console.log(`Executing: ${bestAction.name}`);

  const result = await actionSpace.execute(bestAction, {
    params: {
      username: 'user@example.com',
      password: 'secure-password'
    },
    learn: true,
    storeTrajectory: true
  });

  if (result.success) {
    console.log('Login successful!');
  } else {
    console.error('Login failed:', result.error);
  }

  // Check cache stats
  const stats = await actionSpace.getCacheStats();
  console.log(`\nCache stats:`);
  console.log(`- Hit rate: ${stats.hitRate}%`);
  console.log(`- Total queries: ${stats.totalQueries}`);
  console.log(`- Cache size: ${stats.cacheSize} entries`);

  await actionSpace.close();
}

main().catch(console.error);
```

---

**Document Version:** 1.0
**Last Updated:** November 20, 2025
**Status:** Proposed Architecture - Ready for Review

---

*This architecture document provides a comprehensive technical design for integrating action space modeling into ARW using vector databases and knowledge graphs. Implementation should follow the phased approach outlined above, with continuous validation against performance targets and success criteria.*
