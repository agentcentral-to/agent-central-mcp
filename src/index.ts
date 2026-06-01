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
const VERSION = "1.0.3"
type CatalogTool = {
  readonly name: string
  readonly description: string
  readonly domain: string
  readonly serverDomain: string
  readonly write?: boolean
}

type UtilityTool = {
  readonly name: string
  readonly description: string
}

const domainTools: readonly CatalogTool[] = [
  {
    "name": "get_campaign_performance",
    "description": "Campaign health, spend, and ACOS metrics",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_campaign_snapshots",
    "description": "Campaign setting history and change detection",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_adgroup_performance",
    "description": "Ad group level performance breakdown",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_keyword_performance",
    "description": "Keyword bid and targeting analysis",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_product_performance",
    "description": "Sponsored Products advertised-ASIN performance",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_purchased_products",
    "description": "Products purchased from ad clicks",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_search_terms",
    "description": "Customer search terms that triggered ads",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_placement_breakdown",
    "description": "Performance by ad placement",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_sb_campaign_performance",
    "description": "Sponsored Brands campaign metrics",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_sd_campaign_performance",
    "description": "Sponsored Display campaign metrics",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_sponsored_ads_report",
    "description": "Consolidated SP/SB/SD retained report views",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_dsp_performance",
    "description": "Amazon DSP order, line item, and creative metrics",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_dsp_advertisers_live",
    "description": "Live Amazon DSP advertiser records",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_dsp_entities_live",
    "description": "Live Amazon DSP campaigns, ad groups, and targets",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_store_performance",
    "description": "Brand Store traffic, page, source, tag, and sales insights",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_portfolio_performance",
    "description": "Sponsored Products portfolio-level performance rollups",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_sales_and_traffic",
    "description": "Sales and traffic by ASIN",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_tacos",
    "description": "Total ad cost of sales per ASIN",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_search_query_performance",
    "description": "Market share and conversion data",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_search_query_ad_coverage",
    "description": "Search queries with and without ad coverage",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "diagnose_performance",
    "description": "SP/SB/SD root cause analysis between date ranges",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_sp_entities_live",
    "description": "Live Sponsored Products entity state from Amazon",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_sponsored_ads_entities_live",
    "description": "Live SP/SB/SD entity state from Amazon",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_sp_targeting_options",
    "description": "Targeting candidates, categories, and negative brands",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_sponsored_ads_targeting_options",
    "description": "Live SP/SB/SD targeting options and bid fields",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "create_sb_campaigns",
    "description": "Preview or create Sponsored Brands campaigns",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "update_sb_campaign_budget",
    "description": "Preview or update Sponsored Brands campaign budgets",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "update_sb_campaign_state",
    "description": "Preview or set Sponsored Brands campaign state",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "archive_sb_campaigns",
    "description": "Preview or archive Sponsored Brands campaigns",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "create_sb_ad_groups",
    "description": "Preview or create Sponsored Brands ad groups",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "update_sb_ad_group_state",
    "description": "Preview or set Sponsored Brands ad group state",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "archive_sb_ad_groups",
    "description": "Preview or archive Sponsored Brands ad groups",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "create_sb_ads",
    "description": "Preview or create Sponsored Brands ads with caller-supplied creative",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "update_sb_ad_state",
    "description": "Preview or set Sponsored Brands ad state",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "archive_sb_ads",
    "description": "Preview or archive Sponsored Brands ads",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "create_sb_targets",
    "description": "Preview or create Sponsored Brands targets",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "update_sb_target_bids",
    "description": "Preview or update Sponsored Brands target bids",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "update_sb_target_state",
    "description": "Preview or set Sponsored Brands target state",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "archive_sb_targets",
    "description": "Preview or archive Sponsored Brands targets",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "create_sb_negative_targets",
    "description": "Preview or create Sponsored Brands negative targets",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "update_sb_negative_target_state",
    "description": "Preview or set Sponsored Brands negative target state",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "archive_sb_negative_targets",
    "description": "Preview or archive Sponsored Brands negative targets",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "update_keyword_bids",
    "description": "Preview or adjust keyword bids",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "update_target_bids",
    "description": "Preview or adjust Sponsored Products target bids",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "update_keyword_state",
    "description": "Preview or set keyword state",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "archive_keywords",
    "description": "Preview or archive keywords",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "update_adgroup_bid",
    "description": "Preview or update ad group default bids",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "update_campaign_bidding",
    "description": "Preview or adjust placement bid modifiers",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "update_campaign_budget",
    "description": "Preview or change daily campaign budget",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "update_campaign_state",
    "description": "Preview or set campaign state",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "archive_campaigns",
    "description": "Preview or archive Sponsored Products campaigns",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "create_sd_campaigns",
    "description": "Preview or create Sponsored Display campaigns",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "update_sd_campaign_budget",
    "description": "Preview or update Sponsored Display campaign budgets",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "update_sd_campaign_state",
    "description": "Preview or set Sponsored Display campaign state",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "archive_sd_campaigns",
    "description": "Preview or archive Sponsored Display campaigns",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "create_sd_ad_groups",
    "description": "Preview or create Sponsored Display ad groups",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "update_sd_ad_group_bid",
    "description": "Preview or update Sponsored Display ad group default bids",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "update_sd_ad_group_state",
    "description": "Preview or set Sponsored Display ad group state",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "archive_sd_ad_groups",
    "description": "Preview or archive Sponsored Display ad groups",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "create_sd_product_ads",
    "description": "Preview or create Sponsored Display product ads",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "update_sd_product_ad_state",
    "description": "Preview or set Sponsored Display product ad state",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "archive_sd_product_ads",
    "description": "Preview or archive Sponsored Display product ads",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "create_sd_targets",
    "description": "Preview or create Sponsored Display targets",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "update_sd_target_bids",
    "description": "Preview or update Sponsored Display target bids",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "update_sd_target_state",
    "description": "Preview or set Sponsored Display target state",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "archive_sd_targets",
    "description": "Preview or archive Sponsored Display targets",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "create_sd_negative_targets",
    "description": "Preview or create Sponsored Display negative targets",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "update_sd_negative_target_state",
    "description": "Preview or set Sponsored Display negative target state",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "archive_sd_negative_targets",
    "description": "Preview or archive Sponsored Display negative targets",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "update_campaign_audience_bid_adjustment",
    "description": "Preview or set audience bid adjustments",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "create_keywords",
    "description": "Preview or add keywords",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "create_negative_keywords",
    "description": "Preview or add negative keywords",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "create_sp_campaigns",
    "description": "Preview or create Sponsored Products campaigns",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "create_sp_ad_groups",
    "description": "Preview or create Sponsored Products ad groups",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "create_sp_product_ads",
    "description": "Preview or create Sponsored Products product ads",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "update_sp_ad_entities",
    "description": "Preview or update/archive Sponsored Products ad groups and product ads",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "create_sp_targets",
    "description": "Preview or create Sponsored Products targeting clauses",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "update_sp_target_state",
    "description": "Preview or set Sponsored Products target state",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "archive_sp_targets",
    "description": "Preview or archive Sponsored Products targets",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "create_sp_negative_targets",
    "description": "Preview or create Sponsored Products negative ASIN/brand targets",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "update_sp_negative_keyword_state",
    "description": "Preview or set Sponsored Products negative keyword state",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "archive_sp_negative_keywords",
    "description": "Preview or archive Sponsored Products negative keywords",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "update_sp_negative_target_state",
    "description": "Preview or set Sponsored Products negative target state",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "archive_sp_negative_targets",
    "description": "Preview or archive Sponsored Products negative targets",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": true
  },
  {
    "name": "get_bid_recommendations",
    "description": "Live suggested bids from Amazon",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_budget_recommendations",
    "description": "Live Amazon budget suggestion fields",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_budget_pacing",
    "description": "Daily campaign budget usage and pacing snapshots",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_ad_eligibility",
    "description": "Check ASIN eligibility for ad types",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_brand_health",
    "description": "Brand Metrics funnel and peer benchmarks",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_share_of_voice",
    "description": "Brand Metrics visibility and engagement signals",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_attribution_performance",
    "description": "Off-Amazon Amazon Attribution performance",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_audience_segments",
    "description": "Live Amazon Ads audience segment discovery",
    "domain": "Ads",
    "serverDomain": "ads",
    "write": false
  },
  {
    "name": "get_fba_inventory",
    "description": "FBA stock levels and quantities",
    "domain": "Inventory",
    "serverDomain": "inventory",
    "write": false
  },
  {
    "name": "get_inventory_health",
    "description": "Age buckets, weeks of cover, storage fees",
    "domain": "Inventory",
    "serverDomain": "inventory",
    "write": false
  },
  {
    "name": "get_inventory_movements",
    "description": "Inventory change history",
    "domain": "Inventory",
    "serverDomain": "inventory",
    "write": false
  },
  {
    "name": "get_inventory_by_fulfillment_center",
    "description": "Stock levels per fulfillment center",
    "domain": "Inventory",
    "serverDomain": "inventory",
    "write": false
  },
  {
    "name": "get_awd_inventory",
    "description": "AWD inbound and on-hand stock",
    "domain": "Inventory",
    "serverDomain": "inventory",
    "write": false
  },
  {
    "name": "get_awd_shipments",
    "description": "AWD shipment tracking",
    "domain": "Inventory",
    "serverDomain": "inventory",
    "write": false
  },
  {
    "name": "get_awd_shipment_items",
    "description": "Per-SKU AWD shipment quantities",
    "domain": "Inventory",
    "serverDomain": "inventory",
    "write": false
  },
  {
    "name": "get_inbound_shipments",
    "description": "FBA inbound shipment tracking",
    "domain": "Inventory",
    "serverDomain": "inventory",
    "write": false
  },
  {
    "name": "get_shipment_receiving_status",
    "description": "Per-SKU receiving progress",
    "domain": "Inventory",
    "serverDomain": "inventory",
    "write": false
  },
  {
    "name": "get_sales_velocity",
    "description": "Daily sales and traffic time series",
    "domain": "Inventory",
    "serverDomain": "inventory",
    "write": false
  },
  {
    "name": "get_listing_registry",
    "description": "Active listing registry, search, and brand ASIN views",
    "domain": "Inventory",
    "serverDomain": "inventory",
    "write": false
  },
  {
    "name": "get_suppressed_listings",
    "description": "Suppressed and stranded listings",
    "domain": "Inventory",
    "serverDomain": "inventory",
    "write": false
  },
  {
    "name": "get_days_of_cover",
    "description": "Days of stock remaining",
    "domain": "Inventory",
    "serverDomain": "inventory",
    "write": false
  },
  {
    "name": "get_todays_sales",
    "description": "Today's priced/estimated revenue by ASIN",
    "domain": "Inventory",
    "serverDomain": "inventory",
    "write": false
  },
  {
    "name": "get_orders",
    "description": "Order list with filters",
    "domain": "Inventory",
    "serverDomain": "inventory",
    "write": false
  },
  {
    "name": "get_order_details",
    "description": "Per-order line items",
    "domain": "Inventory",
    "serverDomain": "inventory",
    "write": false
  },
  {
    "name": "get_returns",
    "description": "FBA return records",
    "domain": "Inventory",
    "serverDomain": "inventory",
    "write": false
  },
  {
    "name": "get_reimbursements",
    "description": "FBA reimbursement records",
    "domain": "Inventory",
    "serverDomain": "inventory",
    "write": false
  },
  {
    "name": "get_seasonality_index",
    "description": "52-week demand curve with events",
    "domain": "Inventory",
    "serverDomain": "inventory",
    "write": false
  },
  {
    "name": "get_sales_summary",
    "description": "Daily final/priced revenue and estimates",
    "domain": "Inventory",
    "serverDomain": "inventory",
    "write": false
  },
  {
    "name": "get_inventory_risk_triage",
    "description": "SKUs at risk: low stock, overstock, aged, or stranded",
    "domain": "Inventory",
    "serverDomain": "inventory",
    "write": false
  },
  {
    "name": "get_current_rank",
    "description": "Live keyword rank check via catalog search",
    "domain": "Inventory",
    "serverDomain": "inventory",
    "write": false
  },
  {
    "name": "get_buybox_status",
    "description": "Live Buy Box status plus daily win-rate history",
    "domain": "Inventory",
    "serverDomain": "inventory",
    "write": false
  },
  {
    "name": "get_competitive_pricing",
    "description": "Live price points plus historical pricing snapshots",
    "domain": "Inventory",
    "serverDomain": "inventory",
    "write": false
  },
  {
    "name": "get_offer_listings",
    "description": "Live seller offers for an ASIN",
    "domain": "Inventory",
    "serverDomain": "inventory",
    "write": false
  },
  {
    "name": "get_replenishment_offers",
    "description": "Live and historical Subscribe and Save replenishment offer status",
    "domain": "Inventory",
    "serverDomain": "inventory",
    "write": false
  },
  {
    "name": "get_fba_eligibility",
    "description": "Check FBA eligibility per ASIN",
    "domain": "Inventory",
    "serverDomain": "inventory",
    "write": false
  },
  {
    "name": "get_listing_restrictions",
    "description": "Listing restrictions and approvals",
    "domain": "Inventory",
    "serverDomain": "inventory",
    "write": false
  },
  {
    "name": "get_financial_events",
    "description": "Financial event fee breakdown and profitability views",
    "domain": "Finance",
    "serverDomain": "finance",
    "write": false
  },
  {
    "name": "get_profitability_review",
    "description": "Per-ASIN profitability across fees, returns, and ad spend",
    "domain": "Finance",
    "serverDomain": "finance",
    "write": false
  },
  {
    "name": "get_payment_transactions",
    "description": "Live Amazon Payments transaction rows and summaries",
    "domain": "Finance",
    "serverDomain": "finance",
    "write": false
  },
  {
    "name": "get_settlement_economics",
    "description": "Settlement-finalized financial data",
    "domain": "Finance",
    "serverDomain": "finance",
    "write": false
  },
  {
    "name": "get_product_details",
    "description": "Product info, images, dimensions",
    "domain": "Catalog",
    "serverDomain": "catalog",
    "write": false
  },
  {
    "name": "get_sales_ranks",
    "description": "Best seller rank by category",
    "domain": "Catalog",
    "serverDomain": "catalog",
    "write": false
  },
  {
    "name": "get_aplus_status",
    "description": "A+ Content status and associated ASINs",
    "domain": "Catalog",
    "serverDomain": "catalog",
    "write": false
  },
  {
    "name": "get_variations",
    "description": "Parent/child variation relationships",
    "domain": "Catalog",
    "serverDomain": "catalog",
    "write": false
  },
  {
    "name": "get_product_reviews",
    "description": "Customer review topics and snippets",
    "domain": "Catalog",
    "serverDomain": "catalog",
    "write": false
  },
  {
    "name": "get_review_trends",
    "description": "Six-month review topic trends",
    "domain": "Catalog",
    "serverDomain": "catalog",
    "write": false
  },
  {
    "name": "get_listing_quality",
    "description": "Listing completeness scores and issues",
    "domain": "Catalog",
    "serverDomain": "catalog",
    "write": false
  },
  {
    "name": "get_catalog_cleanup",
    "description": "Listings with catalog quality issues and source fields",
    "domain": "Catalog",
    "serverDomain": "catalog",
    "write": false
  },
  {
    "name": "create_listing",
    "description": "Validate or submit a listing creation request",
    "domain": "Catalog",
    "serverDomain": "catalog",
    "write": true
  },
  {
    "name": "update_listing",
    "description": "Update listing attributes with preview and audit trail",
    "domain": "Catalog",
    "serverDomain": "catalog",
    "write": true
  },
  {
    "name": "update_price",
    "description": "Submit listing price updates through the Listings Items API",
    "domain": "Catalog",
    "serverDomain": "catalog",
    "write": true
  },
  {
    "name": "update_inventory_quantity",
    "description": "Update seller-fulfilled listing quantities",
    "domain": "Catalog",
    "serverDomain": "catalog",
    "write": true
  },
  {
    "name": "get_keyword_ranks",
    "description": "Keyword rank positions, changes, and SQP volume views",
    "domain": "Ranking",
    "serverDomain": "ranking",
    "write": false
  },
  {
    "name": "get_shipping_preview",
    "description": "MCF shipping options and cost estimates",
    "domain": "Fulfillment",
    "serverDomain": "fulfillment",
    "write": false
  },
  {
    "name": "get_mcf_orders",
    "description": "Multi-Channel Fulfillment order list",
    "domain": "Fulfillment",
    "serverDomain": "fulfillment",
    "write": false
  },
  {
    "name": "create_mcf_order",
    "description": "Submit MCF order request from FBA inventory",
    "domain": "Fulfillment",
    "serverDomain": "fulfillment",
    "write": true
  },
  {
    "name": "manage_returns",
    "description": "MCF return authorization",
    "domain": "Fulfillment",
    "serverDomain": "fulfillment",
    "write": true
  }
] as const

