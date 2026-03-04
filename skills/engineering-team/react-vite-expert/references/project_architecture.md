# React + Vite Project Architecture

Comprehensive guide to structuring scalable, maintainable React applications with Vite.

## Optimal Folder Structure

### Feature-Based Architecture (Recommended for Large Apps)

```
src/
├── app/                          # App-level configuration
│   ├── App.tsx                   # Root component
│   ├── router.tsx                # Route configuration
│   ├── store.ts                  # Global store setup
│   └── providers.tsx             # Context providers wrapper
│
├── features/                     # Feature modules (business logic)
│   ├── auth/
│   │   ├── components/          # Feature-specific components
│   │   │   ├── LoginForm/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── LoginForm.types.ts
│   │   │   │   ├── LoginForm.module.css
│   │   │   │   ├── LoginForm.test.tsx
│   │   │   │   └── index.ts
│   │   │   └── RegisterForm/
│   │   ├── hooks/               # Feature-specific hooks
│   │   │   ├── useAuth.ts
│   │   │   └── useLogin.ts
│   │   ├── api/                 # API calls for this feature
│   │   │   ├── authApi.ts
│   │   │   └── authApi.types.ts
│   │   ├── store/               # Feature state (Redux/Zustand)
│   │   │   ├── authSlice.ts
│   │   │   └── authSelectors.ts
│   │   ├── utils/               # Feature-specific utilities
│   │   │   └── validateCredentials.ts
│   │   └── index.ts             # Public API of the feature
│   │
│   ├── dashboard/
│   ├── products/
│   └── settings/
│
├── components/                   # Shared/reusable components
│   ├── ui/                      # Basic UI components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.types.ts
│   │   │   ├── Button.module.css
│   │   │   ├── Button.test.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── Card/
│   │
│   ├── layout/                  # Layout components
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── Sidebar/
│   │   └── PageLayout/
│   │
│   └── form/                    # Form components
│       ├── FormField/
│       ├── FormError/
│       └── FormSubmit/
│
├── hooks/                        # Shared custom hooks
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── useMediaQuery.ts
│   └── usePrevious.ts
│
├── lib/                          # Third-party integrations & setup
│   ├── axios.ts                 # Axios instance with interceptors
│   ├── queryClient.ts           # React Query client
│   ├── i18n.ts                  # i18n configuration
│   └── analytics.ts             # Analytics setup
│
├── pages/                        # Page components (routes)
│   ├── HomePage/
│   │   ├── HomePage.tsx
│   │   ├── HomePage.lazy.tsx    # Lazy-loaded wrapper
│   │   └── index.ts
│   ├── DashboardPage/
│   ├── NotFoundPage/
│   └── index.ts
│
├── services/                     # Business logic & API services
│   ├── api/                     # API clients
│   │   ├── client.ts           # Base API client
│   │   ├── endpoints.ts        # API endpoints
│   │   └── types.ts            # API types
│   ├── auth/                   # Auth service
│   │   ├── authService.ts
│   │   └── tokenService.ts
│   └── storage/                # Storage service
│       └── storageService.ts
│
├── store/                        # Global state management
│   ├── slices/                 # Redux slices or Zustand stores
│   │   ├── userSlice.ts
│   │   └── uiSlice.ts
│   ├── middleware/             # Custom middleware
│   │   └── logger.ts
│   └── index.ts                # Store configuration
│
├── types/                        # Shared TypeScript types
│   ├── api.types.ts            # API response types
│   ├── user.types.ts           # User-related types
│   ├── common.types.ts         # Common types
│   └── index.ts                # Type exports
│
├── utils/                        # Utility functions
│   ├── formatters/             # Data formatters
│   │   ├── dateFormatter.ts
│   │   ├── currencyFormatter.ts
│   │   └── numberFormatter.ts
│   ├── validators/             # Validation functions
│   │   ├── emailValidator.ts
│   │   └── formValidator.ts
│   ├── helpers/                # Helper functions
│   │   ├── arrayHelpers.ts
│   │   └── objectHelpers.ts
│   └── constants/              # Constants
│       ├── routes.ts
│       ├── apiEndpoints.ts
│       └── config.ts
│
├── assets/                       # Static assets
│   ├── images/
│   ├── icons/
│   ├── fonts/
│   └── styles/                 # Global styles
│       ├── globals.css
│       ├── variables.css
│       └── reset.css
│
├── test/                         # Test utilities
│   ├── setup.ts                # Test setup
│   ├── utils.tsx               # Testing utilities
│   ├── mocks/                  # Mock data
│   │   ├── handlers.ts         # MSW handlers
│   │   └── data.ts             # Mock data
│   └── fixtures/               # Test fixtures
│
├── main.tsx                      # Entry point
├── vite-env.d.ts                # Vite types
└── router.tsx                    # Main router (alternative to app/)
```

