import { IndiaRegion, indiaRegions } from './mockDataV1';

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export type GeolocationResult =
  | {
      success: true;
      coordinates: GeoCoordinates;
      matchedRegion: IndiaRegion;
    }
  | {
      success: false;
      error: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNSUPPORTED';
      message: string;
    };

// Wraps navigator.geolocation.getCurrentPosition in a Promise
export function getUserCoordinates(): Promise<GeoCoordinates> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      reject({
        error: 'UNSUPPORTED',
        message: 'Geolocation is not supported by your browser.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        let errorCode: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' = 'POSITION_UNAVAILABLE';
        let message = 'An unknown geolocation error occurred.';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorCode = 'PERMISSION_DENIED';
            message = 'User denied the request for Geolocation.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorCode = 'POSITION_UNAVAILABLE';
            message = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorCode = 'TIMEOUT';
            message = 'The request to get user location timed out.';
            break;
        }

        reject({
          error: errorCode,
          message,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

// Implements the Haversine formula to calculate great-circle distance
export function findNearestRegion(coords: GeoCoordinates, regions: IndiaRegion[]): IndiaRegion {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in kilometers

  let minDistance = Infinity;
  let nearest: IndiaRegion = regions[0];

  for (const region of regions) {
    const dLat = toRad(region.lat - coords.lat);
    const dLng = toRad(region.lng - coords.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(coords.lat)) *
        Math.cos(toRad(region.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    if (distance < minDistance) {
      minDistance = distance;
      nearest = region;
    }
  }

  return nearest;
}

// Locate and match pipeline
export async function locateAndMatch(): Promise<GeolocationResult> {
  try {
    const coordinates = await getUserCoordinates();
    const matchedRegion = findNearestRegion(coordinates, indiaRegions);
    return {
      success: true,
      coordinates,
      matchedRegion,
    };
  } catch (err: unknown) {
    const errorDetails = err as { error?: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNSUPPORTED'; message?: string };
    return {
      success: false,
      error: errorDetails.error || 'UNSUPPORTED',
      message: errorDetails.message || 'Geolocation lookup failed.',
    };
  }
}
