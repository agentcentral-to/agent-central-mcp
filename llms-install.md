# Agent Central MCP install notes for AI agents

Agent Central connects the AI you already use to your Amazon Seller Central account. It is a hosted remote MCP server for Amazon sellers. Do not try to run this repository as the production service: it holds public registry metadata and a local stdio introspection stub, and it is not published as an npm package.

## Preferred setup: hosted remote MCP

Use the hosted Streamable HTTP endpoint:

```json
{
  "mcpServers": {
    "agentcentral": {
      "url": "https://mcp.agentcentral.to/mcp",
      "headers": {
        "Authorization": "Bearer ac_live_<YOUR_API_KEY>"
      }
    }
  }
}
```

To get an API key:

1. Sign up at https://agentcentral.to/signup.
2. Connect Seller Central and Amazon Ads through Amazon's own authorization pages.
3. Create a scoped API key in the Agent Central dashboard. Keep it read-only unless the workflow needs changes.
4. Add the endpoint and Authorization header to Claude Code, Cursor, OpenClaw, Cline, or another HTTP-capable MCP client. Claude custom connectors and ChatGPT apps use the key's Connector URL instead.

Never ask the user to paste an API key or Connector URL into a public place.

Setup guides:

- Claude: https://agentcentral.to/docs/quickstart/claude
- Claude Code: https://agentcentral.to/connect-amazon-seller-central-to-claude-code
- ChatGPT: https://agentcentral.to/docs/quickstart/chatgpt

## Local setup: introspection only

The local server in this repo is only for directory and client introspection. It lists the hosted public tool catalog plus one setup helper, but does not execute live Amazon data tools. Tool calls return a pointer to the hosted endpoint and setup guide.

```bash
npm install
npm run build
node dist/index.js
```

Docker alternative:

```bash
docker build -t agentcentral-mcp .
docker run --rm -i agentcentral-mcp
```

## What Agent Central exposes

The hosted endpoint exposes 177 domain-scoped tools and 182 tools in total across Amazon Ads (Sponsored Products, Sponsored Brands, Sponsored Display, DSP, and Stores), Seller Central inventory and orders, catalog, finance, and fulfillment, in 23 Amazon marketplaces. Change tools preview by default and log every submitted change.

Agent Central returns factual seller data, source fields, deterministic metrics, classifications, and audited write results. It is not a recommendation engine.
