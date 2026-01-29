/**
 * Security Test Patterns for Database Schema Migrations
 * 
 * Use these patterns when testing RLS (Row Level Security) and access control.
 * Copy and adapt these patterns for your specific tables and policies.
 */

import { createClient } from '@supabase/supabase-js';

// Create clients for different access levels
const anonClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
const serviceClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

/**
 * Pattern 1: Test RLS blocks anon access (read operations)
 */
export const testAnonReadBlocked = async (tableName: string) => {
  it(`blocks anon client from reading ${tableName}`, async () => {
    const { data, error } = await anonClient
      .from(tableName)
      .select('id')
      .limit(1);
    
    // RLS blocks by returning empty result set or error
    if (error) {
      expect(error?.code).toBe('42501'); // Insufficient privilege
      expect(data).toBeNull();
    } else {
      expect(data).toEqual([]); // RLS blocks by returning no rows
    }
  });
};

/**
 * Pattern 2: Test RLS blocks anon access (write operations - INSERT)
 */
export const testAnonInsertBlocked = async (tableName: string, testData: Record<string, unknown>) => {
  it(`blocks anon client from inserting into ${tableName}`, async () => {
    const { error } = await anonClient
      .from(tableName)
      .insert(testData);
    
    expect(error).not.toBeNull();
    expect(error?.code).toBe('42501'); // Insufficient privilege
  });
};

/**
 * Pattern 3: Test RLS blocks anon access (write operations - UPDATE)
 */
export const testAnonUpdateBlocked = async (tableName: string, testId: string) => {
  it(`blocks anon client from updating ${tableName}`, async () => {
    const { error } = await anonClient
      .from(tableName)
      .update({ /* some field */ })
      .eq('id', testId);
    
    expect(error).not.toBeNull();
    expect(error?.code).toBe('42501'); // Insufficient privilege
  });
};

/**
 * Pattern 4: Test RLS blocks anon access (write operations - DELETE)
 */
export const testAnonDeleteBlocked = async (tableName: string, testId: string) => {
  it(`blocks anon client from deleting from ${tableName}`, async () => {
    const { error } = await anonClient
      .from(tableName)
      .delete()
      .eq('id', testId);
    
    expect(error).not.toBeNull();
    expect(error?.code).toBe('42501'); // Insufficient privilege
  });
};

/**
 * Pattern 5: Test service role can access (read)
 */
export const testServiceRoleCanRead = async (tableName: string) => {
  it(`allows service role to read ${tableName}`, async () => {
    const { data, error } = await serviceClient
      .from(tableName)
      .select('id')
      .limit(1);
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
};

/**
 * Pattern 6: Test service role can write (INSERT)
 */
export const testServiceRoleCanInsert = async (tableName: string, testData: Record<string, unknown>) => {
  it(`allows service role to insert into ${tableName}`, async () => {
    const { data, error } = await serviceClient
      .from(tableName)
      .insert(testData)
      .select()
      .single();
    
    // Should succeed or fail for business logic reasons, not RLS
    expect(error?.code).not.toBe('42501');
    
    // Cleanup if successful
    if (data?.id) {
      await serviceClient.from(tableName).delete().eq('id', data.id);
    }
  });
};

/**
 * Complete security test suite example
 */
export const createSecurityTestSuite = (tableName: string, testData: Record<string, unknown>, testId: string) => {
  describe(`RLS security: ${tableName}`, () => {
    describe('anon client access', () => {
      testAnonReadBlocked(tableName);
      testAnonInsertBlocked(tableName, testData);
      testAnonUpdateBlocked(tableName, testId);
      testAnonDeleteBlocked(tableName, testId);
    });

    describe('service role access', () => {
      testServiceRoleCanRead(tableName);
      testServiceRoleCanInsert(tableName, testData);
    });
  });
};

/**
 * Usage example:
 * 
 * describe('System Schema Security', () => {
 *   createSecurityTestSuite(
 *     'configuration',
 *     { follow_up_intervals: [1, 2, 3] },
 *     'config-123'
 *   );
 * 
 *   createSecurityTestSuite(
 *     'audit_log',
 *     { actor: 'test', action_type: 'test', entity_type: 'test', entity_id: '123' },
 *     'audit-123'
 *   );
 * });
 */
