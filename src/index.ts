#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js"

const HOSTED_URL = "https://mcp.agentcentral.to/mcp"
const SETUP_URL = "https://agentcentral.to/amazon-seller-central-mcp-claude"
const VERSION = "1.0.1"

const HOSTED_NOTICE =
  `agentcentral exposes 97 tools across Amazon Ads, Seller Central, ` +
  `inventory, orders, catalog, ranking, finance, and fulfillment. They are only ` +
  `available through the remote streamable-HTTP MCP endpoint at ${HOSTED_URL}.\n\n` +
  `This stdio package is an introspection stub. To connect Claude, ChatGPT, ` +
  `Cursor, OpenClaw, or another MCP client to the live server, follow the setup ` +
  `guide at ${SETUP_URL}.`

const dateRangeSchema = {
  type: "object" as const,
  properties: {
    start_date: {
      type: "string",
      format: "date",
      description: "Start of the date range, YYYY-MM-DD.",
    },
    end_date: {
      type: "string",
      format: "date",
      description: "End of the date range, YYYY-MM-DD.",
    },
  },
  additionalProperties: false,
}

const tools: Tool[] = [
  // --- Ads (read) ---
  {
    name: "get_campaign_performance",
    description:
      "Read Sponsored Products / Sponsored Brands / Sponsored Display campaign performance metrics for a date range, including impressions, clicks, spend, sales, ACOS, ROAS, and TACOS.",
    inputSchema: dateRangeSchema,
  },
  {
    name: "get_keyword_performance",
    description:
      "Read keyword-level performance for a date range across Sponsored Products and Sponsored Brands campaigns.",
    inputSchema: dateRangeSchema,
  },
  {
    name: "get_search_terms",
    description:
      "Read search terms (customer queries) that triggered ad impressions, with attributed sales, clicks, and spend by ASIN.",
    inputSchema: dateRangeSchema,
  },
  {
    name: "get_budget_pacing",
    description:
      "Read campaign budget pacing: budget consumed by hour, time-out-of-budget percentage, and pacing alerts.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "get_tacos",
    description:
      "Read TACOS (total advertising cost of sales) blending ad spend with total Amazon sales by ASIN, brand, or campaign.",
    inputSchema: dateRangeSchema,
  },

  // --- Ads (write) ---
  {
    name: "update_keyword_bids",
    description:
      "Update keyword bids in bulk. Pre-reads current bids, enforces $0.02 min and $100 max guardrails, warns on >500% changes, and writes a pre/post audit log.",
    inputSchema: {
      type: "object" as const,
      properties: {
        keyword_ids: {
          type: "array",
          items: { type: "string" },
          description: "Keyword IDs to update.",
        },
        new_bid: {
          type: "number",
          description: "New bid in account currency (e.g. USD).",
        },
      },
      required: ["keyword_ids", "new_bid"],
      additionalProperties: false,
    },
  },
  {
    name: "update_campaign_budget",
    description:
      "Update a campaign daily budget. Pre-reads current budget, enforces account-currency minimums, and writes a pre/post audit log.",
    inputSchema: {
      type: "object" as const,
      properties: {
        campaign_id: { type: "string", description: "Campaign ID." },
        new_budget: { type: "number", description: "New daily budget." },
      },
      required: ["campaign_id", "new_budget"],
      additionalProperties: false,
    },
  },

  // --- Inventory ---
  {
    name: "get_fba_inventory",
    description:
      "Read FBA inventory levels by SKU/ASIN, including fulfillable, unfulfillable, reserved, inbound, and AWD quantities.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "get_inventory_health",
    description:
      "Read FBA inventory health scoring with stranded, aged, excess, and low-stock indicators per ASIN.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "get_orders",
    description:
      "Read recent Amazon orders with status, marketplace, totals, items, and shipping details.",
    inputSchema: dateRangeSchema,
  },
  {
    name: "get_sales_velocity",
    description:
      "Read sales velocity by ASIN: 7/30/90-day rolling units sold, days of cover, and sell-through pace.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "get_inventory_risk_triage",
    description:
      "Read prioritized inventory risk: stockouts, excess, aged inventory, suppressed listings, and Buy Box loss with risk_level and coverage_state.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },

  // --- Catalog ---
  {
    name: "get_product_details",
    description:
      "Read catalog metadata for an ASIN: title, brand, category, dimensions, images, and identifiers.",
    inputSchema: {
      type: "object" as const,
      properties: { asin: { type: "string", description: "Amazon ASIN." } },
      required: ["asin"],
      additionalProperties: false,
    },
  },
  {
    name: "get_listing_quality",
    description:
      "Read listing quality scoring: title length, bullet completeness, A+ Content presence, image count, and suppressed-status flags per ASIN.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "get_variations",
    description:
      "Read variation family relationships (parent ASIN with all child ASINs) including variation theme.",
    inputSchema: {
      type: "object" as const,
      properties: { parent_asin: { type: "string" } },
      required: ["parent_asin"],
      additionalProperties: false,
    },
  },

  // --- Finance ---
  {
    name: "get_profitability",
    description:
      "Read net profitability by ASIN: gross sales minus FBA fees, referral fees, ad spend, COGS, and returns.",
    inputSchema: dateRangeSchema,
  },
  {
    name: "get_fee_breakdown",
    description:
      "Read Amazon fee breakdown for an ASIN: referral fees, FBA fees, storage fees, and dimensional weight estimates.",
    inputSchema: {
      type: "object" as const,
      properties: { asin: { type: "string" } },
      required: ["asin"],
      additionalProperties: false,
    },
  },
  {
    name: "get_settlement_economics",
    description:
      "Read settlement-period unit economics: starting balance, charges, deposits, refunds, and reserves.",
    inputSchema: dateRangeSchema,
  },

  // --- Ranking ---
  {
    name: "get_current_rank",
    description:
      "Read live keyword rank for an ASIN: organic position, sponsored position, and total result count.",
    inputSchema: {
      type: "object" as const,
      properties: {
        asin: { type: "string" },
        keyword: { type: "string" },
      },
      required: ["asin", "keyword"],
      additionalProperties: false,
    },
  },

  // --- Fulfillment ---
  {
    name: "get_shipping_preview",
    description:
      "Read MCF (Multi-Channel Fulfillment) shipping cost and speed estimates for a destination address.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },

  // --- Utility ---
  {
    name: "create_shareable_report",
    description:
      "Create a public, read-only snapshot URL of an MCP tool result so a stakeholder without an account can view it.",
    inputSchema: {
      type: "object" as const,
      properties: { title: { type: "string" } },
      additionalProperties: false,
    },
  },

  // --- Setup helper ---
  {
    name: "agentcentral_setup",
    description:
      "Returns the connection details and setup link for the hosted agentcentral MCP server.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
]

const server = new Server(
  {
    name: "agentcentral",
    version: VERSION,
  },
  {
    capabilities: { tools: {} },
  },
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const name = request.params.name
  if (name === "agentcentral_setup") {
    return {
      content: [
        {
          type: "text",
          text:
            `Hosted MCP endpoint:\n  ${HOSTED_URL}\n\n` +
            `Setup guide:\n  ${SETUP_URL}\n\n` +
            `Add this to your client config:\n` +
            `{\n  "mcpServers": {\n    "agentcentral": {\n      "url": "${HOSTED_URL}",\n      "headers": { "Authorization": "Bearer ac_live_<YOUR_API_KEY>" }\n    }\n  }\n}`,
        },
      ],
      isError: false,
    }
  }
  return {
    content: [
      {
        type: "text",
        text: HOSTED_NOTICE,
      },
    ],
    isError: false,
  }
})

const transport = new StdioServerTransport()
await server.connect(transport)
