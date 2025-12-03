# Backend-Next.js Integration Guide

## Current Backend API Structure

### Response Format
The backend uses `BaseMaper` format:
```typescript
{
  title: string;
  message: string;
  error: boolean;
  statusCode: number;
  data: {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: Date;
    refreshTokenExpiresAt: Date;
    user: {
      id: string;
      email: string | null;
      isGuest: boolean;
      provider: string;
    }
  }
}
```

### Endpoints

#### 1. POST `/auth/login`
**Request Body:**
```typescript
{
  method: "email" | "firebase" | "code" | "guest";
  payload: {
    // For email:
    email: string;
    password: string;
    // For firebase:
    idToken: string;
    // For code:
    code: string;
    // For guest:
    isGuest: boolean;
  };
  device?: {
    id: string;
    platform: "android" | "ios" | "macOS" | "windows" | "tv" | "linux" | "web";
  };
}
```

**Response:**
```typescript
{
  title: "Login Success",
  message: "Your login has been successful",
  error: false,
  statusCode: 200,
  data: {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: Date;
    refreshTokenExpiresAt: Date;
    user: { id, email, isGuest, provider };
  }
}
```

#### 2. POST `/auth/register`
**Request Body:**
```typescript
{
  method: "email" | "firebase";
  payload: {
    // For email:
    email: string;
    password: string;
    name: string;
    // For firebase:
    idToken: string;
  };
  device?: DeviceDto;
}
```

#### 3. GET `/auth/me`
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```typescript
{
  title: "User Information",
  message: "Your information has been successfully retrieved",
  error: false,
  statusCode: 200,
  data: {
    id: string;
    email: string | null;
    isGuest: boolean;
    provider: string;
  }
}
```

## Required Next.js Updates

### 1. Update Login Action (`lib/actions/auth-actions.ts`)

**Current Issue:** Next.js expects simple `{ email, password, remember_me }` format, but backend expects method-based structure.

**Required Changes:**

```typescript
"use server";

import { redirect } from "next/navigation";
import { createServerApiClient } from "@/lib/api-services/server-api";
import { setSSOToken, setSSORefreshToken } from "@/lib/utils/cookie";

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export async function loginAction(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  try {
    const apiClient = createServerApiClient();

    // Update to match backend's method-based structure
    const response = await apiClient.post<{
      accessToken: string;
      refreshToken: string;
      accessTokenExpiresAt: string;
      refreshTokenExpiresAt: string;
      user: {
        id: string;
        email: string | null;
        isGuest: boolean;
        provider: string;
      };
    }>("/auth/login", {
      method: "email",
      payload: {
        email: credentials.email,
        password: credentials.password,
      },
      // Optional: Add device info if needed
      // device: {
      //   id: "web-browser",
      //   platform: "web",
      // },
    });

    // Check if response is successful
    const respAny = response as any;
    const isSuccess = respAny && respAny.error === false && respAny.statusCode === 200;
    
    if (isSuccess) {
      const data = respAny.data ?? {};
      
      // Extract tokens from data.accessToken and data.refreshToken
      const token = data.accessToken || null;
      const refreshToken = data.refreshToken || null;

      if (!token || !refreshToken) {
        return {
          success: false,
          message: "Invalid response: tokens not provided",
        };
      }

      // Set tokens in HTTP-only cookies
      const cookieOptions = {
        maxAge: credentials.rememberMe
          ? 60 * 60 * 24 * 30 // 30 days
          : 60 * 60 * 24 * 7, // 7 days
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
      };

      await setSSOToken(token, cookieOptions);
      await setSSORefreshToken(refreshToken, {
        ...cookieOptions,
        maxAge: credentials.rememberMe
          ? 60 * 60 * 24 * 60 // 60 days
          : 60 * 60 * 24 * 30, // 30 days
      });

      redirect("/");
    } else {
      const errorMessage =
        (respAny && (respAny.message || respAny.title)) ||
        "Login failed";
      return {
        success: false,
        message: errorMessage,
        errors: (respAny?.data as any)?.errors || {},
      };
    }
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
```

### 2. Update Client Token Refresh (`lib/utils/client-token-refresh.ts`)

**Current Issue:** Expects `newToken` and `newRefreshToken` at root, but backend returns them in `data.accessToken` and `data.refreshToken`.

**Required Changes:**

