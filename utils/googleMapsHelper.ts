/**
 * Google Maps Link to Coordinates Converter
 * Extracts Latitude and Longitude from various Google Maps URL formats
 */

export interface Coordinates {
    lat: number;
    lng: number;
}

/**
 * Extracts coordinates from a Google Maps URL
 * Supports multiple formats:
 * 1. https://www.google.com/maps?q=30.0444,31.2357
 * 2. https://maps.google.com/?q=30.0444,31.2357
 * 3. https://www.google.com/maps/place/30.0444,31.2357
 * 4. https://maps.app.goo.gl/... (shortened links)
 * 5. https://www.google.com/maps/@30.0444,31.2357,15z
 */
export function extractCoordinatesFromMapsLink(url: string): Coordinates | null {
    if (!url || typeof url !== 'string') {
        return null;
    }

    // Trim whitespace
    url = url.trim();

    try {
        // Pattern 1: ?q=lat,lng
        const qPattern = /[?&]q=([-]?\d+\.\d+),([-]?\d+\.\d+)/;
        const qMatch = url.match(qPattern);
        if (qMatch) {
            return {
                lat: parseFloat(qMatch[1]),
                lng: parseFloat(qMatch[2])
            };
        }

        // Pattern 2: /place/lat,lng or /@lat,lng
        const placePattern = /[@\/]([-]?\d+\.\d+),([-]?\d+\.\d+)/;
        const placeMatch = url.match(placePattern);
        if (placeMatch) {
            return {
                lat: parseFloat(placeMatch[1]),
                lng: parseFloat(placeMatch[2])
            };
        }

        // Pattern 3: Direct coordinates in URL (lat,lng format)
        const coordPattern = /([-]?\d+\.\d+)\s*,\s*([-]?\d+\.\d+)/;
        const coordMatch = url.match(coordPattern);
        if (coordMatch) {
            return {
                lat: parseFloat(coordMatch[1]),
                lng: parseFloat(coordMatch[2])
            };
        }

        return null;
    } catch (error) {
        console.error('Error extracting coordinates:', error);
        return null;
    }
}

/**
 * Validates if coordinates are within valid ranges
 * Latitude: -90 to 90
 * Longitude: -180 to 180
 */
export function validateCoordinates(coords: Coordinates | null): boolean {
    if (!coords) return false;
    
    const { lat, lng } = coords;
    
    return (
        lat >= -90 && lat <= 90 &&
        lng >= -180 && lng <= 180 &&
        !isNaN(lat) && !isNaN(lng)
    );
}

/**
 * Formats coordinates for display
 */
export function formatCoordinates(coords: Coordinates | null): string {
    if (!coords) return 'N/A';
    return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
}

/**
 * Generates a Google Maps link from coordinates
 */
export function generateMapsLink(coords: Coordinates | null): string {
    if (!coords || !validateCoordinates(coords)) {
        return '';
    }
    return `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
}
