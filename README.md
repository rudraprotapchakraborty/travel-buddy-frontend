# Travel Buddy & Meetup — Frontend

Live URL: [https://travel-buddy-frontend-lake.vercel.app/](https://travel-buddy-frontend-lake.vercel.app/)

---

## 🎒 Project Overview

**Travel Buddy & Meetup** is a social-travel web application frontend that helps users discover travel companions, create and share travel plans, and organize meetups. The frontend is built to be modern, responsive, and ready to connect to a backend API that implements authentication, travel plans, reviews, and payment features.

This repository contains the **frontend** portion of the platform (React / Next.js app). It focuses on user experience, routing, profile/trip CRUD flows, and connecting to backend APIs for persistence.

---

## ✨ Key Features

* Register / Login (JWT-based authentication flow expected from backend).
* Role-aware navigation (User / Admin flows).
* User profile management (create / edit / view public profiles).
* Travel plans (create, read, update, delete).
* Search & match travelers by destination, date range and interests.
* Reviews & ratings for post-trip trust building.
* Subscription / payment integration placeholders (Stripe, SSLCommerz, etc.).
* Responsive UI with modern, accessible components.

---

## 🧭 Tech Stack

* **Framework:** Next.js (App Router)
* **Language:** TypeScript (recommended) or JavaScript
* **Styling:** Tailwind CSS (suggested) / CSS Modules
* **Auth:** JWT flow (frontend stores token securely)
* **Image Upload:** Cloudinary / ImgBB (integration points in UI)
* **Payments:** Stripe or other gateway (integration points in UI)
* **Deployment:** Vercel (live link above)

---

## 📁 Folder Structure (Suggested)

```
frontend/
 ├── app/                # Next.js app router pages & layouts
 │   ├── (auth)/         # login, register UI
 │   ├── (user)/         # profile, travel-plans, dashboard
 │   ├── components/     # shared UI components (Navbar, Forms, Cards)
 │   ├── hooks/          # custom hooks (useAuth, useFetch)
 │   ├── lib/            # api client, utils
 │   └── styles/         # global + component styles
 ├── public/             # static assets
 ├── package.json
 └── README.md
```

---

## 🔌 API Endpoints (Frontend expects these)

> Replace `NEXT_PUBLIC_API_BASE_URL` in .env with your backend base URL.

| Method | Endpoint                      | Purpose                  |
| ------ | ----------------------------- | ------------------------ |
| POST   | `/api/auth/register`          | Register new user        |
| POST   | `/api/auth/login`             | Login user (returns JWT) |
| GET    | `/api/users/:id`              | Get user profile         |
| PATCH  | `/api/users/:id`              | Update profile           |
| POST   | `/api/travel-plans`           | Create travel plan       |
| GET    | `/api/travel-plans`           | Get all travel plans     |
| GET    | `/api/travel-plans/match`     | Search & match travelers |
| POST   | `/api/reviews`                | Add review               |
| POST   | `/api/payments/create-intent` | Create payment intent    |

---

## ⚙️ Environment Variables

Create a `.env.local` file at the project root with the following variables (example names):

```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend.example.com
NEXT_PUBLIC_CLOUDINARY_URL=...    # optional: image upload
NEXT_PUBLIC_STRIPE_KEY=...        # optional: payments
NEXTAUTH_SECRET=...               # if using next-auth or other secret
```

> Adjust names to match how the frontend code reads them.

---

## 🚀 Local Setup & Development

1. Clone the repo:

```bash
git clone <repo-url>
cd frontend
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
# or
yarn
```

3. Add `.env.local` with environment variables (see above).

4. Run development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Available Scripts

* `dev` — Starts the Next.js dev server.
* `build` — Builds the production app.
* `start` — Runs the production build locally.
* `lint` — Run linters (if configured).
* `test` — Run tests (if configured).

> Check `package.json` for exact script names and adjust accordingly.

---

## 🧩 UI / Component Notes

* **Navbar** is role-aware and shows different links for logged-out users, regular users, and admins.
* **Auth Context / Hook** should handle token storage (use HttpOnly cookies from backend when possible for better security).
* **Forms**: use controlled components and client-side validation before sending requests.
* **Images**: upload flow calls your image host (Cloudinary/ImgBB) and stores returned URL in user/profile or travel plan payloads.

---

## 🔒 Security Recommendations

* Prefer server-side HttpOnly cookies for JWT/session tokens to reduce XSS risk.
* Validate and sanitize user-submitted content before rendering (especially reviews and rich text).
* Use TLS in production (Vercel already provides HTTPS).

---

## ♻️ Deployment

This project is already deployed to Vercel at:

**[https://travel-buddy-frontend-lake.vercel.app/](https://travel-buddy-frontend-lake.vercel.app/)**

To redeploy or connect a Git repo to Vercel:

1. Push your branch to GitHub/GitLab.
2. Link the repo in Vercel dashboard.
3. Setup environment variables in Vercel settings.
4. Deploy.

---

## 🤝 Contributing

Contributions are welcome! Suggested workflow:

1. Fork the repo
2. Create a feature branch (`feature/awesome-thing`)
3. Open a PR with a clear description

Please include tests for important behavior when possible.

---

## 👤 Author

Rudra Protap Chakraborty
