# Step 1: Database-backed foundation for PickWaste

This phase converts the MVP from a demo-only app into a data-backed waste logistics system.

## What we are adding

- PostgreSQL as the primary datastore
- Prisma ORM for schema and queries
- Customer, driver, and pickup persistence
- Driver assignment logic persisted in the database
- Summary and route endpoints backed by real data

## Why this matters

At this stage, the app can now support real operations beyond mock data. This is the foundation required before adding:
- authentication
- route optimization
- recurring pickups
- billing and invoices
- multi-city operations

## Run setup

1. Create a PostgreSQL database or use Docker Compose
2. Update `.env` with your `DATABASE_URL`
3. Run:

   npm install
   npx prisma migrate dev --name init
   npm run dev

## Next steps after Step 1

- Step 2: Authentication and role-based access
- Step 3: Route optimization and map integration
- Step 4: Billing, invoicing, and subscription logic
- Step 5: Multi-city support and fleet analytics
