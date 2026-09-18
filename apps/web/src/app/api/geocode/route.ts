import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface GeocodeItem {
  id: string;
  name: string;
  displayName: string;
  state: string;
  district?: string;
  coordinates: [number, number]; // [lng, lat]
  importance?: number;
  type?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results: GeocodeItem[] = [];

  // Provider 1: Photon OpenStreetMap Geocoder (India bounding box)
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
      query
    )}&limit=8&bbox=68.1,6.5,97.4,35.5`;
    const pRes = await fetch(photonUrl, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Bhoomitra-LandGovernance/1.0 (contact@bhoomitra.gov.in)',
      },
      next: { revalidate: 3600 },
    });

    if (pRes.ok) {
      const pData = await pRes.json();
      if (Array.isArray(pData?.features)) {
        for (const feat of pData.features) {
          const props = feat.properties || {};
          const geom = feat.geometry || {};
          if (
            geom.type === 'Point' &&
            Array.isArray(geom.coordinates) &&
            geom.coordinates.length >= 2
          ) {
            const [lng, lat] = geom.coordinates;
            // Validate within India approximate bounding box
            if (lng >= 68.0 && lng <= 97.5 && lat >= 6.5 && lat <= 37.5) {
              const name = props.name || query;
              const state = props.state || '';
              const district = props.district || props.county || '';
              const parts = [name, district, state, 'India'].filter(Boolean);
              results.push({
                id: `PHOTON-${props.osm_id || Math.random().toString(36).slice(2, 9)}`,
                name,
                displayName: parts.join(', '),
                state,
                district,
                coordinates: [lng, lat],
                type: props.type || props.osm_value,
              });
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Photon geocoding failed:', err);
  }

  // Provider 2: Nominatim OSM fallback (with official User-Agent header)
  if (results.length < 3) {
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&addressdetails=1&limit=6&q=${encodeURIComponent(
        query
      )}`;
      const nRes = await fetch(nomUrl, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Bhoomitra-LandGovernance/1.0 (suryanshukr3078@gmail.com)',
        },
        next: { revalidate: 3600 },
      });

      if (nRes.ok) {
        const nData = await nRes.json();
        if (Array.isArray(nData)) {
          for (const item of nData) {
            const lat = parseFloat(item.lat);
            const lng = parseFloat(item.lon);
            if (!isNaN(lat) && !isNaN(lng)) {
              const address = item.address || {};
              const state = address.state || address.state_district || '';
              const district = address.county || address.state_district || '';
              const name =
                address.city ||
                address.town ||
                address.village ||
                address.suburb ||
                item.name ||
                item.display_name.split(',')[0];

              // Check if duplicate
              const isDuplicate = results.some(
                (r) =>
                  Math.abs(r.coordinates[0] - lng) < 0.05 &&
                  Math.abs(r.coordinates[1] - lat) < 0.05
              );

              if (!isDuplicate) {
                results.push({
                  id: `NOM-${item.place_id || Math.random().toString(36).slice(2, 9)}`,
                  name: name || query,
                  displayName: item.display_name,
                  state,
                  district,
                  coordinates: [lng, lat],
                  importance: item.importance,
                  type: item.type,
                });
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('Nominatim fallback failed:', err);
    }
  }

  return NextResponse.json({
    query,
    count: results.length,
    results,
  });
}
