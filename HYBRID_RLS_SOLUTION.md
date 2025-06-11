# Hybrid RLS Solution - Usage Guide

## Overview
We now have a **hybrid approach** that solves the authentication issues while maintaining RLS bypass for data operations:

- **`createClient()`** - Uses anonymous key for authentication operations (login, signup, auth state)
- **`createServiceClient()`** - Uses service role key for data operations (bypasses RLS)

## Usage Examples

### 1. Authentication Operations (Use createClient)
```typescript
import { createClient } from '@/utils/supabase/client';

// Login, signup, password reset, etc.
const supabase = createClient();

// ✅ This will work - uses anonymous key
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});
```

### 2. Data Operations (Use createServiceClient)
```typescript
import { createServiceClient } from '@/utils/supabase/client';

// Reading/writing data without RLS restrictions
const supabase = createServiceClient();

// ✅ This will work - bypasses all RLS
const { data, error } = await supabase
  .from('users')
  .select('*')
  .limit(10);
```

### 3. Server-Side Operations
```typescript
import { createClient, createServiceClient } from '@/utils/supabase/server';

// For auth operations
const authClient = await createClient();
const user = await authClient.auth.getUser();

// For data operations  
const dataClient = await createServiceClient();
const userData = await dataClient.from('users').select('*');
```

## Migration Guide for Existing Code

### Before (causing auth errors):
```typescript
import { createClient } from '@/utils/supabase/client';
const supabase = createClient(); // Was using service role key for everything
```

### After (fixed):
```typescript
// For authentication
import { createClient } from '@/utils/supabase/client';
const authSupabase = createClient(); // Uses anonymous key

// For data access
import { createServiceClient } from '@/utils/supabase/client';
const dataSupabase = createServiceClient(); // Uses service role key
```

## Current Status
✅ **Authentication**: Works correctly with anonymous key  
✅ **Data Access**: Bypasses RLS with service role key  
✅ **No RLS Restrictions**: Database RLS is disabled  
✅ **Hybrid Approach**: Best of both worlds  

## Implementation Status
- ✅ Client configurations updated
- ✅ Server configurations updated  
- ✅ Middleware configurations updated
- ✅ Database RLS disabled
- ✅ Documentation created

Your application should now work correctly for both authentication and data operations!
