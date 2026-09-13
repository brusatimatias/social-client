# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

React 19 + TypeScript client for a Ruby on Rails "Social API" (register/login, posts with media, comments, likes, follow/unfollow, a paginated feed). The messaging API mentioned in some older docs is out of scope — this client only talks to the Social API.

Stack: Vite, TypeScript (strict), Tailwind CSS, React Router (classic component API), TanStack Query, Axios.

## Commands

```bash
npm run dev       # start dev server on port 8000 (see vite.config.ts)
npm run build     # tsc -b && vite build — type-check gate, then production build
npx tsc -b        # type-check only, no build
npx oxlint src    # lint (this project uses oxlint, not eslint)
npm run preview   # preview a production build
```

There is no test suite in this project yet.

The API base URL is configured via `VITE_API_BASE_URL` (see `.env.example` / `.env.development`), defaulting to `http://localhost:3000/api/v1`. A real Rails backend must be running there for the app to do anything beyond render empty/loading states.

## Architecture

- `src/api/*` — one file per REST resource (`auth`, `posts`, `comments`, `likes`, `users`), all built on the shared `apiClient` axios instance in `src/api/client.ts`. `src/api/tokenStore.ts` holds the bearer token outside React (in `localStorage` + a plain module-level store) specifically so the axios interceptor can read it without importing `AuthContext` — don't "fix" this into a circular import.
- `src/context/AuthContext.tsx` — auth state machine (`loading | authenticated | unauthenticated`), hydrates from a stored token via `GET /auth/me` on boot. `src/routes/ProtectedRoute.tsx` / `PublicOnlyRoute.tsx` gate routes on this status.
- `src/features/<domain>/` — feature-folder structure (auth, feed, posts, comments, likes, followers, profile), each owning its pages, TanStack Query hooks, and domain-specific components. `src/components/*` is the shared, domain-agnostic UI kit (Button, Modal, Card, EmptyState, etc.).
- `src/lib/userDirectory.ts` — a client-side in-memory user directory (id → `{uuid, name, lastname}`), populated opportunistically from followers/following lists and embedded comment/like `user` objects. Exists to work around a real API gap (see below). `useDirectoryUser()` reads it reactively via `useSyncExternalStore`; it resets on full page reload since it's in-memory only.
- `src/lib/errors.ts` — `extractApiErrors()` is the one place that parses the API's error envelope; use it for every mutation's error handling instead of reaching into `error.response.data` directly.

## Social API — real shapes confirmed against a live backend

The Postman-documented shapes and the actual JSON returned by a running instance disagree in a few places. These were confirmed by hitting a live backend directly with curl, not guessed — don't re-derive them from scratch or "fix" the code back to what the docs imply:

- **IDs are numbers**, not UUIDs — `Post.id`, `Comment.id`, `Like.id` are all numeric. Only `User` has a separate string `uuid` field (used for follow/unfollow and followers/following lookups) alongside its numeric `id`. `src/types/api.ts` exports `EntityId = number | string` for API functions that accept either.
- **Posts do not embed an author.** `GET /posts` / `GET /posts/:id` return `user_id` (number) only, no nested `user`/`author` object, and there is no `GET /users/:id` endpoint to resolve it. `PostCard` resolves the display name via `userDirectory` as a best-effort fallback; a post from a user you've never followed/interacted with (so their info never entered the directory) will show as "Unknown user". This is an API gap, not a bug to fix client-side.
- **`post.media` is an array of plain URL strings** (Rails Active Storage blob-redirect URLs), not `{id, url, content_type}` objects — there is no content-type field. `src/lib/utils.ts`'s `isVideoUrl()` detects video vs. image by the file extension in the URL instead.
- **Comments and likes are embedded**, not separately listable — `GET /posts/:id` (and list endpoints) return `comments: []` and `likes: []` inline, each with a nested `user` object. There is no `GET /posts/:id/comments` or `.../likes` list endpoint; don't add one to the API client.
- **Feed pagination meta** uses `current_page`, `per_page`, `total_pages`, `total_count` — not `page`/`total`.
- **`errors` is always a flat array of strings** (e.g. `{"errors":["Unauthorized"]}`), never keyed by field. Render it as a single list, not per-field form errors.
- **No way to view an arbitrary user's profile or posts** — no `GET /users/:id`. Viewing "another user" is necessarily limited to browsing their followers/following lists (`?user_id=` on `/users/followers` and `/users/following`), not a profile/post page.
- **CORS is not configured on the Rails API for local dev.** Browser requests from the Vite dev server (`localhost:8000`) to the API (`localhost:3000`) are blocked (`net::ERR_FAILED` + a CORS console error) until the backend adds `rack-cors` allowing that origin — this cannot be worked around from the client. When driving this app with a headless browser for visual QA, launch Chromium with `--disable-web-security` to bypass it for testing only; that flag is not something to add to any app code.