const utilityTools: readonly UtilityTool[] = [
  {
    "name": "get_account_data_tour",
    "description": "Return a first-run account data tour with trust preflight, business pulse, spotlight products, neutral cross-domain signals, and evidence handles"
  },
  {
    "name": "submit_conversation_feedback",
    "description": "Submit a redacted structured product-quality report after the user explicitly asks agentcentral to receive feedback"
  },
  {
    "name": "get_account_info",
    "description": "Return the marketplace scope, connection status, and tool availability for the active API key"
  },
  {
    "name": "get_action_history",
    "description": "Return tenant-wide write audit history when the active API key has action-history read permission"
  }
] as const

const DOMAIN_SCOPED_TOOL_COUNT = domainTools.length
const UTILITY_TOOL_COUNT = utilityTools.length
const HOSTED_TOOL_COUNT = DOMAIN_SCOPED_TOOL_COUNT + UTILITY_TOOL_COUNT
const LOCAL_STUB_TOOL_COUNT = HOSTED_TOOL_COUNT + 1

const HOSTED_NOTICE =
  `agentcentral exposes ${DOMAIN_SCOPED_TOOL_COUNT} domain-scoped Amazon MCP tools and ` +
  `${HOSTED_TOOL_COUNT} hosted production tools total across Amazon Ads, Seller Central, ` +
  `inventory, orders, catalog, ranking, finance, and fulfillment. The hosted server ` +
  `supports fast factual reads plus safe guarded writes with previews, guardrails, ` +
  `and audit logs. It is only callable through the remote Streamable HTTP MCP endpoint at ${HOSTED_URL}.\n\n` +
  `This stdio server lists ${LOCAL_STUB_TOOL_COUNT} local discovery tools: the hosted catalog ` +
  `plus the agentcentral_setup helper. It is an introspection stub. To connect Claude, ` +
  `ChatGPT, Cursor, Claude Code, OpenClaw, or another HTTP-capable MCP client to the live server, ` +
  `follow the setup guide at ${SETUP_URL}.`

