# ARW Inspector

Visual explorer for Agent-Ready Web capabilities. A companion tool to `arw serve` that provides a browser-based interface for inspecting ARW implementations.

## Overview

The ARW Inspector is a web application that lets you visually explore and validate ARW implementations on any website. It discovers capabilities, fetches machine views, identifies content chunks, and displays usage policies.

## Features

### Discovery & Analysis

- **Automatic Discovery** - Fetches and parses `llms.txt` from any URL
- **Content Catalog** - Lists all content entries with metadata and priorities
- **Machine Views** - Side-by-side display of raw Markdown and rendered preview
- **ARW vs HTML Comparison** - Side-by-side comparison showing size, tokens, and savings
- **Cost Analysis** - Token cost comparison across 15+ AI models from major providers
- **Content Chunks** - Identifies and highlights addressable content segments
- **Actions** - Shows OAuth-protected operations with auth requirements
- **Policies** - Displays usage policies for training, inference, and attribution
- **Protocol Support** - Lists MCP, ACP, A2A, and other protocol endpoints

### Visual Interface

- **Tabbed Navigation** - Easy access to different aspects of ARW implementation
- **Syntax Highlighting** - Clear display of YAML and Markdown content
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Error Reporting** - Clear warnings and errors for invalid implementations

## Getting Started

### Installation

```bash
cd examples/arw-inspector
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

Visit http://localhost:3003 to use the inspector.

### Building

```bash
npm run build
```

The built application will be in the `dist/` directory.

## Usage

### Basic Inspection

1. Enter a URL in the input field (e.g., `http://localhost:3000`)
2. Click "Inspect" or press Enter
3. Browse the discovered ARW capabilities using the tabs

### Example Targets

The inspector works with any ARW-enabled website:

- **Basic Blog Example**: `http://localhost:3000` (run `basic-blog` example)
- **ARW Website**: `https://arw.dev`
- **ACP Prototype**: `http://localhost:5173` (run `arw-acp-prototype` example)

### Tabs

#### Overview

- Site information and metadata
- Capability summary (content, actions, protocols, machine views)
- Policy summary with quick status indicators
- Protocol support listing

#### Content

- All content entries from `llms.txt`
- URLs, descriptions, purposes, and priorities
- Links to machine views
- Metadata display

#### Actions

- OAuth-protected actions
- HTTP methods and endpoints
- Authentication requirements and scopes
- Request schemas

#### Policies

- Training and inference permissions
- Attribution requirements
- Rate limits and restrictions
- Policy explanation

#### Machine Views

- Raw Markdown source
- Rendered preview
- Content chunks identification
- **ARW vs HTML Comparison**:
  - Side-by-side metrics (size, lines, tokens, chunks)
  - Token reduction percentage and absolute savings
  - File size comparison
- **Token Cost Comparison**:
  - Cost analysis for 15+ AI models
  - Filter by provider (Anthropic, OpenAI, Google, Meta, xAI, Mistral, Perplexity)
  - Filter by category (Flagship, Fast, Premium)
  - Per-request cost savings visualization
  - Sortable cost comparison table

## Technical Details

### Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **js-yaml** - YAML parsing
- **react-markdown** - Markdown rendering

### Architecture

The inspector uses a simple fetch-based approach:

1. **Discovery**: Fetches `llms.txt` from target URL
2. **Parsing**: Parses YAML using js-yaml
3. **Machine Views**: Fetches referenced `.llm.md` files
4. **Analysis**: Extracts chunks, validates structure
5. **Display**: Renders results in tabbed interface

### CORS Considerations

The inspector requires CORS to be enabled on the target server. For local development:

- Use `arw serve` which enables CORS automatically
- Or run your server with CORS headers:
  ```
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, OPTIONS
  ```

**⚠️ Security Warning: Third-Party CORS Proxy**

The inspector currently uses a public CORS proxy (allorigins.win) as a fallback when direct fetches fail due to CORS restrictions. While this enables cross-origin inspection, it comes with important security and privacy considerations:

- **Privacy Risk**: All URLs you inspect pass through the third-party proxy service
- **Data Exposure**: The proxy operator can potentially log or inspect the content being fetched
- **No Content Validation**: There's no guarantee the proxy returns unmodified content
- **Service Availability**: The proxy is an external dependency that may become unavailable

**For production use, we strongly recommend:**

1. **Self-host a CORS proxy**: Deploy your own proxy service that you control
2. **Configure custom proxy URL**: Set an environment variable to point to your proxy
3. **Limit to trusted domains**: Only inspect URLs you control or trust
4. **Use direct fetch when possible**: Enable CORS on your own servers to avoid proxy usage entirely

