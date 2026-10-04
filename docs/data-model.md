# PickWaste data model

## Core entities

### Customer
- id
- name
- email
- phone
- service_type
- created_at

### Driver
- id
- name
- vehicle_type
- current_location
- active
- created_at

### Vehicle
- id
- driver_id
- vehicle_type
- capacity_kg
- license_plate
- status

### PickupRequest
- id
- customer_id
- waste_type
- service_type
- pickup_location
- scheduled_for
- status
- notes
- assigned_driver_id

### Route
- id
- driver_id
- start_time
- end_time
- status

### RouteStop
- id
- route_id
- pickup_id
- sequence
- status

### WasteType
- household
- recycling
- organic
- construction
- hazardous
- bulk

## Relationship summary

A customer can have many pickup requests. A driver can be assigned to many pickup requests, and each route contains multiple stops. Vehicles are linked to drivers and support specific pickup categories and capacities.
