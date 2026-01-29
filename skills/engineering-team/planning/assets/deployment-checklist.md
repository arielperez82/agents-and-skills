# Deployment Checklist Template

Use this template for database migrations and other deployments.

## Pre-Deployment

- [ ] Local Supabase instance running: `supabase status`
- [ ] Migration tested locally: `supabase db reset`
- [ ] All tests passing: `pnpm test`
- [ ] No schema drift: `supabase db diff` (should show no changes)
- [ ] Rollback script reviewed and tested
- [ ] TypeScript types will be generated after deployment

## Deployment Steps

1. **Apply migration**: `supabase db push`
2. **Verify migration applied**: `supabase db diff` (should show no changes)
3. **Run tests**: `pnpm test`
4. **Verify in Studio**: Check tables/triggers/functions exist and are accessible
5. **Generate TypeScript types**: `supabase gen types typescript --local > src/types/database.types.ts`
6. **Commit types**: `git add src/types/database.types.ts && git commit -m "chore: update types after migration [name]"`

## Post-Deployment Verification

- [ ] Migration applied successfully
- [ ] All tests passing
- [ ] Types generated and committed
- [ ] No errors in application logs
- [ ] RLS policies working (if applicable)
- [ ] Indexes created and verified
- [ ] Triggers/functions working as expected

## Rollback Plan

If deployment fails:

1. **Stop deployment**: Cancel any in-progress operations
2. **Review error logs**: Identify root cause
3. **Execute rollback**: Run rollback section from migration file
4. **Verify rollback**: `supabase db diff` should show migration changes removed
5. **Document issue**: Add to LEARNINGS.md or create issue

## Notes

- [Add any project-specific notes or considerations]
