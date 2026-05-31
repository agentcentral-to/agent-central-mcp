# agentcentral MCP install notes for AI agents

agentcentral is a hosted remote MCP server for Amazon sellers. Do not try to run this repository as the production service. This repo is a public registry/schema facade and a local stdio introspection stub.

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
2. Connect Amazon Ads and Seller Central with Amazon OAuth.
3. Create a scoped API key in the agentcentral dashboard.
4. Add the endpoint and Authorization header to Claude, ChatGPT, Cursor, Claude Code, OpenClaw, Cline, or another HTTP-capable MCP client.

Canonical product page: https://agentcentral.to/amazon-seller-central-mcp

Setup guide: https://agentcentral.to/amazon-seller-central-mcp-claude

## Local setup: introspection only

The local server in this repo is only for directory and client introspection. It lists the public tool catalog but does not execute live Amazon data tools. Tool calls return a pointer to the hosted endpoint and setup guide.

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

## What agentcentral exposes

The hosted production endpoint exposes 141 domain-scoped Amazon seller data tools and 145 hosted production tools total across Amazon Ads, Seller Central inventory, orders, catalog, rankings, finance, fulfillment, and guarded write operations.

agentcentral returns factual seller data, source fields, deterministic metrics, classifications, and audited write results. It is not a recommendation engine.
