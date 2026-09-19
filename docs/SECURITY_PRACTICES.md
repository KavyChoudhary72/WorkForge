# WorkForge Security & Compliance Practices

This document outlines the security architecture, encryption standards, threat mitigation vectors, and compliance measures implemented across the WorkForge SaaS platform.

---

## 1. Authentication & Token Management

### Dual-Token Architecture
- **Short-Lived Access Tokens**: Signed with `JWT_SECRET`, valid for 15 minutes to minimize exposure in case of token interception.
- **Long-Lived Refresh Tokens**: Signed with `JWT_REFRESH_SECRET`, valid for 7 days. Stored securely in `HttpOnly`, `SameSite=None`, `Secure` cookies (or hashed in the database).
- **Asymmetric Token Rotation**: Every time a refresh token is exchanged via `/api/auth/refresh-token`, the old token is invalidated and a fresh pair is minted.
- **Session Revocation**: Storing device session tokens in the database allows instant invalidation via `/api/auth/logout-all` across all client devices.

---

## 2. Multi-Tenant Data Isolation Defense in Depth

To guarantee zero cross-tenant contamination:
1. **JWT Tenant Binding**: Tenant identity (`organizationId`) is embedded cryptographically inside verified JWT tokens.
2. **Context Enforcement Middleware**: `tenantIsolation.js` automatically binds queries to the authenticated tenant.
3. **Compound Database Constraints**: Collections enforce compound indexes starting with `organizationId`, preventing cross-tenant collection scans.
4. **Isolated WebSocket Channels**: Socket rooms are prefixed by tenant ID (`org_${organizationId}`).

---

## 3. Network & Transport Security

- **TLS 1.3 Transport Encryption**: All production traffic must pass through HTTPS / WSS.
- **Helmet HTTP Headers**: Enforces `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Strict-Transport-Security`.
- **CORS Configuration**: Restricted strictly to authorized origins (`CLIENT_URL`), preventing unauthorized cross-origin AJAX requests.
- **Rate Limiting**: `express-rate-limit` prevents brute-force login attacks and Denial of Service (DoS) attempts on authentication routes (100 requests per 15-minute window).

---

## 4. Input Sanitization & Injection Prevention

- **NoSQL Injection Defense**: All user inputs are sanitized through `mongo-sanitize` to strip `$` and `.` characters from query parameters and request bodies.
- **Parameterized Mongoose Queries**: All database operations use strongly typed Mongoose schemas, preventing arbitrary execution of untrusted query code.
- **XSS Prevention in Frontend**: React 19 inherently escapes dynamic values in JSX rendering. Rich text components utilize `DOMPurify` before rendering HTML.

---

## 5. Passwords & Cryptographic Storage

- **Bcrypt Password Hashing**: User passwords are encrypted using `bcryptjs` with an adaptive work factor (salt rounds = 10), rendering rainbow-table attacks computationally infeasible.
- **Zero Plaintext Storage**: Plaintext passwords are never logged in console output, Winston logs, or database collections.
- **Audit Logging**: Sensitive operations (e.g. user creation, role modification, billing updates, logins) generate immutable records in the `ActivityLog` collection with timestamp, IP address, and actor ID.
