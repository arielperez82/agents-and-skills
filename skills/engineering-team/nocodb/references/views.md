# NocoDB View Creation Guide

View creation via UI, relationship auto-detection, and backup/restore procedures.

## View Creation Overview

For NocoDB v0.255.0, view creation is done **via UI** (not API). NocoDB has APIs and automation patterns exist in the ecosystem, but whether specific view operations are supported programmatically depends on version and endpoints.

**This guide uses manual UI steps as the reliable approach for v0.255.0.**

**Reference:** NocoDB documentation for view creation: https://nocodb.com/docs/product-docs/view

## Prerequisites

### Foreign Key Constraints

NocoDB automatically detects relationships **ONLY if Foreign Key constraints exist** in the SQL schema.

**Verify Foreign Keys:**

```sql
-- Check if FK exists
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public';
```

**If FK missing, add it:**

```sql
-- Example: thread.contact_id → contact.id
ALTER TABLE thread
ADD CONSTRAINT thread_contact_id_fkey
FOREIGN KEY (contact_id) REFERENCES contact(id);
```

**Cannot create "virtual" relationships** in NocoDB without SQL-level FK constraints.

## View Creation Workflows

### Task Table View (Pending Tasks)

**Purpose:** Show pending tasks with filters and sorting.

**Steps:**

1. NocoDB UI → Navigate to `task` table
2. Create new Grid view (or use default view)
3. Configure columns: Show all task columns
   - `id`, `subject_type`, `subject_id`, `type`, `status`, `action_item`, `due_at`, `assigned_to`, etc.
4. Add filter: `status = 'pending'` (shows only pending tasks)
5. Configure sort: `due_at ASC` (oldest first)
6. Save view (name it "Pending Tasks" or similar)

**Validation:**

- View shows all task columns correctly
- Filter works: Only pending tasks visible when filter applied
- Sort works: Tasks ordered by `due_at` ascending
- Can view task records in NocoDB UI

### Entity Table View (Entities by Status)

**Purpose:** Show entities grouped by status (Kanban-style view).

**Steps:**

1. NocoDB UI → Navigate to `entity` table
2. Create new Grid view (or use default view)
3. Configure columns: Show all entity columns
   - `id`, `name`, `type`, `website`, `status`, `status_source`, `notes`, etc.
4. Configure group by: `status` (shows entities grouped by status)
   - Creates Kanban-style view if supported
5. Configure sort: `updated_at DESC` (most recent first)
6. Save view (name it "Entities by Status" or similar)

**Validation:**

- View shows all entity columns correctly
- Group by works: Entities grouped by status value
- Sort works: Within each group, entities ordered by `updated_at` descending
- Can view entity records in NocoDB UI

### Thread Table View (Threads Needing Attention)

**Purpose:** Show threads with related contact info and filters.

**Prerequisites:**

- Verify Foreign Key: `thread.contact_id` has `REFERENCES contact(id)` constraint
- If missing: Add FK constraint to schema

**Steps:**

1. NocoDB UI → Navigate to `thread` table
2. Create new Grid view (or use default view)
3. Configure columns: Show all thread columns
   - `id`, `contact_id`, `subject`, `state`, `gmail_thread_id`, `last_inbound_at`, `last_outbound_at`, `follow_up_count`, etc.
4. **Relationship verification:** NocoDB should auto-detect `thread.contact_id → contact.id` relationship (if FK exists)
   - If relationship not visible: Verify Foreign Key constraint exists in Supabase schema
   - Configure link column: Show contact name/email from related Contact record
5. Add filter: `state IN ('awaiting_response', 'follow_up_due')` (shows threads needing attention)
6. Configure sort: `last_inbound_at DESC NULLS LAST` (most recent activity first)
7. Save view (name it "Threads Needing Attention" or similar)

**Validation:**

- View shows all thread columns correctly
- Relationship works: Contact name/email visible from linked Contact table
- Filter works: Only threads with specified states visible
- Sort works: Threads ordered by `last_inbound_at` descending (NULLs last)
- Can view thread records with contact details in NocoDB UI

### Contact Table View (Unmatched Contacts)

**Purpose:** Show contacts with linked entities and email addresses.

**Prerequisites:**

- Verify Foreign Keys:
  - `contact.entity_id` has `REFERENCES entity(id)` constraint
  - `contact_account.contact_id` has `REFERENCES contact(id) ON DELETE CASCADE` constraint
- If missing: Add FK constraints to schema

**Steps:**

1. NocoDB UI → Navigate to `contact` table
2. Create new Grid view (or use default view)
3. Configure columns: Show all contact columns
   - `id`, `entity_id`, `name`, `role`, `match_status`, `match_confidence`, `notes`, etc.