const directApiToolNames = new Set<string>([
  "get_dsp_advertisers_live",
  "get_dsp_entities_live",
  "get_sp_entities_live",
  "get_sponsored_ads_entities_live",
  "get_sp_targeting_options",
  "get_sponsored_ads_targeting_options",
  "get_bid_recommendations",
  "get_budget_recommendations",
  "get_ad_eligibility",
  "get_audience_segments",
  "get_current_rank",
  "get_buybox_status",
  "get_competitive_pricing",
  "get_offer_listings",
  "get_replenishment_offers",
  "get_fba_eligibility",
  "get_listing_restrictions"
])

const readInputSchema = {
  type: "object" as const,
  properties: {
    start_date: {
      type: "string",
      format: "date",
      description: "Optional start date for time-range reads, YYYY-MM-DD.",
    },
    end_date: {
      type: "string",
      format: "date",
      description: "Optional end date for time-range reads, YYYY-MM-DD.",
    },
    asin: {
      type: "string",
      description: "Optional Amazon ASIN filter when relevant.",
    },
    sku: {
      type: "string",
      description: "Optional merchant SKU filter when relevant.",
    },
    marketplace_id: {
      type: "string",
      description: "Optional Amazon marketplace identifier.",
    },
    filters: {
      type: "object",
      description: "Optional lightweight filters supported by the hosted tool.",
      additionalProperties: true,
    },
    limit: {
      type: "integer",
      minimum: 1,
      maximum: 500,
      description: "Optional row limit for hosted reads.",
    },
  },
  additionalProperties: true,
}

