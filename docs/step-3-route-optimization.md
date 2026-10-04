# Step 3: Route optimization and dispatch intelligence

This phase makes PickWaste behave like a real waste logistics system instead of a simple queue.

## What is added

- nearest-neighbor route optimization using geographic distance
- driver-aware route planning based on current position
- optimized stop sequencing for waste pickups
- route summary with estimated distance and stop order

## New endpoints

- `GET /api/routes`
- `GET /api/routes/optimized?driverId=<driver-id>`

These endpoints return route data sorted by the most efficient stop order based on the driver’s current location.

## Why this matters

Route optimization is critical for:
- reducing fuel use
- lowering driver time per trip
- improving service speed
- supporting larger fleets and more cities

## Example behavior

The optimization service works by:
1. collecting active pickups
2. choosing the nearest pickup from the driver’s current location
3. repeating until all pickups are assigned in order
4. returning the route with total distance and stop sequencing

## Next steps

- Step 4: billing, invoices, and commercial waste contracts
- Step 5: multi-city dispatch and fleet analytics
