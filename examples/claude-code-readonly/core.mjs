import { advertising, CURRENCY, FIXTURE_WINDOW, inventory, sales } from "./fixtures.mjs"

export const TOOL_NAME = "fixture_sales_ads_inventory_read"
export const VIEWS = Object.freeze(["sales", "advertising", "inventory", "joined_metrics"])

const ALLOWED_ARGUMENTS = new Set(["view", "start_date", "end_date", "asin", "sku"])
const MAX_IDENTIFIER_LENGTH = 64
const datePattern = /^\d{4}-\d{2}-\d{2}$/

function fail(message) {
  return { isError: true, content: [{ type: "text", text: message }] }
}

export function boundedName(value) {
  const name = String(value)
  return name.length <= MAX_IDENTIFIER_LENGTH ? name : `${name.slice(0, MAX_IDENTIFIER_LENGTH)}…`
}

export function fixtureKey({ asin, sku }) {
  return JSON.stringify([asin, sku])
}

function ratio(numerator, denominator) {
  return denominator === 0 ? null : numerator / denominator
}

function matches(row, args) {
  return (!args.asin || row.asin === args.asin) && (!args.sku || row.sku === args.sku)
}

export function validateArguments(args) {
  if (!args || typeof args !== "object" || Array.isArray(args)) return "arguments must be an object"
  for (const key of Object.keys(args)) {
    if (!ALLOWED_ARGUMENTS.has(key)) return `unknown argument: ${boundedName(key)}`
  }
  if (!VIEWS.includes(args.view)) return `view must be one of: ${VIEWS.join(", ")}`
  for (const key of ["start_date", "end_date"]) {
    if (typeof args[key] !== "string" || !datePattern.test(args[key])) return `${key} must be a YYYY-MM-DD string`
  }
  if (args.start_date !== FIXTURE_WINDOW.start_date || args.end_date !== FIXTURE_WINDOW.end_date) {
    return `date window must be exactly ${FIXTURE_WINDOW.start_date} through ${FIXTURE_WINDOW.end_date}`
  }
  for (const key of ["asin", "sku"]) {
    if (args[key] !== undefined && (typeof args[key] !== "string" || args[key].length === 0)) return `${key} must be a non-empty string when supplied`
    if (typeof args[key] === "string" && args[key].length > MAX_IDENTIFIER_LENGTH) return `${key} must be at most ${MAX_IDENTIFIER_LENGTH} characters`
  }
  return null
}

function selected(rows, args) {
  return rows.filter((row) => matches(row, args))
}

export function joinFixtureRows(salesRows, advertisingRows, inventoryRows) {
  const rowsByKey = new Map(salesRows.map((row) => [fixtureKey(row), { ...row }]))
  for (const row of advertisingRows) {
    const joined = rowsByKey.get(fixtureKey(row))
    if (joined) Object.assign(joined, row)
  }
  for (const row of inventoryRows) {
    const joined = rowsByKey.get(fixtureKey(row))
    if (joined) Object.assign(joined, row)
  }
  return [...rowsByKey.values()]
}

export function joinedMetrics(args) {
  return joinFixtureRows(sales, advertising, inventory).filter((row) => matches(row, args)).map((row) => {
    const salesVelocityUnitsPerDay = row.units / 7
    return {
      asin: row.asin,
      sku: row.sku,
      sales: row.sales,
      units: row.units,
      ad_spend: row.spend,
      ad_attributed_sales: row.attributed_sales,
      available_units: row.available_units,
      inventory_snapshot_date: row.snapshot_date,
      sales_velocity_units_per_day: salesVelocityUnitsPerDay,
      days_of_cover: ratio(row.available_units, salesVelocityUnitsPerDay),
      acos: ratio(row.spend, row.attributed_sales),
      tacos: ratio(row.spend, row.sales),
    }
  })
}

export function readFixture(args) {
  const problem = validateArguments(args)
  if (problem) return fail(problem)

  const rows = args.view === "sales" ? selected(sales, args)
    : args.view === "advertising" ? selected(advertising, args)
    : args.view === "inventory" ? selected(inventory, args)
    : joinedMetrics(args)

  return {
    content: [{ type: "text", text: JSON.stringify({
      source: "synthetic fixed fixture data stored locally in this example",
      date_window: FIXTURE_WINDOW,
      currency: CURRENCY,
      view: args.view,
      rows,
      formulas: args.view === "joined_metrics" ? {
        sales_velocity_units_per_day: "units / 7 calendar days in date_window",
        days_of_cover: "available_units / sales_velocity_units_per_day; null when velocity is zero",
        acos: "ad_spend / ad_attributed_sales; null when ad_attributed_sales is zero",
        tacos: "ad_spend / sales; null when sales is zero",
      } : undefined,
      limitations: "Synthetic fixture only. It is not Amazon data, has no customer data, and does not represent live inventory, attribution, fees, returns, or recommendations.",
    }, null, 2) }],
    isError: false,
  }
}

export function report() {
  const rows = joinedMetrics({})
  return rows.map((row) => `${row.asin} ${row.sku}: spend $${row.ad_spend.toFixed(2)}, sales $${row.sales.toFixed(2)}, inventory ${row.available_units}, velocity ${row.sales_velocity_units_per_day.toFixed(2)}/day, cover ${row.days_of_cover === null ? "null" : row.days_of_cover.toFixed(2)} days`).join("\n")
}
