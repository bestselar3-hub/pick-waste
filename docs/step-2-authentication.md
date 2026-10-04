# Step 2: Authentication and role-based access

This phase introduces secure access control for the PickWaste platform.

## What is included

- JWT-based authentication
- User account creation and login
- Role-based access control (`admin`, `customer`, `driver`)
- Protected admin route example
- Seeded system admin account for testing

## Default demo credentials

- Email: `admin@pickwaste.app`
- Password: `admin123`

## Authentication flow

1. Register a user through `/api/auth/register`
2. Login through `/api/auth/login`
3. Include the returned token as:

   Authorization: Bearer <token>

4. Access protected routes like `/api/auth/me` or `/api/admin/panel`

## Protected endpoints

- `GET /api/auth/me`
- `GET /api/admin/panel`

## Next steps

- Step 3: Route optimization and map integration
- Step 4: Billing, invoicing, and subscriptions
- Step 5: Multi-city dispatch and scalability
