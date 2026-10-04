import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient, PickupStatus, ServiceType, WasteType } from '@prisma/client';
import { comparePassword, hashPassword, requireAuth, requireRole, signToken, type AuthenticatedRequest } from './auth';
import { optimizeRouteStops } from './routeOptimizer';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const getDistance = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const dx = a.lat - b.lat;
  const dy = a.lng - b.lng;
  return Math.sqrt(dx * dx + dy * dy);
};

const serializePickup = (pickup: any) => ({
  id: pickup.id,
  customerId: pickup.customerId,
  customerName: pickup.customer?.name ?? 'Unknown customer',
  wasteType: pickup.wasteType,
  serviceType: pickup.serviceType,
  status: pickup.status,
  pickupLocation: {
    lat: pickup.pickupLocationLat,
    lng: pickup.pickupLocationLng
  },
  scheduledFor: pickup.scheduledFor,
  notes: pickup.notes,
  assignedDriverId: pickup.assignedDriverId,
  completedAt: pickup.completedAt
});

const assignDriver = async (pickup: { serviceType: ServiceType; pickupLocationLat: number; pickupLocationLng: number }) => {
  const drivers = await prisma.driver.findMany({
    where: { active: true }
  });

  if (!drivers.length) return null;

  const candidates = drivers.filter((driver) => {
    if (driver.currentLocationLat == null || driver.currentLocationLng == null) return true;

    if (pickup.serviceType === ServiceType.residential) {
      return driver.vehicleType.toLowerCase().includes('truck') || driver.vehicleType.toLowerCase().includes('van');
    }

    return true;
  });

  const best = candidates.sort((a, b) => {
    const aDistance = a.currentLocationLat == null || a.currentLocationLng == null
      ? Number.MAX_SAFE_INTEGER
      : getDistance({ lat: a.currentLocationLat, lng: a.currentLocationLng }, { lat: pickup.pickupLocationLat, lng: pickup.pickupLocationLng });

    const bDistance = b.currentLocationLat == null || b.currentLocationLng == null
      ? Number.MAX_SAFE_INTEGER
      : getDistance({ lat: b.currentLocationLat, lng: b.currentLocationLng }, { lat: pickup.pickupLocationLat, lng: pickup.pickupLocationLng });

    return aDistance - bDistance;
  })[0];

  return best?.id ?? null;
};

const seedDatabase = async () => {
  const customerCount = await prisma.customer.count();
  if (customerCount > 0) return;

  const customers = [
    { name: 'Ada Johnson', email: 'ada@example.com', phone: '+2348001001001', serviceType: ServiceType.residential },
    { name: 'Green Valley Hotel', email: 'admin@greenvalley.com', phone: '+2348002002002', serviceType: ServiceType.commercial },
    { name: 'Miller Construction', email: 'ops@millerbuild.com', phone: '+2348003003003', serviceType: ServiceType.commercial }
  ];

  await prisma.customer.createMany({ data: customers });

  const drivers = [
    {
      name: 'Samuel Ade',
      vehicleType: '5-ton waste truck',
      currentLocationLat: 6.5244,
      currentLocationLng: 3.3792,
      active: true
    },
    {
      name: 'Chris Okafor',
      vehicleType: 'Mini recycling van',
      currentLocationLat: 6.5107,
      currentLocationLng: 3.3499,
      active: true
    },
    {
      name: 'Ifeoma Bello',
      vehicleType: 'Bulk haul truck',
      currentLocationLat: 6.5371,
      currentLocationLng: 3.4104,
      active: false
    }
  ];

  await prisma.driver.createMany({ data: drivers });

  const customerRecords = await prisma.customer.findMany();
  const driverRecords = await prisma.driver.findMany();

  await prisma.pickupRequest.createMany({
    data: [
      {
        customerId: customerRecords[0].id,
        wasteType: WasteType.household,
        serviceType: ServiceType.residential,
        status: PickupStatus.assigned,
        pickupLocationLat: 6.5244,
        pickupLocationLng: 3.3792,
        scheduledFor: new Date('2026-10-05T09:00:00.000Z'),
        notes: 'Large household waste bin',
        assignedDriverId: driverRecords[0].id
      },
      {
        customerId: customerRecords[1].id,
        wasteType: WasteType.recycling,
        serviceType: ServiceType.commercial,
        status: PickupStatus.requested,
        pickupLocationLat: 6.5107,
        pickupLocationLng: 3.3499,
        scheduledFor: new Date('2026-10-05T11:30:00.000Z')
      },
      {
        customerId: customerRecords[2].id,
        wasteType: WasteType.construction,
        serviceType: ServiceType.commercial,
        status: PickupStatus.completed,
        pickupLocationLat: 6.532,
        pickupLocationLng: 3.362,
        scheduledFor: new Date('2026-10-04T08:15:00.000Z'),
        assignedDriverId: driverRecords[1].id,
        completedAt: new Date('2026-10-04T09:02:00.000Z')
      }
    ]
  });

  const adminUserExists = await prisma.user.findUnique({ where: { email: 'admin@pickwaste.app' } });
  if (!adminUserExists) {
    const passwordHash = await hashPassword('admin123');
    await prisma.user.create({
      data: {
        name: 'System Admin',
        email: 'admin@pickwaste.app',
        passwordHash,
        role: 'admin'
      }
    });
  }
};