For local development and testing public ARW implementations, the proxy fallback is acceptable, but users should be aware of these limitations.

### Proxy Configuration

For production deployments, you may want to proxy requests through your backend to avoid CORS issues. The Vite config includes an example proxy setup:

```typescript
server: {
  proxy: {
    '/api-proxy': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api-proxy/, '')
    }
  }
}
```

## Integration with `arw serve`

The ARW Inspector is designed to complement the `arw serve` command from the ARW CLI:

### Standalone Mode

Run the inspector independently:

```bash
cd examples/arw-inspector
npm run dev
```

Then point it at any URL running `arw serve`:

```bash
# In another terminal
cd your-arw-project
arw serve --port 3000

# Inspector connects to http://localhost:3000
```

### Future Integration

Planned features for tighter integration:

- **Embedded Mode**: `arw serve --inspect` to launch both server and inspector
- **Live Reload**: Auto-refresh when ARW files change
- **Validation**: Real-time validation as you edit ARW files
- **Testing**: Simulate agent requests and responses

### Token Cost Dataset

The inspector includes a comprehensive dataset of AI model pricing from major providers. Token costs are stored in `src/data/token-costs.json` and include:

- 15+ models across 7 providers
- Input and output token pricing
- Context window sizes
- Model categories (flagship, fast, premium)

**Maintaining Pricing Data:**

Token costs should be updated quarterly or when providers announce pricing changes. See [TOKEN_COSTS_GUIDE.md](./TOKEN_COSTS_GUIDE.md) for detailed instructions on:

- How to update pricing
- Adding new models or providers
- Testing updates
- Dataset structure and validation

**Current Providers:**

- Anthropic (Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus)
- OpenAI (GPT-4o, GPT-4o mini, GPT-4 Turbo)
- Google (Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini 2.0 Flash)
- Meta (Llama 3.3 70B, Llama 3.1 8B via Groq)
- xAI (Grok Beta)
- Mistral (Mistral Large, Mistral Small)
- Perplexity (Sonar)

**Note:** Token estimates use a conservative approximation of ~4 characters per token. Actual token counts vary by model tokenizer.

## Development

### Project Structure

```
arw-inspector/
├── src/
│   ├── components/       # React components
│   │   ├── Inspector.tsx      # Main inspector container
│   │   ├── Overview.tsx       # Site overview panel
│   │   ├── ContentPanel.tsx   # Content catalog
│   │   ├── ActionsPanel.tsx   # Actions display
│   │   ├── PoliciesPanel.tsx  # Policies display
│   │   ├── MachineViewPanel.tsx # Machine view viewer
│   │   ├── UrlInput.tsx       # URL input form
│   │   └── LoadingSpinner.tsx # Loading indicator
│   ├── utils/           # Utility functions
│   │   └── inspector.ts       # ARW inspection logic
│   ├── types.ts         # TypeScript types
│   ├── App.tsx          # Root component
│   ├── App.css          # App styles
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript config
└── package.json         # Dependencies

```

### Adding Features

To add a new inspection feature:

1. Update `types.ts` with new data structures
2. Modify `utils/inspector.ts` to fetch/parse new data
3. Create or update panel component to display data
4. Add tab in `Inspector.tsx` if needed

### Testing

Test the inspector against example implementations:

```bash
# Terminal 1: Run basic blog example
cd examples/basic-blog
npm run dev

# Terminal 2: Run inspector
cd examples/arw-inspector
npm run dev

# Browser: Inspect http://localhost:3000
```

## Use Cases

### Publishers

- **Validate Implementation**: Ensure llms.txt is correct
- **Preview Machine Views**: See how agents will see your content
- **Test Policies**: Verify policy declarations are accurate

### Developers

- **Debug ARW Files**: Quickly identify syntax errors
- **Compare Implementations**: Inspect different ARW approaches
- **Learn by Example**: Explore real ARW implementations

### AI Agent Developers

- **Discover Capabilities**: See what actions and content are available
- **Test Discovery**: Verify your agent's discovery logic
- **Understand Policies**: Know how to respect publisher terms

## Roadmap

- [ ] **Agent Simulation**: Simulate how different agents discover/use the site
- [ ] **Validation**: Comprehensive ARW spec compliance checking
- [ ] **Comparison**: Side-by-side comparison of multiple implementations
- [ ] **Export**: Generate reports or documentation from inspection
- [ ] **Browser Extension**: Inspect any page directly from browser
- [ ] **CLI Mode**: Headless inspection for CI/CD pipelines

## License

MIT License - see [LICENSE](../../LICENSE) for details.

---

**Part of the [Agent-Ready Web](https://arw.dev) specification**
