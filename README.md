# Base SaaS Dashboard

A responsive, multi-page SaaS operations dashboard rebuilt from the [Base dashboard Figma design](https://www.figma.com/design/ozlhUPjiBNaY4iUXhCxSxc/SAAS-Dashboard--figmamarket.com-?node-id=0-1&p=f).

The implementation follows the design system across its expanded and compact navigation, analytics views, operational tables, planning tools, customer workflows, messaging, invoicing, and account screens. It is built as a reusable React component system rather than a collection of isolated mockups.

## Implemented modules

- Dashboard overview with KPI cards, a revenue chart, product breakdown, recent orders, and top-product activity
- Product Analytics with trend cards, chart controls, performance tables, and an add-product drawer
- Customer List with search, status filters, row actions, customer detail panel, and add-customer drawer
- Invoice List with filters and row menus, plus a complete create-and-preview invoice workflow
- Schedule List with calendar navigation, daily agenda, and event interactions
- Calendar with month, year, and day views plus a create-event modal
- Task workspace with board, list, and timeline views
- Team messaging with conversation search, chat state, and responsive conversation details
- Notification and Settings surfaces
- Connected sign up, login, account recovery, success, protected-dashboard, and logout flow
- Responsive expanded, collapsed, and mobile navigation
- Accessible, auto-dismissing toast feedback for meaningful create, update, delete, authentication, and demo actions
- Controlled document, sidebar, table, calendar, dialog, and message-thread scrolling with a responsive scroll-to-top control

## Routes

| Area | Route |
| --- | --- |
| Dashboard | `/` |
| Product Analytics | `/analytics` |
| Customers | `/customers` |
| Invoices | `/invoices` |
| Create Invoice | `/invoices/new` |
| Schedule | `/schedule` |
| Tasks | `/tasks` |
| Calendar | `/calendar` |
| Messages | `/messages` |
| Notifications | `/notifications` |
| Settings | `/settings` |
| Authentication | `/login`, `/signup`, `/recover`, `/success` |

## Stack

- React 19 and Next.js 16 App Router
- TypeScript
- Recharts for responsive data visualization
- Lucide React for accessible, consistent iconography
- Hand-authored responsive CSS using shared design tokens
- Vercel- and Netlify-compatible Next.js production output

## Submission

- **Developer:** Rasineni Tharun Chowdary
- **GitHub:** [rasinenitharunchowdary-cmyk/base-saas-dashboard](https://github.com/rasinenitharunchowdary-cmyk/base-saas-dashboard)
- **Netlify:** [base-saas-dashboard.netlify.app](https://base-saas-dashboard.netlify.app)
- **Vercel:** [saas-dashboard-self-five.vercel.app](https://saas-dashboard-self-five.vercel.app)

## Local development

Node.js 22 LTS is required.

```bash
npm install
npm run dev
```

The local app is available at `http://localhost:3000`.

## Demo authentication

The first visit is routed to the Figma login screen. Use the built-in account:

```text
Email: demo@base.com
Password: Base1234
```

You can also create a new account from Sign Up. The account password is SHA-256 hashed before browser storage, signup opens the Figma success screen, and **Go to Home** enters the protected dashboard. **Remember me** chooses a persistent or tab-only session, and logout clears the session before returning to Login. Google and Facebook buttons create clearly scoped demo-provider sessions so every Figma interaction can be evaluated without external credentials.

This is intentionally a front-end submission flow: accounts and sessions are local to the browser and no production identity provider or email service is implied. Connect a server-side identity service before using it for real customer data.

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
```

`npm test` creates a production build and verifies that every primary dashboard and authentication route renders successfully. Run the complete gate with:

```bash
npm run check
```

## Project structure

```text
app/
  (auth)/             Authentication routes
  (dashboard)/        Dashboard application routes
components/base/      Shared shell and feature modules
public/avatars/       Local demo avatars
tests/                Build and route verification
```

## Design notes

The design system uses the Figma file's violet primary color, neutral canvas, pastel chart accents, Poppins typography, round controls, airy card spacing, and adaptive sidebar behavior. The desktop information density is preserved while tables, panels, modals, and navigation are reflowed for tablet and mobile widths.

All records are representative front-end data and are intentionally kept local so the submitted dashboard runs without secrets or external services.
