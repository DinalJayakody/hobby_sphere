# HobbySphere Frontend — Performance & Reliability Audit

Scope: `HobbySphere Web/hobby_sphere` (React + Vite SPA) only. Backend services
(Gateway, chat-service, notification-service, post-service, user-service) were
read-only reference material for understanding API contracts — no backend
code was changed, per explicit instruction.

## 1. Starting point

This codebase already carries evidence of a prior optimization pass: in-flight
request guards, optimistic UI updates for like/save/comment/follow, route-level
code splitting, a synchronous feed-dedup guard, and screen-scoped WebSocket
connection (chat only connects on `/chat`, not globally). Most of the classic
anti-patterns this kind of audit usually finds (retry loops, full-page
reloads, unthrottled search, refetch-the-whole-feed-on-like) were **not
present**. The findings below are the real gaps that were left.

## 2. Root causes found

### 2a. App-wide re-render every 20 seconds (the "reload" symptom)
`DataContext` held *everything* — feed, comments, stories, groups, followers,
**and notifications** — behind one `<DataContext.Provider value={{...}}>`
object literal. That object is a new reference every time `DataProvider`
re-renders, so **any** state change inside it re-renders **every** consumer
of `useData()` app-wide, regardless of which field they actually read.

Notifications were the only piece of state on a timer: a `setInterval` polled
every 20s for the unread badge. Each tick updated `notifications` state,
which re-rendered `DataProvider`, which re-rendered every `PostCard` in the
feed, `Home`, `Navbar`, `Stories`, etc. — a full authenticated-app re-render
every 20 seconds, indefinitely, even while the user was completely idle or
the tab was in the background. This is almost certainly what read as the app
"reloading every few seconds": not a browser reload, but a periodic
whole-tree re-render driven by a background timer.

No `location.reload()`, `window.location.href` assignment, retry loop,
auth/redirect loop, or duplicate Firebase/auth listener was found anywhere in
the frontend — those specific mechanisms are not present in this codebase.