### Simpler Architecture (For Small-Medium Apps)

```
src/
├── components/                   # All components
│   ├── common/                  # Shared components
│   │   ├── Button/
│   │   └── Input/
│   ├── layout/                  # Layout components
│   │   ├── Header/
│   │   └── Footer/
│   └── features/                # Feature components
│       ├── Auth/
│       └── Dashboard/
│
├── hooks/                        # Custom hooks
├── pages/                        # Page components
├── services/                     # API & business logic
├── store/                        # State management
├── types/                        # TypeScript types
├── utils/                        # Utilities
├── assets/                       # Static files
├── main.tsx
└── App.tsx
```

## Naming Conventions

### Files & Folders

```
Component files:       PascalCase     → Button.tsx, UserProfile.tsx
Component folders:     PascalCase     → Button/, UserProfile/
Hook files:           camelCase      → useAuth.ts, useDebounce.ts
Utility files:        camelCase      → formatDate.ts, apiClient.ts
Type files:          camelCase      → user.types.ts, api.types.ts
Style files:         camelCase      → Button.module.css, globals.css
Test files:          match source   → Button.test.tsx, useAuth.test.ts
Story files:         match source   → Button.stories.tsx
```

### Code

```typescript
// Components: PascalCase
export const Button = () => { }
export const UserProfile = () => { }

// Hooks: camelCase with 'use' prefix
export const useAuth = () => { }
export const useDebounce = () => { }

// Constants: UPPER_SNAKE_CASE
export const API_BASE_URL = 'https://api.example.com';
export const MAX_FILE_SIZE = 5000000;

// Functions: camelCase
export const formatDate = () => { }
export const validateEmail = () => { }

// Types/Interfaces: PascalCase
export interface User { }
export type UserRole = 'admin' | 'user';

// Enums: PascalCase (name) and UPPER_SNAKE_CASE (values)
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}
```

## Component Organization Patterns

### Pattern 1: Colocation (Recommended)

Each component has its own folder with all related files:

```
Button/
├── Button.tsx              # Component implementation
├── Button.types.ts         # TypeScript types/interfaces
├── Button.module.css       # Styles (CSS Modules)
├── Button.test.tsx         # Unit tests
├── Button.stories.tsx      # Storybook stories
└── index.ts                # Public API (clean imports)
```

**Benefits:**

- Easy to find related files
- Easy to move/delete features
- Clear boundaries

### Pattern 2: Atomic Design

Organize components by complexity:

```
components/
├── atoms/          # Basic building blocks (Button, Input, Label)
├── molecules/      # Simple combinations (FormField, SearchBox)
├── organisms/      # Complex components (Header, ProductCard)
├── templates/      # Page layouts (DashboardTemplate)
└── pages/          # Complete pages (HomePage, DashboardPage)
```

### Pattern 3: Domain-Driven Design

Organize by business domains:

```
src/
├── domains/
│   ├── user/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── product/
│   └── order/
```

## State Management Strategies

### Local State (useState)

For component-specific state that doesn't need to be shared.

```typescript
// ✅ Good use cases
const [isOpen, setIsOpen] = useState(false);
const [inputValue, setInputValue] = useState('');
const [selectedTab, setSelectedTab] = useState(0);
```

### Lifted State (Props)

For sharing state between sibling components.

```typescript
// Parent manages state, children receive via props
function Parent() {
  const [user, setUser] = useState<User | null>(null);

  return (
    <>
      <UserProfile user={user} />
      <UserSettings user={user} onUpdate={setUser} />
    </>
  );
}
```

### Context API

For theme, auth, localization - low-frequency updates.

```typescript
// ✅ Good use cases
const ThemeContext = createContext<Theme>('light');
const AuthContext = createContext<AuthState>(null);
const I18nContext = createContext<I18nState>('en');

// ❌ Avoid for high-frequency updates (causes re-renders)
```

### Zustand (Recommended for most apps)

Lightweight, simple API, great performance.

```typescript
// store/userStore.ts
import { create } from 'zustand';

interface UserStore {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

// Usage in component
const user = useUserStore((state) => state.user);
const login = useUserStore((state) => state.login);
```

### Redux Toolkit