4. **Relationship verification:** NocoDB should auto-detect relationships (if FKs exist):
   - `contact.entity_id → entity.id` relationship (shows entity name)
   - `contact_account.contact_id → contact.id` relationship (shows email addresses)
   - If relationships not visible: Verify Foreign Key constraints exist in Supabase schema
   - Configure link columns: Show entity name and email addresses from related tables
5. Add filter: `match_status = 'pending_review'` (shows unmatched contacts)
6. Save view (name it "Unmatched Contacts" or similar)

**Validation:**

- View shows all contact columns correctly
- Relationships work: Entity name and email addresses visible from linked tables
- Filter works: Only contacts with `match_status = 'pending_review'` visible
- Can view contact records with entity and email info in NocoDB UI

## Relationship Auto-Detection

### How It Works

1. **NocoDB Introspects Schema:**
   - Reads `pg_catalog` to discover FK constraints
   - Requires session mode (port 5432), not transaction mode (port 6543)
   - Schema introspection happens on connection

2. **Automatic Relationship Creation:**
   - NocoDB creates relationship links automatically
   - Shows related records in views
   - Enables navigation between related tables

3. **Link Columns:**
   - Configure link columns to show related data
   - Example: Show contact name/email from linked Contact table in Thread view

### Troubleshooting Relationships

**If relationships don't appear:**

1. **Verify FK Constraints:**

   ```sql
   -- Check FK exists
   SELECT * FROM information_schema.table_constraints
   WHERE constraint_type = 'FOREIGN KEY'
   AND table_name = 'thread';
   ```

2. **Check Connection Mode:**
   - Must use session mode (port 5432)
   - Transaction mode (port 6543) incompatible with schema introspection

3. **Restart NocoDB:**
   - Restart to refresh schema introspection
   - `docker-compose restart nocodb`

4. **Verify pg_catalog Access:**
   - Connection must have `pg_catalog` read access
   - Session mode provides this, transaction mode may not

## View Configuration Backup/Restore

### Backup Strategy

**NocoDB does not support view JSON export/import as of v0.255.0.**

**Backup Methods:**

1. **Metadata DB Backup (Recommended):**

   ```bash
   docker exec nocodb_metadata pg_dump -U nocodb nocodb_meta > backups/nocodb-metadata-$(date +%Y%m%d).sql
   ```

   - Includes all view configurations
   - Full restore includes all views

2. **Documentation Fallback:**
   - Store view definitions as markdown checklists in `docs/nocodb-views/`
   - Example: `docs/nocodb-views/task-pending-view.md`
   - Include: Column configuration, filters, sorts, relationships, group-by settings

### View Definition Documentation Template

**File:** `docs/nocodb-views/{view-name}.md`

```markdown
# {View Name}

**Table:** {table_name}
**View Type:** Grid/Kanban/Form/etc.

## Configuration

### Columns

- {column1} (visible/hidden)
- {column2} (visible/hidden)
- ...

### Filters

- {filter_condition}
- ...

### Sort

- {column} {ASC/DESC}
- ...

### Group By

- {column} (if applicable)

### Relationships

- {table1}.{column} → {table2}.{column} (if applicable)

## Recreation Steps

1. Navigate to {table} table
2. Create new {view_type} view
3. Configure columns: {list}
4. Add filter: {condition}
5. Configure sort: {column} {direction}
6. Save view as "{view_name}"
```

### Restore Process

**Option 1: Restore Metadata DB (Full Restore)**

```bash
# Restore from backup
docker exec -i nocodb_metadata psql -U nocodb nocodb_meta < backups/nocodb-metadata-20260108.sql

# Restart NocoDB
docker-compose restart nocodb
```

**Option 2: Manual Recreation**

- Use markdown checklists from `docs/nocodb-views/`
- Follow recreation steps in each view definition file
- Verify relationships after recreation

## View Validation

### End-to-End Validation

After creating all views:

1. **Test Data:**
   - Ensure test data exists in database (or create via NocoDB UI)

2. **View Validation:**
   - Task view shows pending tasks correctly
   - Entity view groups by status correctly
   - Thread view shows contact relationships correctly
   - Contact view shows entity relationships correctly

3. **Filter/Sort Validation:**
   - All filters work as expected
   - All sorts work as expected

4. **Relationship Navigation:**
   - Can navigate between related records
   - Example: Thread → Contact → Entity

## Best Practices

1. **Always Define Foreign Keys:** FK constraints required for relationship auto-detection
2. **Document View Configurations:** Store view definitions as markdown checklists
3. **Use Descriptive Names:** Name views clearly (e.g., "Pending Tasks", not "View 1")
4. **Test Relationships:** Verify relationships work after view creation
5. **Backup Regularly:** Backup metadata DB regularly (includes all views)
6. **Version Control:** Commit view definition markdown files to version control

## References

- **NocoDB Views Documentation:** https://nocodb.com/docs/product-docs/view
- **NocoDB Relationships:** https://nocodb.com/docs/product-docs/tables/table-details#relationships