### 2b. A real crash bug in `Profile.tsx` (found during the audit, not related to reloads)
`Profile.tsx` had:
```tsx
if (!currentUser) return null;   // <- before 5 useEffects, a useCallback, and useInfiniteScroll
```
If `currentUser` ever becomes `null` **after** the page has already mounted
with hooks established (e.g. a 401 triggers `AuthContext`'s `logout()` while
the user is sitting on their own profile), the number of hooks executed
between renders changes. React treats this as a hard error ("rendered fewer
hooks than expected"), which crashes the component tree rather than
gracefully redirecting — from the user's perspective, an unexplained
crash/blank-screen that would need a manual reload to recover from. Confirmed
via ESLint's `react-hooks/rules-of-hooks` rule, which was failing on this
exact file before this audit.

## 3. Fixes implemented

1. **Extracted `NotificationsContext`** (`src/context/NotificationsContext.tsx`)
   out of `DataContext`. Notifications, their loading/count state, and the
   polling interval now live in their own provider. The 20s poll — and any
   future notification-related state change — now only re-renders components
   that actually call `useNotifications()` (`Navbar`'s badge,
   `pages/Notifications.tsx`), not the entire app.
2. **Paused polling while the tab is hidden.** The interval now checks
   `document.visibilityState === 'visible'` before firing, and a
   `visibilitychange` listener triggers one immediate refresh when the tab
   becomes visible again. A backgrounded tab now generates zero notification
   traffic instead of one request every 20s indefinitely.
3. **Fixed the `Profile.tsx` hooks-order bug.** All hooks now run
   unconditionally on every render; the `!currentUser` guard was moved to
   immediately before the JSX `return`, after every hook has already run.
   Functions that dereference the user (`fetchUserPosts`, `fetchSavedPosts`,
   `loadFollowing`) now guard on `currentUser?.id` individually instead of
   relying on the removed early return.
4. **Added static-asset cache headers** (`public/serve.json`, copied into
   `dist/` by Vite's build and read by the `serve` package used in
   `Dockerfile`'s runtime stage): Vite's content-hashed JS/CSS under
   `/assets/**` now get `Cache-Control: public, max-age=31536000, immutable`
   (safe — a hashed filename changes whenever content changes), while
   `index.html` gets `Cache-Control: no-cache` so navigation always picks up
   a new deployment. Verified at runtime with `serve -s dist` + `curl -I`.
   This directly reduces repeat Cloudflare/VPS bandwidth for returning users
   without touching any private/user-specific API response caching.

Every change was verified with `tsc --noEmit`, `npm run build`, and `eslint`
(no new lint errors introduced; pre-existing `no-explicit-any` warnings across
the codebase were left alone as out of scope).

## 4. What was investigated and found already correct (no change made)

- No `setInterval`/recursive `setTimeout` polling anywhere except the
  (now-fixed) notification poll and an unrelated local OTP countdown timer in
  `VerifyCode.tsx`.
- No service worker / PWA registration exists, so no update/reload loop is
  possible from that source.
- No `location.reload()` or `window.location.href` navigation anywhere.
- Axios interceptor only attaches the auth header; no 401 redirect loop.
- WebSocket (STOMP) connection is scoped to `ChatProvider`, itself only
  mounted on `/chat` — it does not run app-wide, and its `reconnectDelay` is a
  fixed 3s (not an unbounded retry loop).
- Search input is already debounced (300ms) with a single effect (`Navbar.tsx`)
  — no per-keystroke request storms.
- Feed pagination has a synchronous in-flight guard (`feedLoadInFlight` ref)
  preventing duplicate concurrent page loads from the mount effect and the
  infinite-scroll observer racing each other.
- Like/save/follow/comment/delete all use optimistic local state updates with
  rollback on failure — none of them refetch the feed or navigate away.
- The Trending widget skips its API call entirely on viewports below `md`
  (desktop-only UI), rather than fetching data that won't render.

## 5. Idle network behavior (after fix)

With a backgrounded tab: zero notification requests (previously one every
20s indefinitely). With a foregrounded, genuinely idle tab: one notification
request every 20s — this is an intentional, documented tradeoff (the
notification service has no push/WebSocket channel) and was left in place
rather than removed, since real-time badge freshness is a legitimate product
requirement, not an accident. No other background requests occur while idle.

## 5b. Backend finding: the notification list endpoint (read-only investigation)

While answering a follow-up question about VPS cost from 20s polling, I traced
`notification-service` (read-only — no backend files were changed) and found
the real cost driver is not the request *count* but the *work* one of the two
polled endpoints does:

- `GET /api/notifications/user/{id}` (`getNotificationsByUserId` in
  `NotificationService.java`) calls
  `notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId)` with
  **no `LIMIT`** — it loads a user's entire notification history from the DB
  every call, then paginates with `.skip()/.limit()` in Java. Cost grows
  unboundedly with notification history and reruns from scratch on every call.
- For every notification in that result, `resolveProfilePicture()` →
  `ProfileImageService.loadAsBase64()` does a **fresh disk read or HTTP GET**
  (3s connect / 5s request timeout) and re-Base64-encodes the image, with no
  cross-request caching. Up to ~30 image loads, repeated every poll.
- By contrast, `GET /api/notifications/user/{id}/unread-count` **is**
  Redis-cached (5 min TTL) in the same service — cheap.

This scales with concurrent active users (each foregrounded session polling
this endpoint ~3x/min) and gets worse over time as notification history
accumulates — a legitimate VPS/DB cost concern, independent of the re-render
issue in §2a.

**Frontend mitigation applied (no backend change):** the recurring 20s poll
now calls only the cheap, cached unread-count endpoint. The expensive full
list is fetched just twice: once on login (for a warm cache) and once whenever
the Notifications page is actually opened — the only screen that renders it.
`markAllNotificationsAsRead` was moved to fire off the freshly-fetched list
instead of a possibly-stale one.

**Not fixed (would require backend changes, out of scope for this pass):**
adding `LIMIT`/proper DB-level pagination to the repository query, and
caching resolved avatar images (e.g. Redis, or a short in-memory LRU keyed by
image reference) instead of reloading/re-encoding them on every call.

## 6. Remaining known limitations / recommendations

- **`DataContext` is still one large context** for posts/comments/stories/
  groups/followers. Splitting it further (e.g. per-domain contexts) would
  reduce re-render blast radius when, say, adding a comment to one post
  re-renders every `PostCard` in the feed — but this only fires on explicit
  user actions (not continuously while idle), and a full split touches ~15
  files. Flagged as a real but lower-priority improvement, not done here to
  avoid unnecessary risk on this pass.
- Profile pictures are delivered as base64 in JSON (a backend response-format
  choice, out of scope here) rather than as cacheable image URLs — this
  increases payload size and prevents browser/CDN image caching for avatars.
  Worth revisiting on the backend side.
- No frontend crash/error-reporting (e.g. an error boundary around routes) was
  found — a hook-order bug like the one fixed in `Profile.tsx` would currently
  surface as a blank white screen with no user-facing recovery path. Adding a
  top-level React error boundary would turn future bugs of this class into a
  graceful "something went wrong, reload" message instead of a silent crash.
- Before/after request counts are not quantified with real numbers in this
  document — no production traffic monitoring was available during this
  audit, and inventing numbers would be misleading. The concrete, verifiable
  claim is: the notification poll no longer fires against a backgrounded tab,
  and no longer forces an app-wide re-render.
