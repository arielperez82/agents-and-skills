# Medallion Architecture Pattern

The Bronze/Silver/Gold layered data architecture for organizing data in a lakehouse. Provides progressive data quality improvement from raw ingestion to business-ready analytics.

## Layer Overview

```
Bronze (Raw)            Silver (Validated)        Gold (Business-Ready)
- Raw ingestion         - Cleaned, validated      - Aggregated
- Schema-on-read        - Deduplicated            - Business logic applied
- Full history          - Schema enforced          - Star/snowflake schema
- Audit trail           - Standardized formats    - Ready for BI/reporting
```

## Bronze Layer (Raw)

### Purpose
Ingest and preserve raw data exactly as received from source systems. Serves as the system of record and audit trail.

### Characteristics
- Raw data as-is from source systems
- Append-only for auditability (never update or delete)
- Partitioned by ingestion date (enables efficient reprocessing)
- Minimal transformations (format conversion only, e.g., Avro to Parquet)
- Retains full history of all source data

### Schema
- Schema-on-read: no enforced schema at write time
- Include metadata columns: `_ingestion_timestamp`, `_source_system`, `_source_file`
- Store in columnar format (Parquet, Delta, Iceberg) for efficient downstream reads

### Quality Gate: Bronze to Silver
Before promoting data from Bronze to Silver, validate:
- [ ] Source file/message received completely (row count matches source, no truncation)
- [ ] Ingestion metadata populated (timestamp, source, file reference)
- [ ] Data is parseable (no corrupted records that block downstream processing)
- [ ] Duplicates from source are preserved (deduplication happens in Silver)

## Silver Layer (Validated)

### Purpose
Clean, validate, and standardize data. This is the enterprise-conforming layer where data quality rules are enforced.

### Characteristics
- Data quality rules applied
- Deduplication on business keys
- Schema standardization (consistent naming conventions, data types)
- Slowly Changing Dimensions (SCD) applied where appropriate
- Referential integrity validated across related datasets

### Data Quality Rules

**Completeness checks**:
- Required fields are non-null
- Expected row counts within threshold of source

**Validity checks**:
- Values within expected ranges (e.g., age between 0 and 150)
- Enumerated fields contain only valid values
- Date fields are parseable and within reasonable ranges

**Consistency checks**:
- Foreign key references resolve to valid records
- Cross-field validation (e.g., end_date >= start_date)
- Currency/unit standardization

**Uniqueness checks**:
- Business key uniqueness enforced after deduplication
- No duplicate events after idempotency processing

### Schema Standardization

Apply consistent conventions across all Silver tables:
- Column naming: `snake_case`, no abbreviations
- Timestamps: UTC, ISO 8601 format
- Currency: Store as integer (cents), not floating point
- Identifiers: String type (even if numeric) to prevent leading-zero loss
- Null handling: Explicit nulls, no empty strings as null substitutes

### Quality Gate: Silver to Gold
Before promoting data from Silver to Gold, validate:
- [ ] All data quality rules passing (completeness, validity, consistency, uniqueness)
- [ ] Deduplication complete (business key uniqueness verified)
- [ ] Schema matches Silver contract (no unexpected columns, types correct)
- [ ] Data freshness within SLA (latest record timestamp within expected window)
- [ ] Row count delta within acceptable range vs previous run (detect anomalies)

## Gold Layer (Business-Ready)

### Purpose
Business-level aggregations, dimensional models, and pre-computed metrics optimized for consumption by BI tools, dashboards, and data products.

### Characteristics
- Business logic applied (KPIs, calculated fields, business rules)
- Dimensional models (star schema or snowflake schema)
- Pre-computed aggregations and metrics
- Optimized for query performance (partitioned, indexed, materialized)
- Versioned and documented

### Common Gold Layer Patterns

**Fact tables** (measures and events):
- `fact_orders`: order_id, customer_key, product_key, date_key, quantity, revenue, discount
- `fact_page_views`: session_id, user_key, page_key, date_key, duration_seconds
- Grain: one row per event/transaction at the most granular useful level

**Dimension tables** (descriptors):
- `dim_customer`: customer_key, name, segment, region, acquisition_date, lifetime_value_tier
- `dim_product`: product_key, name, category, subcategory, brand, price_tier
- `dim_date`: date_key, date, day_of_week, month, quarter, year, is_holiday, fiscal_period
- Include SCD Type 2 columns where history matters: `valid_from`, `valid_to`, `is_current`

**Aggregate tables** (pre-computed for performance):
- `agg_daily_revenue`: date_key, product_category, region, total_revenue, order_count
- `agg_monthly_customer_metrics`: month_key, customer_segment, active_users, churn_rate, avg_order_value
- Document the grain and refresh frequency for each aggregate

## When to Use Medallion Architecture

### Good Fit
- Data lakehouse environments (Delta Lake, Iceberg, Hudi)
- Multiple data sources with varying quality levels
- Need for auditability and data lineage
- BI and analytics workloads alongside data science
- Regulatory requirements for data retention and traceability

### Poor Fit
- Simple single-source OLTP applications (use a database directly)
- Real-time-only streaming with no historical analysis needs
- Very small data volumes where a single table suffices
- No downstream consumers beyond the source application

## Implementation Patterns

### Incremental Processing

Process only new or changed data at each layer transition:

```
Bronze: Append new records (partitioned by ingestion date)
        |
        v
Silver: MERGE on business key
        - INSERT new records
        - UPDATE changed records (based on hash of non-key columns)
        - Optionally SOFT DELETE removed records
        |
        v
Gold:   Rebuild aggregations for affected partitions only
        - Identify affected date ranges from Silver changes
        - Recompute only those partitions
```

### Data Lineage

Track data flow through all three layers:
- Bronze: source system, ingestion job, ingestion timestamp
- Silver: transformation job, quality check results, processing timestamp
- Gold: aggregation job, business logic version, computation timestamp

### Error Handling

**Bronze**: Accept all data. Log parsing errors but do not reject records. Quarantine unparseable records in a separate `_errors` partition.

**Silver**: Reject records failing quality rules. Route rejected records to a `_quarantine` table with rejection reason. Alert on quarantine rate exceeding threshold.

**Gold**: Fail the entire batch if input data quality is below threshold. Do not serve partially correct aggregations.

## Monitoring and Observability

Track these metrics for each layer:

| Metric | Bronze | Silver | Gold |
|---|---|---|---|
| Row count per run | Expected range from source | Delta vs Bronze (growth/shrinkage) | Aggregate count stability |
| Processing duration | Ingestion time | Transformation + quality check time | Aggregation time |
| Error/rejection rate | Parse error rate | Quality rule failure rate | N/A (fail entire batch) |
| Data freshness | Time since last ingestion | Time since last Silver update | Time since last Gold refresh |
| Schema drift | New/removed columns from source | Contract violations | N/A (schema is fixed) |

### Alerting Thresholds

- Ingestion delay > 2x normal duration: Warning
- Quality rule failure rate > 5%: Warning
- Quality rule failure rate > 15%: Page (data quality incident)
- Gold refresh missed SLA: Page
- Schema drift detected in Bronze: Ticket (review and update Silver transformation)
