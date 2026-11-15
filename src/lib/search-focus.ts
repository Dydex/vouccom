// Lets Home's search button ask the Listings tab to focus its search field.
// A flag rather than a route parameter: the tab reads it whenever it comes
// into focus, even if it was already open.

let requested = false;

export function requestSearchFocus() {
  requested = true;
}

/** True once per request. */
export function takeSearchFocusRequest() {
  const was = requested;
  requested = false;
  return was;
}
