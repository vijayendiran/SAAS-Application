# Migration to Logto (Centralized Auth)

## Overview
The backend has been migrated to use the official Logto Express SDK (`@logto/express`) for authentication.
This setup uses session-based authentication (cookies) which is more secure and handles the OIDC flow automatically.

## Changes Implemented

1.  **Dependencies**: Added `@logto/express`, `express-session`, `cookie-parser`.
2.  **Configuration**: 
    -   Added `src/config/logto.config.js`.
    -   Updated `.env` with Logto-specific variables.
3.  **Server Setup (`server.js`)**:
    -   Added `cookie-parser` and `express-session` middleware.
    -   Mounted `handleAuthRoutes(logtoConfig)` at `/api/v1/auth`.
    -   This automatically provides:
        -   `/api/v1/auth/sign-in`
        -   `/api/v1/auth/sign-up`
        -   `/api/v1/auth/sign-out`
        -   `/api/v1/auth/callback`
4.  **Middleware (`auth.middleware.js`)**:
    -   Replaced manual JWT verification with `withLogto(logtoConfig)`.
    -   Added `requireAuth` adapter to map Logto's `req.user` to:
        -   `req.userId` (from `sub`)
        -   `req.userTenantId` (from custom claim `tenant_id`)
        -   `req.role` (from `roles` array)
5.  **Routes**:
    -   `userRoutes.js` uses the new `authMiddleware` and `requireAuth`.
    -   `auth.routes.js` provides `/api/v1/auth/me` to fetch current user info.

## Usage

### 1. Frontend Integration
-   **Login**: Redirect browser to `http://localhost:3000/api/v1/auth/sign-in`.
-   **Logout**: Redirect browser to `http://localhost:3000/api/v1/auth/sign-out`.
-   **Callback**: Logto redirects back to `/api/v1/auth/callback` which sets the session cookie.
-   **API Calls**: The browser will automatically send the session cookie. No `Authorization` header needed (unless configured otherwise).

### 2. Environment Variables
Make sure `.env` has:
```bash
LOGTO_ENDPOINT="https://t18kno.logto.app/"
LOGTO_APP_ID="sa9m4tpqk5tid2mci4dhj"
LOGTO_APP_SECRET="..."
LOGTO_BASE_URL="http://localhost:3000"
LOGTO_COOKIE_SECRET="complex_random_string..."
```

## Creating Tenants & Roles
In your Logto Console:
1.  Navigate to **User Management**.
2.  Add `tenant_id` to **Custom Data** for users or use Logto's Organizations feature (maps to `urn:logto:scope:organizations`).
    -   *Note*: The current code assumes `req.user.claims.tenant_id` or `custom_data.tenant_id`. You may need to adjusting `requireAuth` if you use Logto Organizations.
