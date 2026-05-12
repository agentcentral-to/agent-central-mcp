# agentcentral MCP

agentcentral is a hosted Amazon Seller Central MCP server and Amazon Ads MCP server for Amazon sellers using Claude, ChatGPT, and other AI clients.

It provides an Amazon seller data layer that connects AI clients to Amazon Ads, Seller Central, inventory, orders, catalog, rankings, finance, and fulfillment data through a remote Streamable HTTP MCP endpoint.

> This repository contains the registry metadata (`server.json`, `glama.json`) and a thin stdio introspection stub (`src/index.ts`, `Dockerfile`). The 97 tools are only callable through the hosted endpoint at `https://mcp.agentcentral.to/mcp`. The stdio package is published so MCP directories and clients can introspect the tool catalog without an account.

## Endpoint

```json
{
  "mcpServers": {
    "agent-central": {
      "url": "https://mcp.agentcentral.to/mcp",
      "headers": {
        "Authorization": "Bearer ac_live_<YOUR_API_KEY>"
      }
    }
  }
}
```

Claude custom connectors use a signed connector URL generated in the agentcentral dashboard.

## Setup

1. Create an agentcentral account at https://agentcentral.to/signup.
2. Connect Amazon Ads and Seller Central through Amazon OAuth.
3. Create a scoped API key or signed Claude connector URL.
4. Add the MCP endpoint to Claude, ChatGPT, Cursor, OpenClaw, or another remote-MCP-capable client.

Full setup guide: https://agentcentral.to/amazon-seller-central-mcp-claude

## Discovery URLs

- Amazon Seller Central MCP: https://agentcentral.to/amazon-seller-central-mcp
- Amazon Ads MCP server: https://agentcentral.to/amazon-ads-mcp-server
- Amazon seller data layer: https://agentcentral.to/amazon-seller-data-layer
- Amazon MCP server for Claude: https://agentcentral.to/amazon-mcp-server-for-claude
- Amazon MCP server for ChatGPT: https://agentcentral.to/amazon-mcp-server-for-chatgpt
- Amazon Seller Central ChatGPT: https://agentcentral.to/amazon-seller-central-chatgpt
- Claude quickstart: https://agentcentral.to/docs/quickstart/claude
- ChatGPT quickstart: https://agentcentral.to/docs/quickstart/chatgpt

## Supported Amazon Data

- Amazon Ads campaign, keyword, search term, placement, budget pacing, TACOS, DSP, and Store performance
- Seller Central inventory, orders, returns, reimbursements, listings, suppressed listings, and FBA inbound data
- Catalog details, variations, listing quality, listing issues, reviews, rankings, and keyword ranks
- Finance, fee, profitability, settlement, fulfillment, and MCF data

## Security

- Amazon OAuth connections
- Encrypted tokens
- Per-tenant data isolation
- Scoped API keys
- Read/write tool separation
- Guardrails and audit logs for supported write tools

## Example Prompts

- "Show me products with less than 21 days of FBA cover."
- "Use the Amazon Ads MCP server to query Sponsored Products search terms with spend, clicks, attributed sales, and TACOS for the last 30 days."
- "Use the Amazon Seller Central MCP server in Claude to inspect orders, shipment status, and fulfillment facts from the last 7 days."
- "Use agentcentral in ChatGPT to query the Amazon seller data layer for inventory cover, inbound units, and stranded stock by SKU."
- "Which Amazon Ads campaigns changed budget in the last 14 days?"
- "Compare TACOS, ad spend, and sales by ASIN this month."
- "Find suppressed listings and show the source-provided suppression reasons."
- "Inspect catalog and listing quality data for ASINs with missing images, variation issues, or suppressed offers."
- "Query finance, fee, settlement, returns, and MCF fulfillment data by ASIN for the current settlement period."
- "Show inventory, sales velocity, and inbound shipment status for my top SKUs."

## Local stdio stub (introspection only)

This repo ships a minimal stdio MCP server so directories like Glama and Smithery can introspect the tool catalog without signing up. It does not execute tool calls — every call returns a pointer to the hosted endpoint. Run it locally with:

```
docker build -t agentcentral-mcp .
docker run --rm -i agentcentral-mcp
```

Or via Node:

```
npm install
npm run build
node dist/index.js
```
