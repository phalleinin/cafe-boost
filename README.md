# CafeBoost ☕

> Real-time QR ordering system built for solo roadside cafés — no app download required.

CafeBoost lets customers scan a QR code, browse the menu, customize their order, and pay — all from their phone's browser. Owners get a live dashboard to manage orders, track revenue, and print their QR code in minutes.

---

## Features

### For customers
- Scan a QR code at the table — no app install needed
- Browse the café menu with item availability shown live
- Customize orders (sugar level, quantity)
- Choose payment method: cash or KHQR
- Receive a confirmation page with a prominent order number

### For owners
- **Live kanban board** — drag orders through New → Preparing → Done with one tap
- **Browser notifications** for incoming orders
- **Daily reset** — dashboard shows today's orders only, resets automatically at midnight
- **Menu management** — add, edit, delete items and toggle availability
- **QR code generator** — generate and download a printable QR code
- **Analytics** — daily revenue, popular items, busiest hours (today / 7 days / 30 days)
- **Bilingual UI** — English and Khmer language support

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js / React |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Real-time | Supabase Realtime subscriptions |
| Deployment | Vercel |

---

## Database Schema

- `cafes` — café profile and settings
- `profiles` — owner account data
- `menus` — menu items per café
- `orders` — customer orders with daily auto-incremented order numbers
- `order_items` — line items per order

Row-Level Security (RLS) policies ensure each café can only access its own data. Daily order numbers are generated automatically via a database trigger.

---

## Getting Started

```bash
git clone https://github.com/phalleinin/cafeboost.git
cd cafeboost
npm install
```

Copy the environment variables:

```bash
cp .env.example .env.local
```

Add your Supabase project credentials to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Run the development server:

```bash
npm run dev
```

---

## Project Structure

```
/app
  /menu          → Customer-facing QR menu
  /dashboard     → Owner dashboard (kanban, analytics, menu management)
  /auth          → Login / signup
/components      → Shared UI components
/lib             → Supabase client, helpers
/public          → Static assets
```

---

## Roadmap

- [ ] Push notifications via service worker
- [ ] Printer integration for order tickets
- [ ] Multi-table QR support
- [ ] Customer order history (optional login)

---

## License

MIT