const writeInputSchema = {
  type: "object" as const,
  properties: {
    preview: {
      type: "boolean",
      description: "Request a preview instead of applying a hosted write when supported.",
    },
    dry_run: {
      type: "boolean",
      description: "Alias for requesting validation/preview behavior when supported.",
    },
    changes: {
      type: "array",
      description: "High-level desired changes for the hosted guarded write tool.",
      items: { type: "object", additionalProperties: true },
    },
    reason: {
      type: "string",
      description: "Optional user-supplied reason for audit logging.",
    },
    marketplace_id: {
      type: "string",
      description: "Optional Amazon marketplace identifier.",
    },
  },
  additionalProperties: true,
}

const utilityInputSchema = {
  type: "object" as const,
  properties: {
    request: {
      type: "string",
      description: "Optional high-level request for the hosted utility tool.",
    },
    context: {
      type: "object",
      description: "Optional lightweight context for the hosted utility tool.",
      additionalProperties: true,
    },
  },
  additionalProperties: true,
}

const emptyInputSchema = {
  type: "object" as const,
  properties: {},
  additionalProperties: false,
}

function modeFor(tool: CatalogTool): string {
  if (tool.write) return "guarded write"
  if (directApiToolNames.has(tool.name)) return "direct API read"
  return "read"
}

