# Data Architecture Selection Tree

Decision framework for choosing between data architecture patterns based on data characteristics, organizational structure, and workload requirements.

## Primary Decision Tree

```
What data types do you have?
  |
  |-- Structured only
  |     --> Data Warehouse
  |
  |-- Mixed (structured + semi-structured + unstructured)
        |
        |-- Do you need SQL analytics on all data?
        |     YES --> Data Lakehouse
        |
        |-- Is data science/ML the primary use case?
        |     YES --> Data Lake
        |
        |-- Is your organization large with autonomous domain teams?
              YES --> Data Mesh
```

## Architecture Characteristics

### Data Warehouse

- **Schema**: Structured, schema-on-write
- **Data types**: Primarily structured (tables, rows, columns)
- **Governance**: Centralized, strong governance by design
- **Query**: SQL-based analytics, BI reporting
- **Architecture**: Centralized single source of truth
- **Technologies**: Snowflake, Amazon Redshift, Google BigQuery, Azure Synapse Analytics

### Data Lake

- **Schema**: Schema-on-read, flexible structure
- **Data types**: All formats (structured, semi-structured, unstructured)
- **Storage**: Raw data preserved in native format
- **Query**: SQL (Athena, Spark SQL), programmatic (PySpark, Pandas)
- **Risk**: "Data swamp" without proper governance and cataloging
- **Technologies**: Amazon S3 + Athena/Glue, Azure Data Lake Storage + Synapse, HDFS + Hive

### Data Lakehouse

- **Schema**: Schema enforcement on write with schema evolution support
- **Data types**: All formats with ACID transactions on data lake storage
- **Query**: Supports both BI/SQL analytics and ML/data science workloads
- **Advantage**: Combines warehouse reliability with lake flexibility
- **Technologies**: Databricks (Delta Lake), Apache Iceberg, Apache Hudi

### Data Mesh

- **Ownership**: Domain-oriented, data owned by domain teams
- **Data model**: Data as a product (discoverable, trustworthy, self-describing)
- **Platform**: Self-serve data platform for domain teams
- **Governance**: Federated computational governance (global standards, domain autonomy)
- **Technologies**: Platform-agnostic (organizational pattern, not technology pattern)

## Processing Pattern Decision Tree

```
What are your latency requirements?
  |
  |-- Real-time (sub-second to seconds)
  |     |
  |     |-- Do you also need historical reprocessing?
  |     |     YES --> Kappa Architecture (stream-only, reprocess from log)
  |     |     NO  --> Pure Streaming (Kafka + Flink/Spark Streaming)
  |     |
  |
  |-- Near-real-time (minutes)
  |     --> Micro-batch (Spark Structured Streaming, small batch intervals)
  |
  |-- Batch (hours to daily)
        --> Batch Processing (Airflow + Spark/dbt, scheduled runs)
```

### Lambda vs Kappa Architecture

| Aspect | Lambda | Kappa |
|---|---|---|
| Processing paths | Parallel batch + stream | Stream only |
| Complexity | High (maintain two codebases) | Lower (single processing path) |
| Reprocessing | Via batch layer | Replay from event log |
| Consistency | Merge batch + stream results | Single source of truth |
| When to use | Legacy systems with existing batch | Greenfield with event log (Kafka) |
| When to avoid | Greenfield (unnecessary complexity) | When event log retention is impractical |

## Data Mesh Readiness Criteria

### Prerequisites (all required)

- Organization has 50+ engineers
- Multiple autonomous domain teams exist
- Central data team is a demonstrated bottleneck
- Domain expertise is needed to model and maintain data correctly
- Platform engineering capability exists or can be built

### When to Avoid Data Mesh

- Small team (< 50 engineers)
- Simple data architecture needs
- No platform engineering capability
- Unclear domain boundaries
- Organization lacks data product thinking maturity

## Pipeline Pattern Decision Tree

```
Where should transformation happen?
  |
  |-- Before loading (constrained target, regulatory requirements)
  |     --> ETL (Extract-Transform-Load)
  |         Tools: Informatica, Talend, SSIS
  |         Scaling: Limited by transformation engine capacity
  |
  |-- After loading (cloud warehouse, preserve raw data)
        --> ELT (Extract-Load-Transform)
            Tools: dbt, Snowflake SQL, BigQuery SQL
            Scaling: Elastic with target system compute
```

### Pipeline Design Principles

- **Idempotency**: Re-running a pipeline produces the same result (use MERGE/upsert, not INSERT)
- **Incremental processing**: Process only new/changed data (use watermarks, change data capture)
- **Schema evolution**: Handle added/removed columns gracefully (use schema registry)
- **Data quality gates**: Validate data between pipeline stages (null rates, row counts, value ranges)
- **Observability**: Log pipeline metrics (rows processed, duration, errors, data freshness)

## Warehouse Schema Selection

```
What is the primary use case?
  |
  |-- BI dashboards and standard reporting
  |     --> Star Schema
  |         Central fact table + denormalized dimension tables
  |         Optimized for query performance
  |
  |-- Storage efficiency matters more than query speed
  |     --> Snowflake Schema
  |         Normalized dimensions (dimension tables reference other dimensions)
  |         Reduces storage but increases JOIN complexity
  |
  |-- Building methodology
        |
        |-- Want quick wins, department-level analytics
        |     --> Kimball (Bottom-Up)
        |         Build data marts first, integrate later
        |         Star schema oriented, business-process driven
        |
        |-- Need enterprise single source of truth from day one
              --> Inmon (Top-Down)
                  Build enterprise data warehouse first, derive data marts
                  Normalized (3NF) enterprise model
```

## Scaling Decision Guide

```
Current load exceeding single server?
  |
  NO --> Optimize queries and indexes first
  |
  YES --> Is it read-heavy?
    |
    YES --> Add read replicas
    |       (Replication lag is the tradeoff: eventual consistency for reads)
    |
    NO (write-heavy) --> Is data naturally partitionable?
      |
      YES --> Partition within server first
      |       (Range, list, or hash partitioning)
      |       Still not enough? --> Shard across servers
      |
      NO --> Consider write-optimized databases
              (Cassandra, DynamoDB)
```

### Shard Key Selection Criteria

The most impactful decision when sharding:
- **High cardinality**: Many distinct values for even distribution
- **Even access frequency**: Avoid hot shards from skewed access patterns
- **Query alignment**: Most queries should target a single shard
- **Avoid monotonically increasing keys**: Auto-increment IDs cause hot spots

### Sharding Challenges

- Cross-shard queries require scatter-gather
- Distributed transactions (2PC) are complex and slow
- Resharding is operationally expensive
- Application complexity increases significantly
