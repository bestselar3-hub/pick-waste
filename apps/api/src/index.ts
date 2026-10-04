import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PickupStatus, ServiceType, WasteType, type PickupRequest } from '@pickwaste/shared';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

const customers = [
  {
    id: 'cust-001',
    name: 'Ada Johnson',
    email: 'ada@example.com',
    phone: '+2348001001001',
    serviceType: ServiceType.Residential
  },
  {
    id: 'cust-002',
    name: 'Green Valley Hotel',
    email: 'admin@greenvalley.com',
    phone: '+2348002002002',
    serviceType: ServiceType.Commercial
  },
  {
    id: 'cust-003',
    name: 'Miller Construction',
    email: 'ops@millerbuild.com',
    phone: '+2348003003003',
    serviceType: ServiceType.Commercial
  }
];

const drivers = [
  {
    id: 'driver-001',
    name: 'Samuel Ade',
    vehicleType: '5-ton waste truck',
    currentLocation: { lat: 6.5244, lng: 3.3792 },
    active: true
  },
  {
    id: 'driver-002',
    name: 'Chris Okafor',
    vehicleType: 'Mini recycling van',
    currentLocation: { lat: 6.5107, lng: 3.3499 },
    active: true
  },
  {
    id: 'driver-003',
    name: 'Ifeoma Bello',
    vehicleType: 'Bulk haul truck',
    currentLocation: { lat: 6.5371, lng: 3.4104 },
    active: false
  }
];

const pickups: PickupRequest[] = [
  {
    id: 'pickup-1001',
    customerId: 'cust-001',
    customerName: 'Ada Johnson',
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
    customerName: 'Green Valley Hotel',
    wasteType: WasteType.Recycling,
    serviceType: ServiceType.Commercial,
    status: PickupStatus.Requested,
    pickupLocation: { lat: 6.5107, lng: 3.3499 },
    scheduledFor: '2026-10-05T11:30:00.000Z'
  },
  {
    id: 'pickup-1003',
    customerId: 'cust-003',
    customerName: 'Miller Construction',
    wasteType: WasteType.Construction,
    serviceType: ServiceType.Commercial,
    status: PickupStatus.Completed,
    pickupLocation: { lat: 6.532, lng: 3.362 },
    scheduledFor: '2026-10-04T08:15:00.000Z',
    assignedDriverId: 'driver-002',
    completedAt: '2026-10-04T09:02:00.000Z'
  }
];

const getDistance = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const dx = a.lat - b.lat;
  const dy = a.lng - b.lng;
  return Math.sqrt(dx * dx + dy * dy);
};

const assignDriver = (pickup: PickupRequest) => {
  const activeDrivers = drivers.filter((driver) => driver.active);

  if (!activeDrivers.length) {
    return undefined;
  }

  const candidates = activeDrivers.filter((driver) => {
    if (pickup.serviceType === ServiceType.Residential) {
      return driver.vehicleType.toLowerCase().includes('truck') || driver.vehicleType.toLowerCase().includes('van');
    }

    return true;
  });

  const bestDriver = candidates.sort(
    (a, b) => getDistance(a.currentLocation, pickup.pickupLocation) - getDistance(b.currentLocation, pickup.pickupLocation)
  )[0];

  return bestDriver?.id;
};

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'pickwaste-api' });
});

app.get('/api/customers', (_req, res) => {
  res.json({ data: customers });
});

app.get('/api/drivers', (_req, res) => {
  res.json({ data: drivers });
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

app.get('/api/summary', (_req, res) => {
  const activePickups = pickups.filter((pickup) => pickup.status !== PickupStatus.Completed && pickup.status !== PickupStatus.Cancelled);

  res.json({
    data: {
      totalPickups: pickups.length,
      activePickups: activePickups.length,
      activeDrivers: drivers.filter((driver) => driver.active).length,
      completedToday: pickups.filter((pickup) => pickup.status === PickupStatus.Completed).length,
      averageRouteMinutes: 41,
      nextPickup: pickups[0]?.scheduledFor ?? null
    }
  });
});

app.post('/api/pickups', (req, res) => {
  const payload = req.body as Partial<PickupRequest> & { customerName?: string };

  if (!payload.customerId || !payload.wasteType || !payload.pickupLocation || !payload.scheduledFor) {
    return res.status(400).json({ error: 'customerId, wasteType, pickupLocation, and scheduledFor are required' });
  }

  const matchingCustomer = customers.find((customer) => customer.id === payload.customerId);

  const newPickup: PickupRequest = {
    id: `pickup-${Date.now()}`,
    customerId: payload.customerId,
    customerName: payload.customerName ?? matchingCustomer?.name ?? 'New customer',
    wasteType: payload.wasteType as WasteType,
    serviceType: (payload.serviceType as ServiceType) ?? ServiceType.Residential,
    status: PickupStatus.Requested,
    pickupLocation: {
      lat: Number(payload.pickupLocation.lat),
      lng: Number(payload.pickupLocation.lng)
    },
    scheduledFor: payload.scheduledFor,
    notes: payload.notes,
    assignedDriverId: undefined
  };

  const driverId = assignDriver(newPickup);
  if (driverId) {
    newPickup.assignedDriverId = driverId;
    newPickup.status = PickupStatus.Assigned;
  }

  pickups.unshift(newPickup);
  return res.status(201).json({ data: newPickup });
});

app.patch('/api/pickups/:id/status', (req, res) => {
  const pickup = pickups.find((item) => item.id === req.params.id);

  if (!pickup) {
    return res.status(404).json({ error: 'Pickup not found' });
  }

  const nextStatus = String(req.body.status || pickup.status) as PickupStatus;
  pickup.status = nextStatus;

  if (nextStatus === PickupStatus.Completed) {
    pickup.completedAt = new Date().toISOString();
  }

  if (nextStatus === PickupStatus.InProgress) {
    pickup.assignedDriverId = pickup.assignedDriverId ?? assignDriver(pickup);
  }

  return res.json({ data: pickup });
});

app.post('/api/pickups/:id/assign', (req, res) => {
  const pickup = pickups.find((item) => item.id === req.params.id);
  const driverId = req.body.driverId as string | undefined;

  if (!pickup) {
    return res.status(404).json({ error: 'Pickup not found' });
  }

  if (!driverId) {
    return res.status(400).json({ error: 'driverId is required' });
  }

  pickup.assignedDriverId = driverId;
  pickup.status = PickupStatus.Assigned;

  return res.json({ data: pickup });
});

app.get('/api/routes', (_req, res) => {
  res.json({
    data: [
      {
        routeId: 'route-01',
        driverId: 'driver-001',
        stops: pickups.slice(0, 2).map((pickup, index) => ({
          pickupId: pickup.id,
          sequence: index + 1,
          status: pickup.status
        }))
      }
    ]
  });
});

app.listen(port, () => {
  console.log(`PickWaste API is running on http://localhost:${port}`);
});
