# Email Verification Setup

CreatorsHub now requires users to verify their email before receiving JWTs. Follow the steps below to enable the workflow locally or in deployed environments.

## 1. Database migration

Run the new migration once per environment (adjust command to match your migration tooling):

```bash
psql "$DATABASE_URL" -f db/migrations/20260225_add_email_verification.sql
```

This adds `is_verified` to `users` and introduces the `verification_codes` table.

## 2. SMTP / mail transport

Configure the following environment variables (for example, in `.env`):

```
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_SECURE=false            # true if using port 465
SMTP_USER=apikey_or_username
SMTP_PASS=supersecret
MAIL_FROM="CreatorsHub <no-reply@creatorshub.com>"
VERIFICATION_CODE_TTL_MINUTES=10
```

During development you can point these to a testing inbox or a local SMTP sink such as [MailDev](https://github.com/maildev/maildev).

If the SMTP settings are missing, the backend logs a warning and skips sending codes, preventing users from completing registration.

## 3. Manual testing checklist

1. `npm install` inside `creatorshub-backend` (new Nodemailer deps).
2. Start the API (`npm run dev`) with the new env vars.
3. Register a fresh account in the iOS app. Expect a 201 response with `userId` but no tokens.
4. Check your inbox for the six-digit code and enter it in the app’s verification sheet.
5. Confirm the `/auth/verify` response issues JWTs and flips `users.is_verified` to true.
6. Attempt to log in again to ensure unverified accounts are blocked while verified ones succeed.

Optional: run a cron/SQL job to delete stale rows from `verification_codes` if desired (the TTL is enforced at read time).
