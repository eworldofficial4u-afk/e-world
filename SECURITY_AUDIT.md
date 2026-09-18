# E-WORLD security review

Scope: Pages Functions authentication, staff routes, public registration/contact, bot ingestion, public assets and deployment access. This is a targeted source review and regression check, not a guarantee against all attacks.

## Confirmed weaknesses addressed

- Header-only or after-read body limits: central streamed byte limits now reject oversized bodies even without Content-Length. JSON null/arrays and malformed JSON are rejected before handlers.
- Concurrent limiter races and absent contact throttling: atomic D1 counters enforce login/contact limits of 5 per 15-minute fixed window and registration limits of 5 per hour. Existing registration checks remain. Distributed attacks across IP addresses still need edge protections or a challenge.
- Cross-site mutation gaps: browser writes require an accepted Origin; cross-site Fetch Metadata is denied. Bot ingestion uses its independent bearer secret.
- Malformed cookie decoding: invalid encoding becomes an unauthenticated request instead of an exception.
- CSV formula injection: dangerous spreadsheet prefixes are escaped in exported cells.
- Error details: unhandled API errors return a generic response instead of underlying database or stack information.
- Homepage security headers: CSP, framing restrictions, MIME protection and HSTS are configured. Inline styles remain allowed for existing visual effects; inline scripts are not allowed.
- Shared admin password exposure: replaced with a cryptographically random 192-bit password in an ignored, user-restricted local file. Existing sessions were revoked. The current digest remains SHA-256 and is appropriate only for this generated high-entropy secret; human-chosen passwords should use a slow password KDF or managed authentication.

## Verification

- Seven automated tests cover origins, malformed cookies, streamed limits, CSV, CSRF, sanitized errors and forwarded request bodies.
- Local registration regression suite passed (5/7 players accepted; invalid rosters, duplicate UIDs, confirmations, IDs, oversized bodies rejected).
- Concurrent requests admitted only five of eight through the shared contact throttle; three were rejected with 429.
- Live unauthorized staff list/detail/screenshot/export accesses returned 401.
- Live cross-origin mutation returned 403; null JSON 400; malformed cookie 401.
- Rotated password login, authorized request routing, missing-CSRF rejection and logout verified.
- Public deployment credential-pattern scan found no matches.

## Remaining limitations

Deployment cleanup: six obsolete Pages deployments were deleted to remove alternate URLs running old security code and old password secrets. The current hardened production deployment is retained. Removed deployments cannot be restored through one-click rollback; local source is retained.

- Single shared staff credential; no per-person roles or MFA. Cloudflare Access or individual identities is a future improvement.
- Discord token previously shared in chat should be rotated in the Developer Portal and saved directly in the private bot environment; this review cannot revoke Discord credentials on the owner's behalf.
- Per-IP application limits do not stop distributed denial of service. No claim is made that the site is unhackable.
- Review dependencies and Cloudflare account MFA/access regularly. No account-wide firewall or billing changes were made.
