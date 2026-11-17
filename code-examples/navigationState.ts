import type { MacFinderView } from '../components/MacFinderShell'

export type FinderViewState = {
  view: MacFinderView
  sort: 'name' | 'date'
  query: string
  selectedId: string | null
}

export type SearchViewState = {
  query: string
  submitted: string
}

const finderViewStates = new Map<string, FinderViewState>()
const searchViewStates = new Map<string, SearchViewState>()

function prune<K, V>(store: Map<K, V>) {
  if (store.size <= 200) return
  const oldest = store.keys().next().value
  if (oldest !== undefined) store.delete(oldest)
}

export function readFinderViewState(key: string) {
  return finderViewStates.get(key)
}

export function saveFinderViewState(key: string, state: FinderViewState) {
  finderViewStates.set(key, state)
  prune(finderViewStates)
}

export function readSearchViewState(key: string) {
  return searchViewStates.get(key)
}

export function saveSearchViewState(key: string, state: SearchViewState) {
  searchViewStates.set(key, state)
  prune(searchViewStates)
}
