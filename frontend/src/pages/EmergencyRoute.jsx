import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function EmergencyRoute() {
  const [searchParams] = useSearchParams();
  const [startingPoint, setStartingPoint] = useState('Surat Railway Station');
  const [endPoint, setEndPoint] = useState(searchParams.get('destination') || 'SMIMER Hospital, Surat');
  const [routeInfo, setRouteInfo] = useState({ distance: '4.8 km', time: '12 mins', status: 'Optimal emergency priority path calculated' });
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [mapError, setMapError] = useState('');
  const mapElement = useRef(null);
  const mapInstance = useRef(null);
  const routeMarker = useRef(null);
  const animationFrame = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function initializeMap() {
      try {
        const configResponse = await fetch('/api/maps/config');
        const config = await configResponse.json();
        if (!configResponse.ok) throw new Error(config.message || 'TomTom map configuration failed.');
        if (cancelled || !mapElement.current) return;

        const map = tt.map({
          key: config.key,
          container: mapElement.current,
          center: [72.8311, 21.1702],
          zoom: 13
        });
        map.addControl(new tt.NavigationControl());
        map.on('load', () => {
          map.addSource('emergency-route', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } } });
          map.addLayer({ id: 'emergency-route-line', type: 'line', source: 'emergency-route', paint: { 'line-color': '#22c55e', 'line-width': 6 } });
        });
        mapInstance.current = map;
      } catch (error) {
        console.error('TomTom map initialization failed:', error.message);
        setMapError(error.message);
      }
    }
    initializeMap();

    return () => {
      cancelled = true;
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
      if (routeMarker.current) routeMarker.current.remove();
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const handleFetchLiveLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const locString = `My Live Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        setStartingPoint(locString);

        if (mapInstance.current) {
          mapInstance.current.flyTo({ center: [lng, lat], zoom: 15 });
          new tt.Marker({ color: '#22c55e' })
            .setLngLat([lng, lat])
            .setPopup(new tt.Popup().setHTML('<b>Your Live GPS Location</b>'))
            .addTo(mapInstance.current);
        }
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        alert('Could not fetch live location. Please check location permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCalculateRoute = (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setMapError('');
    fetch(`/api/maps/route?start=${encodeURIComponent(startingPoint)}&end=${encodeURIComponent(endPoint)}`)
      .then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Route search failed.');
      return data;
      })
      .then((data) => {
      const distance = (data.distanceMeters / 1000).toFixed(1);
      const minutes = Math.max(1, Math.round(data.travelTimeSeconds / 60));
      setRouteInfo({
        distance: `${distance} km`,
        time: `${minutes} mins`,
        status: `TomTom fastest route from "${startingPoint}" to "${endPoint}"`
      });
      drawRoute(data.points);
      })
      .catch((error) => setMapError(error.message))
      .finally(() => setLoading(false));
  };

  const drawRoute = (coordinates) => {
    const map = mapInstance.current;
    if (!map || coordinates.length < 2) return;
    const updateRoute = () => {
      const source = map.getSource('emergency-route');
      if (source) source.setData({ type: 'Feature', geometry: { type: 'LineString', coordinates } });
    };
    if (map.loaded()) updateRoute();
    else map.once('load', updateRoute);
    map.fitBounds(coordinates.reduce((bounds, point) => bounds.extend(point), new tt.LngLatBounds(coordinates[0], coordinates[0])), { padding: 60 });

    if (routeMarker.current) routeMarker.current.remove();
    routeMarker.current = new tt.Marker({ color: '#e62e2e' }).setLngLat(coordinates[0]).addTo(map);
    let index = 0;
    const move = () => {
      if (!routeMarker.current || index >= coordinates.length) return;
      routeMarker.current.setLngLat(coordinates[index++]);
      animationFrame.current = requestAnimationFrame(move);
    };
    if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    move();
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content">
        <div className="route-container">
          <div className="panel">
            <div className="panel-header">
              <i className="fa-solid fa-compass" style={{ color: '#e62e2e' }}></i> Emergency Route Optimizer
            </div>

            <form onSubmit={handleCalculateRoute}>
              <div className="input-group">
                <div className="label-with-btn">
                  <span className="input-label">STARTING POINT</span>
                  <button type="button" className="btn-fetch-gps" onClick={handleFetchLiveLocation} disabled={gpsLoading}>
                    <i className="fa-solid fa-crosshairs"></i> {gpsLoading ? 'Fetching...' : 'Fetch Live Location'}
                  </button>
                </div>
                <div className="input-box">
                  <i className="fa-solid fa-circle-dot" style={{ color: '#22c55e' }}></i>
                  <input 
                    type="text" 
                    value={startingPoint} 
                    onChange={(e) => setStartingPoint(e.target.value)} 
                    placeholder="Enter starting location or fetch GPS" 
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <span className="input-label">END POINT</span>
                <div className="input-box">
                  <i className="fa-solid fa-location-dot" style={{ color: '#e62e2e' }}></i>
                  <input 
                    type="text" 
                    value={endPoint} 
                    onChange={(e) => setEndPoint(e.target.value)} 
                    placeholder="Enter destination hospital / location" 
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-find-route" disabled={loading}>
                {loading ? <span className="spinner"></span> : <><i className="fa-solid fa-magnifying-glass"></i> Search Routes</>}
              </button>
            </form>

            <div className="input-group" style={{ marginTop: '16px' }}>
              <span className="input-label">TRAFFIC PATH ANALYSIS</span>

              <div className="route-option active">
                <div className="route-info">
                  <h4>PRISM Green Priority Corridor</h4>
                  <p>{routeInfo.status}</p>
                </div>
                <div className="route-time">
                  <div className="time">{routeInfo.time}</div>
                  <div className="dist">{routeInfo.distance}</div>
                </div>
              </div>
            </div>

            <div className="info-badge-clean">
              <i className="fa-solid fa-shield-halved" style={{ color: '#38bdf8' }}></i> Powered by PRISM Emergency Synchronization Engine for Surat City.
            </div>
          </div>

          <div className="map-wrapper">
            <div className="map-overlay-badge">
              <div className="pulse-dot"></div> Live Surat Emergency Synchronization
            </div>
            <div ref={mapElement} id="map-container" className="tomtom-map" style={{ width: '100%', height: '100%', minHeight: '500px' }}></div>
            {mapError && <div className="map-error">{mapError}</div>}
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        .route-container { display: grid; grid-template-columns: 380px 1fr; gap: 20px; padding: 24px 40px; }
        .panel { background: #0c1220; border: 1px solid #162035; border-radius: 14px; padding: 24px; display: flex; flex-direction: column; gap: 18px; }
        .panel-header { font-size: 18px; font-weight: 800; display: flex; align-items: center; gap: 10px; color: #ffffff; }

        .input-group { display: flex; flex-direction: column; gap: 6px; }
        .label-with-btn { display: flex; justify-content: space-between; align-items: center; }
        .input-label { font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 0.5px; }

        .btn-fetch-gps {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #34d399;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: background 0.2s;
        }

        .btn-fetch-gps:hover { background: rgba(34, 197, 94, 0.2); }

        .input-box { background: #060913; border: 1px solid #1e2c45; border-radius: 8px; padding: 10px 14px; color: #ffffff; font-size: 13px; display: flex; align-items: center; gap: 10px; }
        .input-box input { background: transparent; border: none; color: #ffffff; width: 100%; outline: none; font-size: 13px; font-weight: 600; }

        .btn-find-route { background: #e62e2e; color: #fff; border: none; padding: 14px; border-radius: 8px; font-weight: 800; font-size: 14px; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 10px; width: 100%; transition: background 0.2s; }
        .btn-find-route:hover { background: #dc2626; }

        .route-option { background: #060913; border: 1px solid #10b981; border-radius: 10px; padding: 16px; display: flex; justify-content: space-between; align-items: center; background: rgba(16, 185, 129, 0.05); }
        .route-info h4 { font-size: 13px; font-weight: 700; color: #34d399; margin-bottom: 4px; }
        .route-info p { font-size: 11px; color: #64748b; }
        .route-time { text-align: right; }
        .route-time .time { font-size: 16px; font-weight: 800; color: #34d399; }
        .route-time .dist { font-size: 11px; color: #64748b; }

        .info-badge-clean { background: rgba(56, 189, 248, 0.05); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 8px; padding: 12px; font-size: 11px; color: #94a3b8; display: flex; align-items: center; gap: 8px; }

        .map-wrapper { position: relative; border-radius: 14px; overflow: hidden; border: 1px solid #162035; min-height: 500px; }
        .map-error { position: absolute; inset: 50% auto auto 50%; transform: translate(-50%, -50%); width: 80%; padding: 16px; border-radius: 8px; background: rgba(8, 13, 26, 0.9); color: #fca5a5; text-align: center; font-size: 13px; }
        .map-overlay-badge { position: absolute; top: 16px; right: 16px; z-index: 500; background: rgba(8, 13, 26, 0.85); border: 1px solid #1e2c45; backdrop-filter: blur(8px); padding: 8px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; color: #22c55e; display: flex; align-items: center; gap: 8px; }
        .pulse-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 8px #22c55e; }

        @media (max-width: 900px) {
          .route-container { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}