export type LatLng = {
  lat: number;
  lng: number;
};

export type RouteStopInput = {
  id: string;
  customerName?: string;
  pickupLocationLat: number;
  pickupLocationLng: number;
  status?: string;
  scheduledFor?: string | Date;
};

const toRadians = (value: number) => (value * Math.PI) / 180;

export const haversineDistanceKm = (from: LatLng, to: LatLng) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.lat)) *
      Math.cos(toRadians(to.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

export const optimizeRouteStops = (
  stops: RouteStopInput[],
  startLocation: LatLng = { lat: 0, lng: 0 }
) => {
  const remaining = [...stops];
  const ordered: Array<RouteStopInput & { sequence: number; distanceFromPreviousKm: number }> = [];
  let currentLocation = startLocation;

  while (remaining.length > 0) {
    let bestStop = remaining[0];
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let index = 0; index < remaining.length; index += 1) {
      const stop = remaining[index];
      const distance = haversineDistanceKm(currentLocation, {
        lat: stop.pickupLocationLat,
        lng: stop.pickupLocationLng
      });

      if (distance < bestDistance) {
        bestDistance = distance;
        bestStop = stop;
        bestIndex = index;
      }
    }

    remaining.splice(bestIndex, 1);

    ordered.push({
      ...bestStop,
      sequence: ordered.length + 1,
      distanceFromPreviousKm: bestDistance
    });

    currentLocation = {
      lat: bestStop.pickupLocationLat,
      lng: bestStop.pickupLocationLng
    };
  }

  const totalDistanceKm = ordered.reduce((sum, stop) => sum + (stop.distanceFromPreviousKm || 0), 0);

  return {
    totalDistanceKm,
    stops: ordered.map(({ distanceFromPreviousKm, ...stop }) => ({
      ...stop,
      distanceFromPreviousKm
    }))
  };
};
