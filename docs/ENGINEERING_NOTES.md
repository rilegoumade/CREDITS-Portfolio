# Engineering Notes

This document describes selected engineering decisions and implementation patterns from CREDITS.

## 1. Application Architecture

CREDITS is a React single-page application built with TypeScript and Vite.

The application is organized around three main areas:

- **Presentation:** Finder-inspired desktop interface and reusable React components.
- **Application Logic:** Routing, archive navigation, search, sorting, and UI state management.
- **Backend Integration:** Supabase queries and anonymous authentication for interactive features.

## 2. Navigation State Management

### Problem

When users navigate between archive pages, they may lose their previous browsing context, including search queries, sorting preferences, view mode, and selected items.

### Implementation

The application maintains navigation-specific state using keyed Maps.

Each navigation entry stores its own state, allowing the application to restore the previous browsing context when users return.

```typescript
const finderViewStates = new Map<string, FinderViewState>()

export function readFinderViewState(key: string) {
  return finderViewStates.get(key)
}

export function saveFinderViewState(
  key: string,
  state: FinderViewState
) {
  finderViewStates.set(key, state)
  prune(finderViewStates)
}
```

A pruning mechanism limits the number of cached entries to prevent unbounded growth.

## 3. Scroll Restoration

### Problem

The application uses an internal Finder-style scroll container rather than relying exclusively on browser window scrolling.

Standard browser scroll restoration is therefore insufficient for every navigation scenario.

### Implementation

A custom scroll restoration component handles both window-level and Finder-container scrolling.

Key techniques include:

- Tracking scroll positions by React Router location key.
- Distinguishing internal Finder scrolling from window scrolling.
- Using `ResizeObserver` to handle content that changes height after navigation.
- Using `requestAnimationFrame` to coordinate restoration.
- Cancelling restoration when the user starts interacting.

This preserves browsing context across navigation while accommodating asynchronously rendered content.

## 4. Anonymous Authentication

### Problem

Multiple Creator Wall comment sections may request an anonymous user session during the same page visit.

Independent authentication requests could create unnecessary duplicate operations.

### Implementation

The application uses a shared pending Promise to reuse an in-progress authentication request.

```typescript
let pending: Promise<AnonymousAuthResult> | null = null

export function ensureAnonymousUser():
  Promise<AnonymousAuthResult> {
  if (!pending) {
    pending = resolveAnonymousUser().then(
      (result) => {
        if ('error' in result) pending = null
        return result
      },
      () => {
        pending = null
        return { error: 'unexpected' }
      },
    )
  }

  return pending
}
```

The authentication flow first checks for an existing session, then attempts anonymous sign-in only when necessary.

Failed requests clear the cached Promise so subsequent calls can retry.

## 5. Responsive Interface Engineering

The interface supports desktop and mobile layouts.

Development iterations addressed:

- Mobile navigation and Finder controls.
- Search input usability.
- Long filename overflow.
- Comment form interaction.
- Touch target sizing.
- Scroll behavior across different viewport sizes.

## 6. Development Workflow

The project was developed iteratively through:

1. Product and interface planning.
2. React component implementation.
3. Backend integration.
4. Desktop and mobile review.
5. Bug investigation and targeted fixes.
6. Build and functional verification.

AI-assisted coding tools were used as part of the development workflow, with product decisions, review, and iteration directed by the project owner.
