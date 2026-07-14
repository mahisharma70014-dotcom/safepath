# SafePath DT Panel

SafePath DT Panel is a premium fintech-style Next.js dashboard for seller and admin operations around USDT deposit, sell, withdraw, KYC, approvals, wallet tracking, and transaction monitoring.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Firebase client integration scaffold
- Local storage backed demo data flow for requests, approvals, balances, and admin pricing

## Local Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Demo Login

- Seller: `seller@company.com` / `Seller@123`
- Admin: `admin@company.com` / `Admin@123`

## Render Deploy

This repository includes [render.yaml](./render.yaml) for one-click Render setup.

### Render Steps

1. Push this repository to GitHub.
2. In Render, choose `New +` -> `Blueprint`.
3. Connect the GitHub repository.
4. Render will detect `render.yaml` automatically.
5. Add the required environment variables from [.env.example](./.env.example).
6. Deploy the service.

### Required Environment Variables

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_API_BASE_URL`

## Features

- Seller dashboard with Deposit, Sell, and Withdraw USDT flows
- Admin-configurable deposit wallet settings
- Admin-configurable UPI, CDM, and Mix pricing
- Automatic estimated INR payout calculation
- Available balance validation on sell and withdraw
- Admin approval queue with `Pending -> Processing -> Completed / Rejected`
- Approved deposit updates seller USDT balance automatically in demo flow

## Notes

- Current persistence uses browser storage for demo/live UI testing.
- Firebase and API integration files are scaffolded and ready for real backend wiring.
