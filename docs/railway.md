# Railway

Configure these variables in the Railway service (in addition to the existing
database and application variables) to enable admin Web Push notifications:

```text
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:ops@example.com
```

Generate a key pair locally with `npx web-push generate-vapid-keys`. Keep the
private key secret; the public key is returned only to authenticated admins by
`/api/admin/push-subscription`. Deploy the Prisma migration before enabling
notifications. Push requires HTTPS in production (Railway provides this).
Administrators open the Tickets page and click **Ativar alertas** once per
browser. The existing 15-second polling notification remains as a fallback.