For complex apps with lots of async logic and middleware needs.

```typescript
// store/slices/userSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchUser = createAsyncThunk('user/fetch', async (id: string) => {
  const response = await api.getUser(id);
  return response.data;
});

const userSlice = createSlice({
  name: 'user',
  initialState: { user: null, loading: false },
  reducers: {
    logout: (state) => { state.user = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => { state.loading = true; })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      });
  },
});
```

### TanStack Query (React Query)

For server state (API data, caching, synchronization).

```typescript
// hooks/useUser.ts
import { useQuery } from '@tanstack/react-query';

export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => api.getUser(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Usage
const { data: user, isLoading, error } = useUser('123');
```

## Import Strategies

### Absolute Imports (Recommended)

Configure path aliases in `vite.config.ts` and `tsconfig.json`:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/utils/*": ["src/utils/*"],
      "@/types/*": ["src/types/*"]
    }
  }
}

// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
    },
  },
});

// Usage in files
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types/user.types';
```

### Barrel Exports (index.ts)

Create clean public APIs for folders:

```typescript
// components/ui/index.ts
export { Button } from './Button';
export { Input } from './Input';
export { Modal } from './Modal';

// Usage
import { Button, Input, Modal } from '@/components/ui';

// ⚠️ Warning: Can hurt tree-shaking if not careful
// Only export what's actually public API
```

### Named Exports (Recommended)

```typescript
// ✅ Good: Named exports (tree-shakeable)
export const Button = () => { };
export const Input = () => { };

import { Button } from './components';

// ❌ Avoid: Default exports (harder to refactor, not tree-shakeable)
export default Button;
import Button from './components/Button';
```

## File Size Guidelines

```
Component file:       < 250 lines (split if larger)
Hook file:           < 100 lines
Utility file:        < 150 lines
Type file:           No limit (just types)
Test file:           < 500 lines

If exceeding limits, consider:
- Breaking into smaller components
- Extracting logic to hooks
- Moving utilities to separate files
- Creating sub-components
```

## Code Organization Best Practices

### 1. Single Responsibility Principle

Each component/hook/function should do ONE thing well.

```typescript
// ❌ Bad: Component doing too much
function UserDashboard() {
  // Fetching data
  // Handling forms
  // Managing UI state
  // Rendering complex UI
}

// ✅ Good: Split responsibilities
function UserDashboard() {
  return (
    <DashboardLayout>
      <UserProfile />
      <UserStats />
      <UserActivity />
    </DashboardLayout>
  );
}
```

### 2. Composition Over Inheritance

Use composition to build complex components.

```typescript
// ✅ Composition pattern
<Card>
  <CardHeader>
    <CardTitle>User Profile</CardTitle>
  </CardHeader>
  <CardBody>
    <UserInfo />
  </CardBody>
</Card>
```

### 3. Container/Presentational Pattern

Separate logic from presentation.

```typescript
// Presentational (dumb component)
export const UserList = ({ users, onUserClick }) => (
  <ul>
    {users.map(user => (
      <li key={user.id} onClick={() => onUserClick(user)}>
        {user.name}
      </li>
    ))}
  </ul>
);

// Container (smart component)
export const UserListContainer = () => {
  const { data: users } = useUsers();
  const navigate = useNavigate();

  const handleUserClick = (user) => {
    navigate(`/user/${user.id}`);
  };

  return <UserList users={users} onUserClick={handleUserClick} />;
};
```

### 4. Custom Hooks for Logic Reuse

Extract reusable logic into custom hooks.

```typescript
// hooks/useUser.ts
export const useUser = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId).then(setUser).finally(() => setLoading(false));
  }, [userId]);

  return { user, loading };
};

// Usage in multiple components
const { user, loading } = useUser('123');
```

## Decision Matrix

### When to Create a New Feature Module?

- ✅ Has 3+ components
- ✅ Has its own state management
- ✅ Has dedicated API endpoints
- ✅ Represents a distinct business capability

### When to Use Context vs. Props?

- **Props**: Default choice, explicit, type-safe
- **Context**: Avoiding prop drilling (4+ levels), theme, auth, i18n

### When to Use Redux vs. Zustand?

- **Zustand**: Most apps, simpler API, less boilerplate
- **Redux**: Complex apps, need middleware, dev tools, time-travel debugging

### When to Split a Component?

- 🚩 File > 250 lines
- 🚩 Multiple responsibilities
- 🚩 Reusable parts
- 🚩 Hard to test
- 🚩 Poor performance (needs memo)
