<div align="center">

# 🧳 Travel Buddy

**Find travel companions, share trip plans and organise meetups.**

[**Live demo**](https://travel-buddy-frontend-qzgv.vercel.app/) · [Backend API](https://github.com/rudraprotapchakraborty/travel-buddy-backend) · [Portfolio](https://rudraprotapchakraborty.com/projects)

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=ffffff) ![React](https://img.shields.io/badge/React-20232a?style=for-the-badge&logo=react&logoColor=61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=ffffff) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-0f172a?style=for-the-badge&logo=tailwindcss&logoColor=38bdf8) ![Stripe](https://img.shields.io/badge/Stripe-635bff?style=for-the-badge&logo=stripe&logoColor=ffffff)

<a href="https://travel-buddy-frontend-qzgv.vercel.app/"><img src="https://i.ibb.co/xqdgD8GH/travel-buddy.webp" alt="Travel Buddy: home page" width="880"></a>

</div>

> The web app of **Travel Buddy**.
>
> - Post trip plans and search other trips by destination, dates and travel style
> - Join requests that hosts accept or decline, with ratings and reviews after the trip
> - Email-verified accounts, Google sign-in and a Stripe-paid verified plan
> - Admin dashboard for members and trips

A full-stack platform for travellers heading the same way. Members post trip plans, search other trips by destination, dates and travel style, send join requests that hosts accept or decline, and leave ratings and reviews after the trip. Accounts are email-verified with one-time codes, with Google sign-in, password reset, a full account settings page (photo, name, email, password, delete account), a verified plan paid through Stripe, an admin dashboard for members and trips, and a light and dark theme. Includes test accounts on the login page so recruiters can explore every role.

## Features

- **Explore trips** – browse public trip plans, search by destination, dates and travel style, and open a plan to see the host, itinerary and budget
- **Plan a trip** – add, edit and delete your own plans; a match view suggests travellers going the same way
- **Join requests** – ask to join a trip with a message; hosts accept or decline from their dashboard
- **Reviews** – rate and review fellow travellers after a trip
- **Accounts** – email + one-time code verification, Google sign-in, password reset, and a settings page for photo, name, email, password and account deletion
- **Verified plan** – a one-time Stripe payment that adds a verified badge
- **Admin dashboard** – members and trips at a glance
- **Polish** – light and dark theme, responsive layout, skeleton loaders, toasts, legal pages and a blog

## Test accounts

The login page offers one-tap test accounts for each role:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@travelbuddy.demo` | `TravelDemo#2026` |
| User | `user@travelbuddy.demo` | `TravelDemo#2026` |

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Framer Motion · Axios · Stripe.js · Lucide icons

## Run it locally

Start the [backend](https://github.com/rudraprotapchakraborty/travel-buddy-backend) on port 5000, then:

```bash
npm install
npm run dev        # http://localhost:3000
```

### Environment (`.env`, git-ignored)

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API address, for example `http://localhost:5000/api` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google sign-in (public client id) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (test mode while developing) |
| `NEXT_PUBLIC_SITE_URL` | Public address of this site |

## Scripts

`npm run dev` · `npm run build` · `npm start` · `npm run lint` · `npm run typecheck`

## Deploying

Deploy to Vercel with the variables above. Set the backend's `CLIENT_URL` to the site's address.

---

<div align="center">

Made by **[Rudra Protap Chakraborty](https://rudraprotapchakraborty.com)** · [Portfolio](https://rudraprotapchakraborty.com) · [GitHub](https://github.com/rudraprotapchakraborty)

</div>
