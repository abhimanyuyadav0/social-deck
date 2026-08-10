# Social Deck

Publish social posts to **Time To Future Community** today. LinkedIn & Instagram coming soon.

Third-party platforms can integrate via **Developer API** (`sp_` API keys) and **webhook connections**.

## Local dev

```bash
cd social-deck
npm install
npm run dev
```

Runs at **http://localhost:3011** (proxies `/api` → backend on `:5001`).

Restart **master-backend** after pulling backend changes.

## Register app product

In guildadmin → App Products, seed or add `social-deck` (see `guildadmin/src/constants/defaultAppProducts.ts`).

## Developer API

- Dashboard: `GET/POST /api/social-deck/api-keys` (JWT)
- Public API: `/api/social-deck/v1/*` with header `X-Api-Key: sp_...`

See in-app **Developer** page for curl examples.

## Webhook (your community)

1. Connections → add webhook URL
2. Save the `whsec_` secret shown once
3. On publish, Social Deck POSTs JSON to your URL with `X-Social-Deck-Signature` (HMAC-SHA256 of body)
