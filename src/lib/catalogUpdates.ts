const catalogUpdateKey = "loudasobi:catalog-updated";

// Share only an invalidation signal; every public view fetches its own filtered data.
export function notifyCatalogUpdated() {
  try {
    localStorage.setItem(catalogUpdateKey, crypto.randomUUID());
  } catch {
    // Public views also re-fetch when opened or focused if storage is unavailable.
  }
}

export { catalogUpdateKey };
