#!/usr/bin/env node
import fs from "node:fs"

const readJson = (path) => JSON.parse(fs.readFileSync(path, "utf8"))
const fail = (message) => {
  console.error(`metadata check failed: ${message}`)
  process.exitCode = 1
}

const pkg = readJson("package.json")
const server = readJson("server.json")
const source = fs.readFileSync("src/index.ts", "utf8")
const readme = fs.readFileSync("README.md", "utf8")
const llms = fs.readFileSync("llms-install.md", "utf8")

if (pkg.private !== true) fail("package.json must remain private; this repo is not published to npm")
if (pkg.version !== server.version) fail(`package.json version ${pkg.version} does not match server.json version ${server.version}`)
if (!pkg.scripts?.["check:metadata"]) fail("package.json is missing the check:metadata script")

const domainToolMatches = source.match(/"serverDomain":/g) ?? []
const utilityToolBlock = source.match(/const utilityTools:[\s\S]*?\] as const/)?.[0] ?? ""
const utilityToolMatches = utilityToolBlock.match(/"name":/g) ?? []
const domainToolCount = domainToolMatches.length
const utilityToolCount = utilityToolMatches.length
const hostedToolCount = domainToolCount + utilityToolCount
const localStubToolCount = hostedToolCount + 1

if (domainToolCount !== 180) fail(`expected 180 domain-scoped tools, found ${domainToolCount}`)
if (utilityToolCount !== 5) fail(`expected 5 utility tools, found ${utilityToolCount}`)
if (hostedToolCount !== 185) fail(`expected 185 hosted tools, found ${hostedToolCount}`)

const domainCatalogBlock = source.match(/const domainTools:[\s\S]*?= (\[[\s\S]*?\]) as const/)?.[1]
const domainCatalog = domainCatalogBlock ? JSON.parse(domainCatalogBlock) : []
const catalogNames = domainCatalog.map((tool) => tool.name)
if (new Set(catalogNames).size !== domainToolCount) fail("domain catalog contains duplicate or missing tool names")
for (const name of ["update_sp_campaign_settings", "create_portfolios", "update_portfolios"]) {
  const tool = domainCatalog.find((entry) => entry.name === name)
  if (!tool || tool.serverDomain !== "ads" || tool.write !== true) {
    fail(name + " must be present as an Ads guarded-write discovery entry")
  }
}
if (!domainCatalog.find((tool) => tool.name === "create_portfolios")?.description.includes("permanent")) {
  fail("create_portfolios must disclose that portfolios are permanent")
}

for (const [path, text] of [["README.md", readme], ["llms-install.md", llms]]) {
  if (!text.includes(`${domainToolCount} domain-scoped`)) fail(`${path} is missing the ${domainToolCount} domain-scoped tool count`)
  if (!text.includes(`${hostedToolCount}`)) fail(`${path} is missing the ${hostedToolCount} hosted tool count`)
}

if (!source.includes("LOCAL_STUB_TOOL_COUNT")) fail("src/index.ts must explain the local setup helper count")
if (!readme.includes("not published to npm")) fail("README.md must state that the stub is not published to npm")
if (!llms.includes("not published as an npm package")) fail("llms-install.md must state that the stub is not published as an npm package")

if (!process.exitCode) {
  console.log(`metadata ok: ${domainToolCount} domain tools, ${utilityToolCount} utility tools, ${hostedToolCount} hosted tools, ${localStubToolCount} local discovery tools`)
}
