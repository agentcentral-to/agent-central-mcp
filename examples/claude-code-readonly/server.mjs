#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js"
import { boundedName, readFixture, TOOL_NAME } from "./core.mjs"

const tool = {
  name: TOOL_NAME,
  description: "Read fixed synthetic sales, advertising, inventory, or deterministic joined metrics for the 2025-01-01 through 2025-01-07 fixture window. Local example only; not a hosted Agent Central tool.",
  inputSchema: {
    type: "object",
    additionalProperties: false,
    required: ["view", "start_date", "end_date"],
    properties: {
      view: { type: "string", enum: ["sales", "advertising", "inventory", "joined_metrics"] },
      start_date: { type: "string", format: "date", const: "2025-01-01" },
      end_date: { type: "string", format: "date", const: "2025-01-07" },
      asin: { type: "string", minLength: 1, maxLength: 64 },
      sku: { type: "string", minLength: 1, maxLength: 64 },
    },
  },
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    openWorldHint: false,
  },
}

const server = new Server({ name: "fixture-sales-ads-inventory-example", version: "1.0.0" }, { capabilities: { tools: {} } })
server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [tool] }))
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== TOOL_NAME) {
    return { isError: true, content: [{ type: "text", text: `unknown tool: ${boundedName(request.params.name)}` }] }
  }
  return readFixture(request.params.arguments)
})

await server.connect(new StdioServerTransport())