app.post('/api/auth/register', async (req, res) => {
  const payload = req.body as { name?: string; email?: string; password?: string; role?: 'admin' | 'customer' | 'driver' };

  if (!payload.name || !payload.email || !payload.password) {
    return res.status(400).json({ error: 'name, email, and password are required' });
  }

  const existing = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existing) {
    return res.status(409).json({ error: 'User already exists' });
  }

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      passwordHash: await hashPassword(payload.password),
      role: payload.role ?? 'customer'
    }
  });

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  return res.status(201).json({
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  });
});

app.post('/api/auth/login', async (req, res) => {
  const payload = req.body as { email?: string; password?: string };

  if (!payload.email || !payload.password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await comparePassword(payload.password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  return res.json({
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  });
});

app.get('/api/auth/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

app.get('/api/admin/panel', requireAuth, requireRole('admin'), async (_req, res) => {
  const summary = await prisma.pickupRequest.groupBy({
    by: ['status'],
    _count: { status: true }
  });

  res.json({ data: summary });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'pickwaste-api' });
});

app.get('/api/customers', async (_req, res) => {
  const customers = await prisma.customer.findMany();
  res.json({ data: customers });
});

app.get('/api/drivers', async (_req, res) => {
  const drivers = await prisma.driver.findMany();
  res.json({ data: drivers });
});

app.get('/api/pickups', async (_req, res) => {
  const pickups = await prisma.pickupRequest.findMany({
    include: { customer: true, assignedDriver: true }
  });

  res.json({ data: pickups.map(serializePickup) });
});

app.get('/api/pickups/:id', async (req, res) => {
  const pickup = await prisma.pickupRequest.findUnique({
    where: { id: req.params.id },
    include: { customer: true, assignedDriver: true }
  });

  if (!pickup) {
    return res.status(404).json({ error: 'Pickup not found' });
  }

  return res.json({ data: serializePickup(pickup) });
});

app.post('/api/pickups', async (req, res) => {
  const payload = req.body as any;

  if (!payload.customerId || !payload.wasteType || !payload.pickupLocation || !payload.scheduledFor) {
    return res.status(400).json({ error: 'customerId, wasteType, pickupLocation, and scheduledFor are required' });
  }

  const customer = await prisma.customer.findUnique({ where: { id: payload.customerId } });

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const pickupPayload = {
    customerId: customer.id,
    wasteType: payload.wasteType,
    serviceType: payload.serviceType ?? ServiceType.residential,
    pickupLocationLat: Number(payload.pickupLocation.lat),
    pickupLocationLng: Number(payload.pickupLocation.lng),
    scheduledFor: new Date(payload.scheduledFor),
    notes: payload.notes ?? '',
    status: PickupStatus.requested
  };

  const assignedDriverId = await assignDriver(pickupPayload);

  const newPickup = await prisma.pickupRequest.create({
    data: {
      ...pickupPayload,
      status: assignedDriverId ? PickupStatus.assigned : PickupStatus.requested,
      assignedDriverId: assignedDriverId ?? undefined
    },
    include: { customer: true, assignedDriver: true }
  });

  return res.status(201).json({ data: serializePickup(newPickup) });
});

app.patch('/api/pickups/:id/status', async (req, res) => {
  const pickup = await prisma.pickupRequest.findUnique({ where: { id: req.params.id } });

  if (!pickup) {
    return res.status(404).json({ error: 'Pickup not found' });
  }

  const nextStatus = String(req.body.status ?? pickup.status) as PickupStatus;

  const updated = await prisma.pickupRequest.update({
    where: { id: pickup.id },
    data: {
      status: nextStatus,
      completedAt: nextStatus === PickupStatus.completed ? new Date() : pickup.completedAt,
      assignedDriverId: pickup.assignedDriverId ?? (await assignDriver({
        serviceType: pickup.serviceType,
        pickupLocationLat: pickup.pickupLocationLat,
        pickupLocationLng: pickup.pickupLocationLng
      })) ?? pickup.assignedDriverId
    },
    include: { customer: true, assignedDriver: true }
  });

  return res.json({ data: serializePickup(updated) });
});

app.post('/api/pickups/:id/assign', async (req, res) => {
  const pickup = await prisma.pickupRequest.findUnique({ where: { id: req.params.id } });
  const driverId = req.body.driverId as string | undefined;

  if (!pickup) {
    return res.status(404).json({ error: 'Pickup not found' });
  }

  if (!driverId) {
    return res.status(400).json({ error: 'driverId is required' });
  }

  const updated = await prisma.pickupRequest.update({
    where: { id: pickup.id },
    data: {
      assignedDriverId: driverId,
      status: PickupStatus.assigned
    },
    include: { customer: true, assignedDriver: true }
  });

  return res.json({ data: serializePickup(updated) });
});

app.get('/api/routes', async (req, res) => {
  const driverId = String(req.query.driverId ?? '');
  const driver = driverId
    ? await prisma.driver.findUnique({ where: { id: driverId } })
    : null;

  const pickups = await prisma.pickupRequest.findMany({
    where: { status: { notIn: [PickupStatus.completed, PickupStatus.cancelled] } },
    include: { customer: true, assignedDriver: true },
    orderBy: { scheduledFor: 'asc' }
  });

  const startLocation = driver && driver.currentLocationLat != null && driver.currentLocationLng != null
    ? { lat: driver.currentLocationLat, lng: driver.currentLocationLng }
    : { lat: 6.5244, lng: 3.3792 };

  const optimized = optimizeRouteStops(
    pickups.map((pickup) => ({
      id: pickup.id,
      customerName: pickup.customer.name,
      pickupLocationLat: pickup.pickupLocationLat,
      pickupLocationLng: pickup.pickupLocationLng,
      status: pickup.status,
      scheduledFor: pickup.scheduledFor.toISOString()
    })),
    startLocation
  );

  res.json({
    data: {
      routeId: `route-${driverId || 'default'}`,
      driverId: driverId || pickups[0]?.assignedDriverId || null,
      totalDistanceKm: optimized.totalDistanceKm,
      stops: optimized.stops.map((stop) => ({
        pickupId: stop.id,
        customerName: stop.customerName,
        sequence: stop.sequence,
        status: stop.status,
        scheduledFor: stop.scheduledFor,
        distanceFromPreviousKm: Number(stop.distanceFromPreviousKm.toFixed(2))
      }))
    }
  });
});

app.get('/api/routes/optimized', async (req, res) => {
  const driverId = String(req.query.driverId ?? '');
  const driver = driverId
    ? await prisma.driver.findUnique({ where: { id: driverId } })
    : null;

  const pickups = await prisma.pickupRequest.findMany({
    where: { status: { notIn: [PickupStatus.completed, PickupStatus.cancelled] } },
    include: { customer: true, assignedDriver: true },
    orderBy: { scheduledFor: 'asc' }
  });

  const startLocation = driver && driver.currentLocationLat != null && driver.currentLocationLng != null
    ? { lat: driver.currentLocationLat, lng: driver.currentLocationLng }
    : { lat: 6.5244, lng: 3.3792 };

  const optimized = optimizeRouteStops(
    pickups.map((pickup) => ({
      id: pickup.id,
      customerName: pickup.customer.name,
      pickupLocationLat: pickup.pickupLocationLat,
      pickupLocationLng: pickup.pickupLocationLng,
      status: pickup.status,
      scheduledFor: pickup.scheduledFor.toISOString()
    })),
    startLocation
  );

  res.json({ data: optimized });
});

app.get('/api/summary', async (_req, res) => {
  const [totalPickups, activePickups, activeDrivers, completedToday] = await Promise.all([
    prisma.pickupRequest.count(),
    prisma.pickupRequest.count({
      where: { status: { notIn: [PickupStatus.completed, PickupStatus.cancelled] } }
    }),
    prisma.driver.count({ where: { active: true } }),
    prisma.pickupRequest.count({ where: { status: PickupStatus.completed } })
  ]);

  const nextPickup = await prisma.pickupRequest.findFirst({
    where: { status: { not: PickupStatus.completed } },
    orderBy: { scheduledFor: 'asc' }
  });

  res.json({
    data: {
      totalPickups,
      activePickups,
      activeDrivers,
      completedToday,
      averageRouteMinutes: 41,
      nextPickup: nextPickup?.scheduledFor ?? null
    }
  });
});

const startServer = async () => {
  await seedDatabase();
  app.listen(port, () => {
    console.log(`PickWaste API is running on http://localhost:${port}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start PickWaste API:', error);
  process.exit(1);
});
