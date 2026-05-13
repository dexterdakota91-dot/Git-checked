# Aetheris Ventures — Bug Fixes Applied

## ✅ Code Fixes (Already Applied)

### 🔴 Critical
| # | File | Bug | Fix |
|---|------|-----|-----|
| 1 | `src/store/slices/uiSlice.ts` | `userState` and `setUserState` were used across 4 files (OnboardingDialog, useFirebaseListeners, ideaLabSlice, completeOnboarding) but **never defined in any slice** — causing silent undefined errors | Added `userState: string` and `setUserState` to UISlice |
| 2 | `src/store/slices/authSlice.ts` | Only `signInWithPopup` used — fails silently on Vercel/custom domains where popups are blocked | Added `signInWithRedirect` fallback + `loginError` + `isLoggingIn` states |
| 3 | `server.ts` | Gemini model `"gemini-3-flash-preview"` **does not exist** — autonomy engine crashed on every run | Changed to `"gemini-2.0-flash"` |

### 🟡 Medium
| # | File | Bug | Fix |
|---|------|-----|-----|
| 4 | `src/hooks/useFirebaseListeners.ts` | `getRedirectResult()` never called — redirect auth results lost on page reload | Added redirect result handler on mount |
| 5 | `src/components/views/LoginView.tsx` | Auth errors silently swallowed — user saw nothing when login failed | Shows error message + loading spinner |
| 6 | `src/App.tsx` | `OnboardingDialog` received `setActiveTab={() => {}}` (noop) — "Terms of Service" links did nothing | Passes real `navigate()` function |
| 7 | `server.ts` | `initializeApp()` called unconditionally — throws on hot reload / duplicate init | Added `getApps()` guard |
| 8 | `package.json` | `tsx` in `devDependencies` but `start` script uses `tsx server.ts` — production server fails | Moved `tsx` to `dependencies` |

---

## ⚠️ ONE Manual Step Required — Firebase Authorized Domains

This is the **#1 reason Google Sign-In fails on Vercel/custom domains**.
Your code now handles it gracefully with a clear error message, but you still need to tell Firebase your domain is trusted.

### Steps:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `gen-lang-client-0283059912`
3. Navigate to **Authentication → Settings → Authorized domains**
4. Click **Add domain**
5. Add your Vercel URL, e.g.: `your-app.vercel.app`
6. Also add any custom domain you're using

> **Note:** `localhost` is already authorized by default for local development.

---

## Environment Variables Required

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here

# Optional — leave blank to use DEMO_MODE
STRIPE_SECRET_KEY=
PLAID_CLIENT_ID=
PLAID_SECRET=
PLAID_ENV=sandbox
DEMO_MODE=true

APP_URL=https://your-app.vercel.app
```
