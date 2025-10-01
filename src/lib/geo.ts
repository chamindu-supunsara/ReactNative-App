export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// Utility function to validate location coordinates
export function isValidLocation(latitude: number, longitude: number): boolean {
    return (
        typeof latitude === 'number' &&
        typeof longitude === 'number' &&
        !isNaN(latitude) &&
        !isNaN(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
    );
}

// Utility function to format location error messages
export function getLocationErrorMessage(error: any): string {
    if (error.code === 'TIMEOUT') {
        return 'Location request timed out. Please check your GPS signal and try again.';
    } else if (error.code === 'LOCATION_UNAVAILABLE') {
        return 'Location is currently unavailable. Please check your GPS settings.';
    } else if (error.message?.includes('Invalid location')) {
        return 'Invalid location data received. Please try again.';
    } else if (error.message?.includes('permission')) {
        return 'Location permission denied. Please grant permission in settings.';
    }
    return 'Failed to get your location. Please try again.';
}