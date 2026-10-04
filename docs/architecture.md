# PickWaste architecture

This project is organized as a modular monorepo so it can start as a single-city operations platform and grow into a multi-city resource network.

## System goals

- Accept waste pickup requests from customers
- Match service requests to the most appropriate vehicle
- Support residential and commercial waste flows
- Provide drivers with route-aware instructions
- Allow admins to monitor jobs, fleet state, and performance
- Capture proof of service and support recurring pickups

## Core components

### 1. Customer portal
A customer-facing booking app where users can:
- request pickups
- select waste type and pickup windows
- track jobs in real time
- view billing and service history

### 2. Driver app
A route execution tool for drivers with:
- assigned pickups
- turn-by-turn navigation integration
- proof-of-service capture
- status updates and notes

### 3. Admin dashboard
Operational control center for:
- fleet scheduling
- route planning and balancing
- customer and driver oversight
- pricing, reporting, and analytics

### 4. API layer
Handles request validation, assignment logic, route retrieval, and status transitions.

### 5. Data layer
A PostgreSQL + PostGIS foundation for location-aware and operational data.

## Recommended production stack

- Frontend: Next.js + React
- Mobile: React Native / Expo
- API: NestJS or Express
- Database: PostgreSQL with PostGIS
- Messaging: Redis + BullMQ
- Maps: Mapbox or Google Maps
- Storage: S3-compatible object storage
- Authentication: Auth0, Clerk, or Firebase Auth

## MVP flow

1. Customer creates pickup request
2. System validates waste type and service area
3. Admin or automation assigns a driver and vehicle
4. Driver receives route and pickup details
5. Driver confirms location and completes the job
6. Admin monitors service and updates billing status
