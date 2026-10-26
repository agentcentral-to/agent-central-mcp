# Claude Code fixture-only read example

This Agent Central example lets Claude Code compare sales, advertising and inventory using three fixed, synthetic product records. It runs a local stdio MCP server, not the hosted Agent Central service. It does not connect to Amazon, and its `fixture_sales_ads_inventory_read` tool is not a hosted Agent Central tool.

The server reads only files imported with the example. It makes no network requests, loads no environment variables or credentials, accepts no caller paths, writes no files, and has no tool for recommendations, ranking, or Amazon changes. Its one tool is annotated read-only, non-destructive, and closed-world.

## Run it

From the repository root, install the existing dependencies and add the local server to Claude Code:

```bash
npm ci --ignore-scripts
claude mcp add --scope local --transport stdio fixture-sales-ads-inventory -- node "$PWD/examples/claude-code-readonly/server.mjs"
```

The command follows Claude Code's stdio MCP setup. See the current [Claude Code MCP documentation](https://docs.anthropic.com/en/docs/claude-code/mcp) for configuration locations and management commands.

Then use plain-English prompts such as:

- `Read the joined fixture metrics for 2025-01-01 through 2025-01-07. Compare each product's ad spend with sales and available inventory. State the source limitations.`
- `Use the fixture sales, advertising, and inventory views for 2025-01-01 through 2025-01-07, then explain the reported days of cover and null ratios without suggesting any actions.`

The only accepted date window is `2025-01-01` through `2025-01-07`. `view` must be `sales`, `advertising`, `inventory`, or `joined_metrics`; `asin` and `sku` are optional exact filters of at most 64 characters. Any other argument is rejected.

## Deterministic report without an LLM

```bash
npm run report:example
```

Expected output:

```text
B0FIXTURE1 FIX-BLUE: spend $28.00, sales $140.00, inventory 20, velocity 2.00/day, cover 10.00 days
B0FIXTURE2 FIX-RED: spend $0.00, sales $210.00, inventory 21, velocity 1.00/day, cover 21.00 days
B0FIXTURE3 FIX-ZERO: spend $7.00, sales $0.00, inventory 10, velocity 0.00/day, cover null days
```

## Data and calculations

All fixture amounts are USD. Sales and advertising totals cover the fixed seven calendar days, while inventory is a snapshot dated `2025-01-07`, disclosed as `inventory_snapshot_date` in each joined row. ASIN and SKU join the three sources exactly. For `joined_metrics`:

- sales velocity = units / 7 calendar days
- days of cover = available units / sales velocity; it is `null` when velocity is zero
- ACOS = ad spend / ad-attributed sales (a ratio, not a percentage); it is `null` when attributed sales is zero
- TACOS = ad spend / total sales (a ratio, not a percentage); it is `null` when sales is zero

These are synthetic values, not Amazon data. They do not model live inventory, customer data, attribution completeness, fees, returns, or recommendations.

## Real hosted read-only access

For a real account, configure the separate hosted Agent Central service with a read-only key. Start at [Agent Central's Claude Code connection guide](https://agentcentral.to/connect-amazon-seller-central-to-claude-code) and use the hosted endpoint described in the repository [root README](../../README.md). Do not add real credentials to this example or its Claude Code command.