```typescript
"use client";

import { useAuthStore } from "@/lib/stores/auth";

export async function updateClientTokensFromResponse(
  responseData?: any
): Promise<void> {
  if (responseData && typeof responseData === "object") {
    let token: string | null = null;
    let refreshToken: string | null = null;

    // Check root level (for backward compatibility)
    if ("newToken" in responseData || "newRefreshToken" in responseData) {
      token = responseData.newToken || responseData.token || null;
      refreshToken = responseData.newRefreshToken || responseData.refreshToken || null;
    }
    // Check in data.accessToken and data.refreshToken (backend format)
    else if (responseData.data && typeof responseData.data === "object") {
      token = responseData.data.accessToken || responseData.data.token || null;
      refreshToken = responseData.data.refreshToken || responseData.data.refreshToken || null;
    }

    if (token || refreshToken) {
      const setTokens = useAuthStore.getState().setTokens;
      setTokens(token, refreshToken);
      return;
    }
  }
}
```

### 3. Update Response DTO (`lib/dto/response.dto.ts`)

**Current:** Expects `status` field, but backend doesn't provide it.

**Note:** The current DTO should work fine since it uses `error` and `statusCode` which the backend provides. The `status` field in the example was optional.

### 4. Update API Client (`lib/api-services/client-api.ts`)

**Current:** Already handles the response format correctly. No changes needed.

**Note:** The client API already:
- Reads tokens from Zustand store
- Handles 401 errors
- Updates tokens from response

### 5. Environment Configuration

**Update `.env.local` in Next.js project:**

```env
NEXT_PUBLIC_API_ENDPOINT=http://localhost:3001
# or
NEXT_PUBLIC_API_ENDPOINT=http://127.0.0.1:3001
```

### 6. Register Action (if needed)

**Update `lib/actions/auth-actions.ts` to add register action:**

```typescript
export async function registerAction(
  credentials: {
    email: string;
    password: string;
    name: string;
    rememberMe?: boolean;
  }
): Promise<LoginResponse> {
  try {
    const apiClient = createServerApiClient();

    const response = await apiClient.post<{
      accessToken: string;
      refreshToken: string;
      accessTokenExpiresAt: string;
      refreshTokenExpiresAt: string;
      user: any;
    }>("/auth/register", {
      method: "email",
      payload: {
        email: credentials.email,
        password: credentials.password,
        name: credentials.name,
      },
    });

    const respAny = response as any;
    const isSuccess = respAny && respAny.error === false && respAny.statusCode === 200;
    
    if (isSuccess) {
      const data = respAny.data ?? {};
      const token = data.accessToken || null;
      const refreshToken = data.refreshToken || null;

      if (!token || !refreshToken) {
        return {
          success: false,
          message: "Invalid response: tokens not provided",
        };
      }

      const cookieOptions = {
        maxAge: credentials.rememberMe
          ? 60 * 60 * 24 * 30
          : 60 * 60 * 24 * 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
      };

      await setSSOToken(token, cookieOptions);
      await setSSORefreshToken(refreshToken, {
        ...cookieOptions,
        maxAge: credentials.rememberMe
          ? 60 * 60 * 24 * 60
          : 60 * 60 * 24 * 30,
      });

      redirect("/");
    } else {
      const errorMessage =
        (respAny && (respAny.message || respAny.title)) ||
        "Registration failed";
      return {
        success: false,
        message: errorMessage,
        errors: (respAny?.data as any)?.errors || {},
      };
    }
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
```

## Summary of Changes

### Backend (NestJS) - NO CHANGES REQUIRED ✅
The backend is already properly structured and matches the architecture.

### Next.js - REQUIRED UPDATES

1. ✅ **Update Login Action** - Change from simple `{ email, password }` to method-based `{ method: "email", payload: { email, password } }`
2. ✅ **Update Token Extraction** - Extract from `data.accessToken` and `data.refreshToken` instead of root level
3. ✅ **Update Register Action** - Add method-based structure with `name` field
4. ✅ **Environment Variables** - Set `NEXT_PUBLIC_API_ENDPOINT` to backend URL
5. ✅ **Response Handling** - Already compatible, but verify token extraction works

## Testing Checklist

- [ ] Login with email/password works
- [ ] Tokens are stored in Zustand store correctly
- [ ] Tokens are set in HTTP-only cookies
- [ ] `/auth/me` endpoint works with Bearer token
- [ ] Registration works and auto-login after registration
- [ ] Error handling works for invalid credentials
- [ ] CORS allows requests from Next.js frontend

## Notes

1. **No Cookie Support in Backend:** The backend doesn't set HTTP-only cookies. Tokens are only returned in the response body. The Next.js app handles cookie setting.

2. **No Refresh Token Endpoint:** The backend doesn't have a `/auth/refresh` endpoint. You may need to implement one if token refresh is required.

3. **CORS Configuration:** Backend CORS is configured for `http://127.0.0.1:3000` and `http://localhost:3000`. Make sure Next.js runs on port 3000.

4. **Token Format:** Backend returns `accessToken` and `refreshToken` (camelCase), not `token` and `refreshToken`. Update token extraction accordingly.

