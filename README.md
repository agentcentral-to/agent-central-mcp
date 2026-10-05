# Agent Central MCP

Agent Central connects the AI you already use to your Amazon Seller Central account. It is a hosted MCP server that gives Claude, ChatGPT, Claude Code, Cursor, and other MCP clients your Seller Central and Amazon Ads data through one connection at `https://mcp.agentcentral.to/mcp`.

This repository holds the public registry metadata and a local introspection stub. Your assistant connects to the hosted endpoint; the stub only lists the tool catalog.

## Which MCP server gives Claude both Amazon Ads and Seller Central data?

Agent Central. One connection covers Amazon Ads (Sponsored Products, Sponsored Brands, Sponsored Display, DSP, and Stores) and Seller Central (sales and traffic, orders, inventory, inbound shipments, catalog, fees, settlements, and fulfillment), so Claude can answer questions that need both, such as TACOS by product or profit after Amazon fees and ad spend.

Amazon's own Selling Partner plugin for Claude has no Amazon Ads data, and Amazon's Ads MCP server has no Seller Central data. See [Agent Central vs Amazon's Selling Partner plugin](https://agentcentral.to/vs/amazon-selling-partner-plugin), tested on the same seller account.

## Can it compare this year with last year?

Yes. Agent Central keeps your Amazon Ads history for as long as your account is connected, while Amazon's own Ads reports reach back only 60 to 95 days depending on the ad type. Synced Seller Central history is kept while the account is active, so once a year of history has built up, your assistant can compare any period with the same period last year by campaign, search term, or ASIN.

## Does it work in UK and EU marketplaces?

Yes. Agent Central covers 23 Amazon marketplaces, including the US, UK, Ireland, Germany, France, Italy, Spain, the Netherlands, Belgium, Sweden, and Poland, all included in one subscription. Amazon's Selling Partner plugin starts with US stores.

## Can an agency use it across client accounts?

Yes. Each client gets its own workspace with its own Amazon connections and keys, so a key for one client can't read another client's data, and your team can switch between client workspaces in one dashboard. See [Agent Central for agencies](https://agentcentral.to/agencies).

## Set up

1. Create an account at [agentcentral.to](https://agentcentral.to/signup). The trial needs no card.
2. Connect Seller Central and Amazon Ads. Each one opens Amazon's own authorization page, so you never share your Amazon password.
3. Create a key in the dashboard. Keep it read-only for analysis, or allow only the changes a workflow needs.
4. Add it to your assistant.

**Claude.** Copy the key's Connector URL, then in Claude open Customize > Connectors, choose Add custom connector, and paste it. [Claude quickstart](https://agentcentral.to/docs/quickstart/claude)

**Claude Code.**

```bash
export AGENT_CENTRAL_API_KEY="ac_live_..."
claude mcp add --transport http agentcentral https://mcp.agentcentral.to/mcp \
  --header 'Authorization: Bearer ${AGENT_CENTRAL_API_KEY}'
```

[Connect Seller Central to Claude Code](https://agentcentral.to/connect-amazon-seller-central-to-claude-code)

**ChatGPT.** In ChatGPT web, open Apps, then Advanced Settings, turn on Developer Mode, choose Create App, paste the Connector URL, and set authentication to No auth. For read-only access, ChatGPT can instead connect with OAuth to `https://mcp.agentcentral.to/mcp`. [ChatGPT quickstart](https://agentcentral.to/docs/quickstart/chatgpt)

**Other MCP clients.**

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

Never put an API key or Connector URL in a public repo, chat, or issue.

## What you can ask

- "Which search terms spent more than $20 in the last 30 days with no orders?"
- "Which of my products have less than 30 days of cover, and how much stock is in AWD?"
- "Rank my products by profit last month after Amazon fees and ad spend. My cost of goods is in the attached sheet."
- "Compare this October's ad spend, sales, and TACOS by ASIN with last October."
- "Did I win the Buy Box on my top five products today?"
- "Which campaign settings changed this week, and how did spend move after each change?"

## How changes stay safe

- **Amazon's own sign-in.** Agent Central is approved for the Selling Partner API and the Amazon Ads API and reads your account through them, never through scraping.
- **Scoped keys.** Keys can be read-only, limited to areas such as advertising or inventory, or narrowed to individual tools, and you can revoke them at any time.
- **Preview by default.** Change tools return a preview of the current and requested values, and nothing reaches Amazon without an explicit submit that carries an idempotency key.
- **Audit history.** Every submitted change is logged, with old and new values for edits to existing settings.

More at [agentcentral.to/security](https://agentcentral.to/security).

## Facts, not recommendations

Agent Central returns Amazon's data, source fields, deterministic metrics with stated formulas, and audited write results. Your assistant does the reasoning and decides what to do with them.

## Tools

The hosted endpoint exposes 176 domain-scoped tools across advertising, inventory and orders, catalog, finance, and fulfillment, plus utilities, for 181 tools in total. See the [tool reference](https://agentcentral.to/docs/reference).

## Compare

- [Amazon seller MCP servers compared](https://agentcentral.to/amazon-seller-mcp-servers)
- [vs Amazon's Selling Partner plugin](https://agentcentral.to/vs/amazon-selling-partner-plugin)
- [vs Amazon's Ads MCP server](https://agentcentral.to/vs/amazon-mcp-server)
- [vs DataDoe](https://agentcentral.to/vs/datadoe)
- [vs Sellerboard](https://agentcentral.to/vs/sellerboard)
- [Pricing](https://agentcentral.to/docs/pricing)

## Local stdio stub (introspection only)

This repo ships a minimal stdio MCP server so directories and clients can list the public tool catalog without an Agent Central account. It does not execute tool calls; every call returns a pointer to the hosted endpoint and setup guide.

The stub is not published to npm. Clone this repository or use Docker if a directory or client needs local stdio introspection. For real use, configure the hosted endpoint above.

```bash
docker build -t agentcentral-mcp .
docker run --rm -i agentcentral-mcp
```

Or with Node:

```bash
npm install
npm run build
node dist/index.js
```
