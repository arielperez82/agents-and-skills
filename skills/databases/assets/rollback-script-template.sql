-- ============================================
-- ROLLBACK SCRIPT TEMPLATE
-- ============================================
-- Migration: [TIMESTAMP]_[name].sql
-- 
-- To rollback this migration, execute the statements below.
-- Always test rollback in development environment first.
--
-- Rollback order (reverse of creation order):
-- 1. Drop triggers (before functions they depend on)
-- 2. Drop functions
-- 3. Drop indexes
-- 4. Drop tables (if applicable)
-- 5. Drop types/enums (if applicable)
-- ============================================

-- Drop triggers (in reverse order of creation)
DROP TRIGGER IF EXISTS [trigger_name] ON [table_name];
-- ... repeat for all triggers ...

-- Drop functions (in reverse order of creation)
DROP FUNCTION IF EXISTS [function_name]([parameters]);
-- ... repeat for all functions ...

-- Drop indexes (if created in this migration)
DROP INDEX IF EXISTS [index_name];
-- ... repeat for all indexes ...

-- Drop tables (if created in this migration)
-- WARNING: This will delete all data in the table!
-- DROP TABLE IF EXISTS [table_name] CASCADE;
-- ... repeat for all tables ...

-- Drop types/enums (if created in this migration)
-- DROP TYPE IF EXISTS [type_name] CASCADE;
-- ... repeat for all types ...

-- ============================================
-- VERIFICATION
-- ============================================
-- After rollback, verify:
-- 1. Run: supabase db diff (should show migration changes removed)
-- 2. Run: pnpm test (all tests should pass)
-- 3. Check Studio: Verify objects are removed
-- ============================================
