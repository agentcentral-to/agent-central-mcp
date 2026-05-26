# agentcentral MCP

agentcentral is a hosted Amazon MCP server for Amazon sellers: an Amazon Seller Central MCP server and Amazon Ads MCP server for Claude, ChatGPT, Cursor, Claude Code, OpenClaw, and other HTTP-capable MCP clients.

It connects AI clients to Amazon Ads, Seller Central, inventory, orders, catalog, rankings, finance, and fulfillment data through the hosted Streamable HTTP endpoint at `https://mcp.agentcentral.to/mcp`.

This is not just an export layer. agentcentral is an operational MCP server with fast factual reads plus safe guarded writes: scoped API keys, read/write tool separation, previews, guardrails, and audited write results. The hosted endpoint currently exposes 141 domain-scoped tools and 148 production tools total. This public repo contains registry metadata and a thin stdio introspection stub; live tool execution happens only through the hosted endpoint.

## Connect

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

Claude custom connectors use a signed connector URL generated in the agentcentral dashboard.

## Setup

1. Create an account at https://agentcentral.to/signup.
2. Connect Amazon Ads and Seller Central through Amazon OAuth.
3. Create a scoped API key or signed Claude connector URL.
4. Add the MCP endpoint to Claude, ChatGPT, Cursor, Claude Code, OpenClaw, or another remote-MCP-capable client.

Full setup guide: https://agentcentral.to/amazon-seller-central-mcp-claude

## What agents can access

- Amazon Ads campaign, ad group, keyword, target, search term, placement, budget pacing, TACOS, DSP, Brand Store, and Amazon Attribution data
- Seller Central inventory, orders, returns, reimbursements, listings, suppressed listings, inbound shipments, and FBA/AWD stock facts
- Catalog details, sales ranks, A+ Content status, variations, listing quality, listing issues, reviews, and keyword ranks
- Finance, profitability, payment transaction, settlement, fulfillment, MCF shipping, and MCF order data
- Guarded write tools for supported Amazon Ads, catalog, listing, price, inventory quantity, and MCF operations

agentcentral returns factual seller data, source fields, deterministic metrics, classifications, and audited write results. It is not a recommendation engine.

## Discovery URLs

- Amazon Seller Central MCP: https://agentcentral.to/amazon-seller-central-mcp
- Amazon Ads MCP server: https://agentcentral.to/amazon-ads-mcp-server
- Amazon MCP server for Claude: https://agentcentral.to/amazon-mcp-server-for-claude
- Amazon MCP server for ChatGPT: https://agentcentral.to/amazon-mcp-server-for-chatgpt
- Amazon Seller Central ChatGPT: https://agentcentral.to/amazon-seller-central-chatgpt
- Claude quickstart: https://agentcentral.to/docs/quickstart/claude
- ChatGPT quickstart: https://agentcentral.to/docs/quickstart/chatgpt

## Security

- Amazon OAuth connections
- Encrypted Amazon refresh tokens
- Per-tenant data isolation
- Scoped API keys and read-only configurations
- Read/write tool separation
- Guardrails, previews, and audit logs for supported write tools

## Example prompts

- "Use the Amazon Ads MCP server to query Sponsored Products search terms with spend, clicks, attributed sales, and TACOS for the last 30 days."
- "Which SKUs are below 30 days of FBA cover? Include current stock, inbound units, sales velocity, and suppressed listing status."
- "Use the Amazon Seller Central MCP server in Claude to inspect orders, shipment status, and fulfillment facts from the last 7 days."
- "Compare TACOS, ad spend, and sales by ASIN this month."
- "Find suppressed listings and show the source-provided suppression reasons."
- "Which Amazon Ads campaigns changed budget in the last 14 days?"

## Local stdio stub (introspection only)

This repo ships a minimal stdio MCP server so directories and clients can introspect the public tool catalog without an agentcentral account. It does not execute tool calls. Every call returns a pointer to the hosted endpoint and setup guide.

```bash
docker build -t agentcentral-mcp .
docker run --rm -i agentcentral-mcp
```

Or via Node:

```bash
npm install
npm run build
node dist/index.js
```

## Suggested GitHub topics

`amazon-mcp`, `amazon-seller-mcp`, `amazon-seller-central-mcp`, `amazon-ads-mcp`, `sp-api`, `sp-api-mcp`, `amazon-ads-api`, `model-context-protocol`, `remote-mcp`, `streamable-http`, `claude`, `chatgpt`, `cursor`
