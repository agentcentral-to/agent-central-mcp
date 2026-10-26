import assert from "node:assert/strict"
import { fileURLToPath } from "node:url"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"
import { joinFixtureRows, joinedMetrics, readFixture, TOOL_NAME } from "./core.mjs"

const directory = fileURLToPath(new URL(".", import.meta.url))
const args = { view: "joined_metrics", start_date: "2025-01-01", end_date: "2025-01-07" }

const metrics = joinedMetrics({})
assert.equal(metrics.length, 3)
assert.deepEqual(metrics[0], {
  asin: "B0FIXTURE1", sku: "FIX-BLUE", sales: 140, units: 14, ad_spend: 28,
  ad_attributed_sales: 84, available_units: 20, inventory_snapshot_date: '2025-01-07', sales_velocity_units_per_day: 2,
  days_of_cover: 10, acos: 1 / 3, tacos: 0.2,
})
assert.equal(metrics[2].sales_velocity_units_per_day, 0)
assert.equal(metrics[2].days_of_cover, null)
assert.equal(metrics[2].acos, null)
assert.equal(metrics[2].tacos, null)

const sameAsinRows = joinFixtureRows(
  [
    { asin: "B0SAMEASIN", sku: "SKU-A", units: 1, sales: 10 },
    { asin: "B0SAMEASIN", sku: "SKU-B", units: 2, sales: 20 },
  ],
  [
    { asin: "B0SAMEASIN", sku: "SKU-A", spend: 1 },
    { asin: "B0SAMEASIN", sku: "SKU-B", spend: 2 },
  ],
  [
    { asin: "B0SAMEASIN", sku: "SKU-A", available_units: 3 },
    { asin: "B0SAMEASIN", sku: "SKU-B", available_units: 4 },
  ],
)
assert.deepEqual(sameAsinRows, [
  { asin: "B0SAMEASIN", sku: "SKU-A", units: 1, sales: 10, spend: 1, available_units: 3 },
  { asin: "B0SAMEASIN", sku: "SKU-B", units: 2, sales: 20, spend: 2, available_units: 4 },
])

for (const badArgs of [
  { ...args, date: "2025-01-08" },
  { ...args, view: "actions" },
  { ...args, start_date: "2025-01-02" },
  { ...args, asin: "A".repeat(65) },
]) {
  assert.equal(readFixture(badArgs).isError, true)
}
const longArgumentError = readFixture({ ...args, ["x".repeat(100)]: true })
assert.equal(longArgumentError.isError, true)
assert.ok(longArgumentError.content[0].text.length <= 83)

const client = new Client({ name: "fixture-example-test", version: "1.0.0" }, { capabilities: {} })
const transport = new StdioClientTransport({ command: process.execPath, args: ["server.mjs"], cwd: directory })
await client.connect(transport)
try {
  const listed = await client.listTools()
  assert.equal(listed.tools.length, 1)
  assert.equal(listed.tools[0].name, TOOL_NAME)
  assert.deepEqual(listed.tools[0].annotations, { readOnlyHint: true, destructiveHint: false, openWorldHint: false })

  const response = await client.callTool({ name: TOOL_NAME, arguments: args })
  assert.equal(response.isError, false)
  const payload = JSON.parse(response.content[0].text)
  assert.equal(payload.source, "synthetic fixed fixture data stored locally in this example")
  assert.equal(payload.rows[0].asin, "B0FIXTURE1")
  assert.match(payload.limitations, /not Amazon data/)

  const invalid = await client.callTool({ name: TOOL_NAME, arguments: { ...args, caller_path: "/tmp/nope" } })
  assert.equal(invalid.isError, true)
  assert.match(invalid.content[0].text, /unknown argument/)

  const unknown = await client.callTool({ name: "fixture_write", arguments: {} })
  assert.equal(unknown.isError, true)
  assert.match(unknown.content[0].text, /unknown tool/)

  const longUnknown = await client.callTool({ name: "x".repeat(100), arguments: {} })
  assert.equal(longUnknown.isError, true)
  assert.ok(longUnknown.content[0].text.length <= 79)
} finally {
  await client.close()
}

console.log("fixture MCP tests passed")
