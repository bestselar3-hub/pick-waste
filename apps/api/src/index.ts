import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PickupStatus, ServiceType, WasteType, type PickupRequest } from '@pickwaste/shared';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

const pickups: PickupRequest[] = [
  {
    id: 'pickup-1001',
    customerId: 'cust-001',
    wasteType: WasteType.Household,
    serviceType: ServiceType.Residential,
    status: PickupStatus.Assigned,
    pickupLocation: { lat: 6.5244, lng: 3.3792 },
    scheduledFor: '2026-10-05T09:00:00.000Z',
    notes: 'Large household waste bin',
    assignedDriverId: 'driver-001'
  },
  {
    id: 'pickup-1002',
    customerId: 'cust-002',
    wasteType: WasteType.Recycling,
    serviceType: ServiceType.Commercial,
    status: PickupStatus.Requested,
    pickupLocation: { lat: 6.5107, lng: 3.3499 },
    scheduledFor: '2026-10-05T11:30:00.000Z'
  }
];

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'pickwaste-api' });
});

app.get('/api/pickups', (_req, res) => {
  res.json({ data: pickups });
});

app.get('/api/pickups/:id', (req, res) => {
  const pickup = pickups.find((item) => item.id === req.params.id);

  if (!pickup) {
    return res.status(404).json({ error: 'Pickup not found' });
  }

  return res.json({ data: pickup });
});

app.post('/api/pickups', (req, res) => {
  const payload = req.body as Partial<PickupRequest>;

  const newPickup: PickupRequest = {
    id: `pickup-${Date.now()}`,
    customerId: payload.customerId ?? 'unknown-customer',
    wasteType: payload.wasteType ?? WasteType.Household,
    serviceType: payload.serviceType ?? ServiceType.Residential,
    status: payload.status ?? PickupStatus.Requested,
    pickupLocation: payload.pickupLocation ?? { lat: 0, lng: 0 },
    scheduledFor: payload.scheduledFor ?? new Date().toISOString(),
    notes: payload.notes,
    assignedDriverId: payload.assignedDriverId
  };

  pickups.push(newPickup);
  res.status(201).json({ data: newPickup });
});

app.get('/api/routes', (_req, res) => {
  res.json({
    data: [
      {
        routeId: 'route-01',
        driverId: 'driver-001',
        stops: [
          { pickupId: 'pickup-1001', sequence: 1, status: PickupStatus.Assigned },
          { pickupId: 'pickup-1002', sequence: 2, status: PickupStatus.Requested }
        ]
      }
    ]
  });
});

app.listen(port, () => {
  console.log(`PickWaste API is running on http://localhost:${port}`);
});
