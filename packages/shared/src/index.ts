export enum WasteType {
  Household = 'household',
  Recycling = 'recycling',
  Organic = 'organic',
  Construction = 'construction',
  Hazardous = 'hazardous',
  Bulk = 'bulk'
}

export enum PickupStatus {
  Requested = 'requested',
  Assigned = 'assigned',
  InProgress = 'in_progress',
  Completed = 'completed',
  Cancelled = 'cancelled'
}

export enum ServiceType {
  Residential = 'residential',
  Commercial = 'commercial'
}

export type Coordinate = {
  lat: number;
  lng: number;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceType: ServiceType;
};

export type Driver = {
  id: string;
  name: string;
  vehicleType: string;
  currentLocation: Coordinate;
  active: boolean;
};

export type PickupRequest = {
  id: string;
  customerId: string;
  wasteType: WasteType;
  serviceType: ServiceType;
  status: PickupStatus;
  pickupLocation: Coordinate;
  scheduledFor: string;
  notes?: string;
  assignedDriverId?: string;
};

export type RouteStop = {
  id: string;
  pickupId: string;
  location: Coordinate;
  sequence: number;
  status: PickupStatus;
};
