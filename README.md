# PickWaste

PickWaste is a waste collection and management platform built for residential and commercial pickup workflows. It helps customers schedule pickups, assigns drivers to optimized routes, tracks completion, and gives admins visibility into operations, billing, and service performance.

## Overview

This repository contains the initial monorepo foundation for the PickWaste MVP.

## Included apps

- `apps/api` — Express + TypeScript API for pickups, routes, and status workflows
- `apps/admin` — Next.js admin dashboard for operations and reporting
- `apps/customer` — Next.js customer portal for booking and service tracking
- `apps/driver` — Vite + React driver interface for route execution
- `packages/shared` — shared domain types and enums used across the stack

## Getting started

1. Install dependencies:

   npm install

2. Start the API:

   npm run dev

3. Start individual apps in their directories:

   cd apps/admin && npm run dev
   cd apps/customer && npm run dev
   cd apps/driver && npm run dev

## Architecture

PickWaste follows a modular approach so the system can evolve from one-city operations into multi-city fleet management.

- Customer web portal for requests and booking
- Driver app for pickup execution and route completion
- Admin dashboard for assignment, pricing, and reporting
- Shared backend and schema layer for service consistency
- Postgres + Redis-ready foundation for a production-grade rollout

## MVP scope

- Book residential or commercial waste pickups
- Assign pickups to drivers and trucks
- Track job status from pickup requested to completed
- Capture service notes, images, and job evidence
- Admin dashboard for operations and reporting
- Shared pricing and waste-type model

## Roadmap

- Phase 1: single-city MVP
- Phase 2: route optimization and recurring pickups
- Phase 3: commercial accounts and fleet management
- Phase 4: smart bins and sensor-enabled pickups
- Phase 5: city-wide and multi-region operations

## Repository structure

- `apps/` — product interfaces and service apps
- `packages/` — common models and shared logic
- `docs/` — implementation planning and data model guidance
- `docker-compose.yml` — local infrastructure bootstrap

## License

MIT
