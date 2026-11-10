import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createServer } from "node:http"
import { once } from "node:events"
import { test } from "node:test"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"

const manifestText = readFileSync(new URL("../gemini-extension.json", import.meta.url), "utf8")
const manifest = JSON.parse(manifestText)
const config = manifest.mcpServers.agentcentral
const headerPlaceholder = "Bearer ${AGENT_CENTRAL_API_KEY}"

test("extension has a bounded declarative surface with no injected instructions or commands", () => {
  assert.deepEqual(Object.keys(manifest).sort(), ["description", "mcpServers", "name", "settings", "version"])
  assert.equal(manifest.name, "agent-central")
  assert.match(manifest.version, /^\d+\.\d+\.\d+$/)
  assert.ok(manifest.description.startsWith("Agent Central connects the AI you already use"))
  assert.deepEqual(Object.keys(manifest.mcpServers), ["agentcentral"])
  assert.deepEqual(Object.keys(config).sort(), ["headers", "httpUrl", "oauth"])
  assert.equal(config.httpUrl, "https://mcp.agentcentral.to/mcp")
  assert.deepEqual(config.oauth, { enabled: false })
  assert.deepEqual(config.headers, { Authorization: headerPlaceholder })
  // No trust flag, local command, hook, policy override, or tool auto-approval.
  assert.equal(manifestText.includes("/mcp/connect/"), false)
  assert.equal(/ac_live_[a-zA-Z0-9]+/.test(manifestText), false)
})

test("the single API key setting is sensitive and declared for Gemini's environment allowlist", () => {
  assert.equal(manifest.settings.length, 1)
  const [setting] = manifest.settings
  assert.deepEqual(Object.keys(setting).sort(), ["description", "envVar", "name", "sensitive"])
  assert.equal(setting.envVar, "AGENT_CENTRAL_API_KEY")
  assert.equal(setting.sensitive, true)
  assert.match(setting.description, /read-only/)
  assert.match(setting.description, /without the Bearer prefix/)
  assert.equal(Object.hasOwn(setting, "default"), false)
  assert.equal(Object.hasOwn(setting, "value"), false)
})

test("install documentation tracks main, keeps updates enabled, and explains the gallery gate", () => {
  const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8")
  const notes = readFileSync(new URL("../llms-install.md", import.meta.url), "utf8")
  for (const text of [readme, notes]) {
    assert.ok(text.includes("gemini extensions install https://github.com/agentcentral-to/agent-central-mcp --ref main --auto-update"))
    assert.ok(text.includes("gemini extensions config agent-central"))
  }
  assert.ok(readme.includes("gemini-cli-extension"))
  assert.ok(readme.includes("older GitHub release"))
  assert.ok(readme.includes("not a listing in the Gemini app or Google Search"))
})

test("manifest bearer-header shape works against an isolated HTTP MCP fixture", { timeout: 10_000 }, async () => {
  const seen = []
  const fixtureKey = "fixture-only-not-a-credential"
  // This substitution is a fixture adapter, not an implementation of Gemini's loader.
  // Real Gemini manifest validation is a separate check; no cloud endpoint is used here.
  const authorization = config.headers.Authorization.replace("${AGENT_CENTRAL_API_KEY}", fixtureKey)
  const fixture = createServer(async (req, res) => {
    try {
      assert.equal(req.headers.authorization, `Bearer ${fixtureKey}`)
      assert.equal(req.url, "/mcp")
      assert.equal(req.method, "POST")
      let raw = ""
      for await (const chunk of req) raw += chunk
      const message = JSON.parse(raw)
      seen.push(message.method)
      if (message.id === undefined) {
        res.writeHead(202).end()
        return
      }
      let result
      switch (message.method) {
        case "initialize":
          result = {
            protocolVersion: message.params.protocolVersion,
            capabilities: { tools: {} },
            serverInfo: { name: "agent-central-offline-fixture", version: "1.0.0" },
          }
          break
        case "tools/list":
          result = { tools: [{
            name: "get_account_info",
            description: "Return a synthetic fixture account, not customer data.",
            inputSchema: { type: "object", properties: {} },
            annotations: { readOnlyHint: true },
          }] }
          break
        case "tools/call":
          assert.equal(message.params.name, "get_account_info")
          assert.deepEqual(message.params.arguments, {})
          result = { content: [{ type: "text", text: "Fixture account only; no Amazon access." }] }
          break
        default:
          throw new Error(`Unexpected fixture method: ${message.method}`)
      }
      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ jsonrpc: "2.0", id: message.id, result }))
    } catch (error) {
      res.writeHead(400, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ error: String(error) }))
    }
  })
  fixture.listen(0, "127.0.0.1")
  await once(fixture, "listening")
  const client = new Client({ name: "gemini-manifest-fixture-test", version: "1.0.0" })
  try {
    const transport = new StreamableHTTPClientTransport(
      new URL(`http://127.0.0.1:${fixture.address().port}/mcp`),
      { requestInit: { headers: { Authorization: authorization } } },
    )
    await client.connect(transport)
    const list = await client.listTools()
    assert.deepEqual(list.tools.map((tool) => tool.name), ["get_account_info"])
    const result = await client.callTool({ name: "get_account_info", arguments: {} })
    assert.equal(result.isError, undefined)
    assert.equal(result.content[0].text, "Fixture account only; no Amazon access.")
    assert.ok(seen.includes("initialize"))
    assert.ok(seen.includes("tools/list"))
    assert.equal(seen.filter((method) => method === "tools/call").length, 1)
  } finally {
    await client.close()
    await new Promise((resolve) => fixture.close(resolve))
  }
})
