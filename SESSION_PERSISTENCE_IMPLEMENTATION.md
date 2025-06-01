# Session Persistence and Authentication State Management

This document outlines the comprehensive session persistence and authentication state management implementation for the PetSmart admin dashboard.

## 🎯 Overview

The implementation provides:
- ✅ Automatic session validation on app initialization
- ✅ Redirect to intended destination after login
- ✅ Session expiration handling with graceful redirects
- ✅ Persistent sidebar state across sessions
- ✅ Loading states during authentication checks
- ✅ Integration with existing Vue Router SPA navigation

## 🔧 Implementation Details

### 1. Enhanced Auth Store (`src/stores/auth.ts`)

#### New Features Added:
- **Session Validation**: `hasValidSession` computed property checks token expiration
- **Redirect Management**: `redirectUrl` state and helper functions for intended destination tracking
- **Session Expiration Handling**: `sessionExpired` flag and `handleSessionExpiration()` method
- **Improved Initialization**: Better error handling and session validation during startup

#### Key Functions:

```typescript
// Set redirect URL for post-login navigation
setRedirectUrl(url: string): void

// Get and clear redirect URL (returns '/dashboard' as default)
getAndClearRedirectUrl(): string

// Handle session expiration gracefully
handleSessionExpiration(): Promise<void>

// Validate current session expiration
hasValidSession: ComputedRef<boolean>
```

### 2. Enhanced Router Guards (`src/router/index.ts`)

#### Improved Navigation Logic:
- **Intended Destination Tracking**: Saves the URL user was trying to access before redirect to login
- **Session Expiration Detection**: Redirects to login when session expires
- **Admin Privilege Validation**: Ensures authenticated users have admin privileges
- **Guest Route Handling**: Redirects authenticated users away from login page

#### Flow:
1. Check if route requires authentication
2. If user not authenticated → save intended URL → redirect to login
3. If user authenticated but not admin → save intended URL → redirect to login
4. If accessing guest-only route while authenticated → redirect to intended destination
5. If session expired → save current URL → redirect to login

### 3. Enhanced Login Component (`src/views/auth/LoginView.vue`)

#### Post-Login Redirect:
- Uses `authStore.getAndClearRedirectUrl()` to get intended destination
- Redirects to saved URL or defaults to `/dashboard`
- Uses `router.replace()` to avoid adding login to browser history

### 4. App-Level Loading State (`src/App.vue`)

#### Loading Screen:
- Shows branded loading screen during auth initialization
- Prevents flash of unauthenticated content
- Smooth transition to main app once auth is resolved

### 5. Global Error Handling (`src/main.ts`)

#### Session Expiration Detection:
- Global error handler catches authentication-related errors
- Automatically triggers session expiration handling
- Redirects to login when JWT/session errors occur

## 🔄 User Experience Flow

### First Visit (No Session)
1. App loads → Shows loading screen
2. Auth store initializes → No session found
3. Router guard redirects to login
4. User logs in → Redirected to dashboard

### Returning User (Valid Session)
1. App loads → Shows loading screen
2. Auth store initializes → Valid session found
3. Admin status verified → User proceeds to intended page
4. Sidebar state restored from localStorage

### Session Expiration
1. User navigating → Session expired detected
2. Current URL saved as intended destination
3. User redirected to login with session expired flag
4. After re-login → User returned to original page

### Intended Destination Preservation
1. User tries to access `/users/123` without authentication
2. URL saved in sessionStorage as redirect target
3. User redirected to login
4. After successful login → User redirected to `/users/123`
5. Sidebar state and scroll position preserved

## 🛡️ Security Features

### Session Validation
- Token expiration checking using `expires_at` timestamp
- Automatic session cleanup on expiration
- Admin privilege verification on every route

### Storage Security
- Redirect URLs stored in sessionStorage (cleared on tab close)
- Supabase handles secure token storage in localStorage
- No sensitive data exposed in client-side storage

## 🔧 Integration with Existing Features

### Sidebar State Persistence
- Works seamlessly with existing `useSidebarStore`
- Sidebar state preserved across login/logout cycles
- Scroll position maintained during navigation

### SPA Navigation
- No page reloads during authentication flows
- Smooth transitions between authenticated/unauthenticated states
- Keep-alive components maintain state during navigation

## 🧪 Testing the Implementation

### Test Scenarios:

1. **Fresh Login**:
   - Visit any protected route while logged out
   - Should redirect to login, then back to original route

2. **Session Persistence**:
   - Login and close browser
   - Reopen → Should remain logged in and redirect to dashboard

3. **Session Expiration**:
   - Login and wait for token expiration (or manually expire)
   - Navigate → Should redirect to login with intended destination preserved

4. **Admin Validation**:
   - Login with non-admin user
   - Should be signed out and redirected to login

5. **Sidebar State**:
   - Adjust sidebar (expand/collapse, scroll position)
   - Navigate between pages → State should persist
   - Logout and login → State should be restored

## 📝 Configuration

### Environment Variables Required:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Admin User Setup:
Ensure admin users exist in the `admin_users` table with `is_active = true`.

## 🚀 Benefits

1. **Seamless UX**: Users are automatically redirected to their intended destination
2. **State Preservation**: Sidebar and component states persist across sessions
3. **Security**: Proper session validation and admin privilege checking
4. **Performance**: Efficient initialization with loading states
5. **Reliability**: Graceful handling of session expiration and errors

This implementation ensures a professional, secure, and user-friendly authentication experience that integrates perfectly with the existing PetSmart admin dashboard architecture.
