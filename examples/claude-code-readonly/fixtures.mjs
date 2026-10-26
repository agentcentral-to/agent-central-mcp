export const FIXTURE_WINDOW = Object.freeze({
  start_date: "2025-01-01",
  end_date: "2025-01-07",
})

export const CURRENCY = "USD"

export const sales = Object.freeze([
  { asin: "B0FIXTURE1", sku: "FIX-BLUE", units: 14, sales: 140.0 },
  { asin: "B0FIXTURE2", sku: "FIX-RED", units: 7, sales: 210.0 },
  { asin: "B0FIXTURE3", sku: "FIX-ZERO", units: 0, sales: 0.0 },
])

export const advertising = Object.freeze([
  { asin: "B0FIXTURE1", sku: "FIX-BLUE", spend: 28.0, clicks: 40, attributed_sales: 84.0 },
  { asin: "B0FIXTURE2", sku: "FIX-RED", spend: 0.0, clicks: 0, attributed_sales: 0.0 },
  { asin: "B0FIXTURE3", sku: "FIX-ZERO", spend: 7.0, clicks: 9, attributed_sales: 0.0 },
])

export const inventory = Object.freeze([
  { asin: "B0FIXTURE1", sku: "FIX-BLUE", available_units: 20, snapshot_date: "2025-01-07" },
  { asin: "B0FIXTURE2", sku: "FIX-RED", available_units: 21, snapshot_date: "2025-01-07" },
  { asin: "B0FIXTURE3", sku: "FIX-ZERO", available_units: 10, snapshot_date: "2025-01-07" },
])
