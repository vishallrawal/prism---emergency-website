const express = require('express');
const fetch = require('node-fetch');
const { getDB } = require('../db');

const router = express.Router();
const tomtomBaseUrl = 'https://api.tomtom.com';

router.get('/config', (req, res) => {
  if (!process.env.TOMTOM_API_KEY) {
    return res.status(503).json({ message: 'TomTom API key is not configured on the server.' });
  }

  res.json({ key: process.env.TOMTOM_API_KEY });
});

router.get('/route', async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).json({ message: 'Starting point and destination are required.' });
  }
  if (!process.env.TOMTOM_API_KEY) {
    return res.status(503).json({ message: 'TomTom API key is not configured on the server.' });
  }

  try {
    const [startPosition, endPosition] = await Promise.all([
      resolveLocation(String(start)),
      resolveLocation(String(end))
    ]);

    const routeUrl = new URL(`${tomtomBaseUrl}/routing/1/calculateRoute/${startPosition.lat},${startPosition.lon}:${endPosition.lat},${endPosition.lon}/json`);
    routeUrl.searchParams.set('key', process.env.TOMTOM_API_KEY);
    routeUrl.searchParams.set('traffic', 'true');
    routeUrl.searchParams.set('routeType', 'fastest');
    routeUrl.searchParams.set('travelMode', 'car');

    const response = await fetch(routeUrl);
    const data = await response.json();

    if (response.ok && data.routes && data.routes[0]) {
      const route = data.routes[0];
      return res.json({
        start: startPosition,
        end: endPosition,
        distanceMeters: route.summary.lengthInMeters,
        travelTimeSeconds: route.summary.travelTimeInSeconds,
        points: route.legs[0].points.map((point) => [point.longitude, point.latitude])
      });
    }
    console.warn('TomTom route calculation warning:', data.error?.description || data.detailedError?.message);
    const fallback = generateFallbackRoute(startPosition, endPosition);
    return res.json(fallback);

  } catch (error) {
    console.error('Route calculation error:', error.message);
    try {
      const fallbackStart = parseCoordinates(String(start)) || { lat: 21.1702, lon: 72.8311 };
      const fallbackEnd = parseCoordinates(String(end)) || { lat: 21.1873, lon: 72.8157 };
      const fallback = generateFallbackRoute(fallbackStart, fallbackEnd);
      return res.json(fallback);
    } catch (fbErr) {
      res.status(502).json({ message: 'Unable to find a route. Check both locations and try again.' });
    }
  }
});

function parseCoordinates(query) {
  if (!query) return null;
  const coordMatch = query.match(/(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/);
  if (coordMatch) {
    const p1 = parseFloat(coordMatch[1]);
    const p2 = parseFloat(coordMatch[2]);
    if (!isNaN(p1) && !isNaN(p2)) {
      let lat = p1;
      let lon = p2;
      if (Math.abs(p1) > 50 && Math.abs(p2) <= 50) {
        lat = p2;
        lon = p1;
      }
      if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
        return { lat, lon };
      }
    }
  }
  return null;
}

async function resolveLocation(rawQuery) {
  if (!rawQuery) throw new Error('Location query is required');
  const query = String(rawQuery).trim();
  const coords = parseCoordinates(query);
  if (coords) {
    return coords;
  }
  try {
    const db = getDB();
    if (db) {
      const cleanName = query.replace(/,\s*(Surat|Gujarat|India).*/i, '').trim();
      let localService = await db.collection('nearby_services').findOne(
        { name: { $regex: cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
        { projection: { lat: 1, lng: 1, name: 1 } }
      );

      if (!localService) {
        const words = cleanName.split(/\s+/).filter(w => w.length >= 4);
        for (const w of words) {
          localService = await db.collection('nearby_services').findOne(
            { name: { $regex: w, $options: 'i' } },
            { projection: { lat: 1, lng: 1, name: 1 } }
          );
          if (localService) break;
        }
      }

      if (localService && Number.isFinite(localService.lat) && Number.isFinite(localService.lng)) {
        return { lat: localService.lat, lon: localService.lng };
      }
    }
  } catch (err) {
    console.warn('DB lookup warning in resolveLocation:', err.message);
  }
  const cleanSearchQuery = query
    .replace(/^My\s+Live\s+Location\s*/i, '')
    .replace(/[()]/g, '')
    .trim();

  return getPosition(await geocode(cleanSearchQuery || query));
}

async function geocode(query) {
  const searchQuery = query.toLowerCase().includes('surat') ? query : `${query}, Surat, Gujarat, India`;
  const url = new URL(`${tomtomBaseUrl}/search/2/geocode/${encodeURIComponent(searchQuery)}.json`);
  url.searchParams.set('key', process.env.TOMTOM_API_KEY);
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrySet', 'IN');

  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok || !data.results || !data.results[0]) {
    throw new Error(`Location not found: ${query}`);
  }

  return data.results[0];
}

function getPosition(result) {
  const position = result.position;
  if (!position || !Number.isFinite(position.lat) || !Number.isFinite(position.lon)) {
    throw new Error('TomTom returned an invalid location.');
  }
  return { lat: position.lat, lon: position.lon };
}

function generateFallbackRoute(start, end) {
  const steps = 30;
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const frac = i / steps;
    const curve = Math.sin(frac * Math.PI) * 0.003;
    const lat = start.lat + (end.lat - start.lat) * frac + curve;
    const lon = start.lon + (end.lon - start.lon) * frac;
    points.push([lon, lat]);
  }
  const dLat = (end.lat - start.lat) * Math.PI / 180;
  const dLon = (end.lon - start.lon) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(start.lat * Math.PI / 180) * Math.cos(end.lat * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceMeters = Math.round(6371000 * c);
  const travelTimeSeconds = Math.round((distanceMeters / 1000) / 40 * 3600);

  return {
    start,
    end,
    distanceMeters,
    travelTimeSeconds,
    points
  };
}

module.exports = router;