function domainToolToMcpTool(tool: CatalogTool): Tool {
  const mode = modeFor(tool)
  return {
    name: tool.name,
    description: `[${tool.domain} / ${mode}] ${tool.description}. Hosted endpoint only; this local stdio server is an introspection stub.`,
    inputSchema: tool.write ? writeInputSchema : readInputSchema,
  }
}

function utilityToolToMcpTool(tool: UtilityTool): Tool {
  return {
    name: tool.name,
    description: `[utility] ${tool.description}. Hosted endpoint only; this local stdio server is an introspection stub.`,
    inputSchema: utilityInputSchema,
  }
}

const tools: Tool[] = [
  ...domainTools.map(domainToolToMcpTool),
  ...utilityTools.map(utilityToolToMcpTool),
  {
    name: "agentcentral_setup",
    description:
      "Returns connection details and setup links for the hosted agentcentral Amazon MCP server.",
    inputSchema: emptyInputSchema,
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
            `Hosted catalog:\n  ${DOMAIN_SCOPED_TOOL_COUNT} domain-scoped tools / ${HOSTED_TOOL_COUNT} production tools total.\n` +
            `Local stub catalog:\n  ${LOCAL_STUB_TOOL_COUNT} discovery tools, including agentcentral_setup.\n\n` +
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
        text: `Tool "${name}" is listed for hosted agentcentral discovery only.\n\n${HOSTED_NOTICE}`,
      },
    ],
    isError: false,
  }
})

const transport = new StdioServerTransport()
await server.connect(transport)
