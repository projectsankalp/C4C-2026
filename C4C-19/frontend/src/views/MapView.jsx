import React, { useState, useEffect, useRef } from "react";
import { api } from "../services/api";

export default function MapView({ user, healthSummary, setActiveTab }) {
  const [activeFilter, setActiveFilter] = useState("government"); // government, private, testing
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nearestPHC, setNearestPHC] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState(null);

  // Map DOM Reference and Leaflet Instances
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // User Coordinates in Bantwal, Karnataka
  const userLat = 12.8966;
  const userLng = 75.0253;

  // Haversine formula to compute distance in km
  const getDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return "2.3";
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    return d.toFixed(1);
  };

  const isHighRisk = healthSummary?.diabetesRisk === "HIGH" || healthSummary?.hypertensionRisk === "HIGH";

  // 1. Initialize Map on Mount
  useEffect(() => {
    if (!window.L || mapInstanceRef.current) return;

    // Initialize Leaflet Map centered at user's coordinates
    const map = window.L.map(mapContainerRef.current, {
      zoomControl: false, // We will place pins elegantly or let standard gestures handle zoom
    }).setView([userLat, userLng], 14);

    // Load OpenStreetMap street tile layer
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    // Add standard Zoom control in a cleaner corner
    window.L.control.zoom({ position: "topright" }).addTo(map);

    // Create a pulsing Blue User Location Marker
    const userMarkerIcon = window.L.divIcon({
      className: "custom-user-gps-marker",
      html: `
        <div style="position: relative; width: 20px; height: 20px; display: flex; justify-content: center; align-items: center;">
          <div style="position: absolute; width: 14px; height: 14px; background-color: var(--primary); border: 2.5px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 8px rgba(26,59,245,0.4); z-index: 10;"></div>
          <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background-color: rgba(26,59,245,0.25); animation: pulse-wave 2s infinite ease-out; z-index: 5;"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    window.L.marker([userLat, userLng], { icon: userMarkerIcon })
      .addTo(map)
      .bindPopup("<strong style='font-family: Outfit; font-size:12px; color:var(--primary);'>You are here</strong><br/><span style='font-size:11px; color:var(--text-secondary);'>Bantwal, Karnataka</span>");

    // Initialize Marker Layer Group
    const markersGroup = window.L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = markersGroup;

    // Cleanup map instance on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Fetch seed clinics based on active Filter Tab
  useEffect(() => {
    const fetchHospitals = async () => {
      setLoading(true);
      try {
        let res;
        if (activeFilter === "government") res = await api.hospitals.getGov();
        else if (activeFilter === "private") res = await api.hospitals.getPrivate();
        else res = await api.hospitals.getTesting();

        if (res.success) {
          setHospitals(res.hospitals);
        }

        if (!nearestPHC) {
          const phcRes = await api.hospitals.getNearestPHC();
          if (phcRes.success) {
            setNearestPHC(phcRes.hospital);
          }
        }
      } catch (err) {
        const offlineHospitals = [
          { _id: "gov_1", name: "Bantwal PHC", type: "government", address: "Bantwal Town, Government Hospital Rd", latitude: 12.8988, longitude: 75.0222, contact: "+91 82552 30201", cost: "Free", available24x7: false },
          { _id: "gov_2", name: "Vittal PHC", type: "government", address: "Vittal Main Road, Near Bus Stand", latitude: 12.8942, longitude: 75.0125, contact: "+91 82552 40302", cost: "Free", available24x7: false },
          { _id: "priv_1", name: "Kaveri Hosp", type: "private", address: "KSR Road, Opp City Plaza, Bantwal", latitude: 12.9015, longitude: 75.0310, contact: "+91 82552 22550", cost: "Paid (Standard)", available24x7: true },
          { _id: "priv_2", name: "Srinivas Hospital", type: "private", address: "Srinivas Campus, Merlapadavu", latitude: 12.8950, longitude: 75.0420, contact: "+91 82552 99110", cost: "Paid (Standard)", available24x7: true },
          { _id: "test_1", name: "HealthLab Testing", type: "testing", address: "Laboratory Cross, Main Bazar Road", latitude: 12.8920, longitude: 75.0305, contact: "+91 82552 77889", cost: "Paid (Low Cost)", available24x7: false },
          { _id: "test_2", name: "BP Center Diagnostics", type: "testing", address: "Heart Care St, Next to Pharmacy", latitude: 12.8905, longitude: 75.0210, contact: "+91 82552 88440", cost: "Paid (Low Cost)", available24x7: false }
        ];
        const filtered = offlineHospitals.filter(h => h.type === activeFilter);
        setHospitals(filtered);
        setNearestPHC(offlineHospitals[0]);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, [activeFilter]);

  // 3. Render Leaflet Map Markers when hospitals list changes
  useEffect(() => {
    if (!markersLayerRef.current || !window.L) return;

    // Clear previous markers layer group
    markersLayerRef.current.clearLayers();

    hospitals.forEach(center => {
      const pinColor = center.type === "government" ? "var(--accent-green)" : center.type === "private" ? "var(--primary)" : "var(--accent-yellow)";
      const isPHC = center.name.includes("Bantwal PHC");
      const highRiskHighlight = isHighRisk && isPHC;

      // Custom high-fidelity clinic marker pin
      const markerHtml = `
        <div style="position: relative; width: 34px; height: 34px; display: flex; justify-content: center; align-items: center; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.18));">
          <svg viewBox="0 0 24 24" fill="${highRiskHighlight ? "var(--accent-red)" : pinColor}" stroke="#ffffff" stroke-width="1.5" style="width: 32px; height: 32px;">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          ${highRiskHighlight ? '<div style="position: absolute; width: 42px; height: 42px; border-radius: 50%; background-color: rgba(239, 68, 68, 0.25); animation: pulse-wave 1.5s infinite; border: 1px solid var(--accent-red);"></div>' : ''}
        </div>
      `;

      const clinicIcon = window.L.divIcon({
        className: "custom-leaflet-clinic-marker",
        html: markerHtml,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34]
      });

      const marker = window.L.marker([center.latitude, center.longitude], { icon: clinicIcon })
        .addTo(markersLayerRef.current)
        .bindPopup(`
          <div style="font-family: 'Outfit', sans-serif; padding: 4px; min-width: 140px;">
            <strong style="color: var(--text-primary); font-size: 13px; display: block; margin-bottom: 2px;">${center.name}</strong>
            <span style="color: var(--text-secondary); font-size: 11px; display: block; margin-bottom: 4px;">📍 ${center.address || "Bantwal"}</span>
            <strong style="color: var(--primary); font-size: 12px; display: block;">Distance: ${getDistance(userLat, userLng, center.latitude, center.longitude)} km</strong>
          </div>
        `);

      // Hover or tap triggers sliding info card
      marker.on("click", () => {
        setSelectedCenter(center);
        mapInstanceRef.current.setView([center.latitude, center.longitude], 15, { animate: true, duration: 0.5 });
      });

      // Special high-risk escalation centring logic
      if (highRiskHighlight) {
        mapInstanceRef.current.setView([center.latitude, center.longitude], 14.5);
        marker.openPopup();
      }
    });
  }, [hospitals]);

  const handleCenterSelect = (center) => {
    setSelectedCenter(center);
    if (mapInstanceRef.current && window.L) {
      mapInstanceRef.current.setView([center.latitude, center.longitude], 15.5, { animate: true });
    }
  };

  return (
    <>
      <div className="action-banner" style={{ paddingBottom: "16px" }}>
        <button className="back-button" onClick={() => setActiveTab("home")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <h1 style={{ fontSize: "20px" }}>Nearby Health Centers</h1>
        <p style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: "12px", marginTop: "4px" }}>
          Find hospitals, PHCs & testing centers
        </p>
      </div>

      <div className="map-category-tabs">
        <button className={`category-chip ${activeFilter === "government" ? "active" : ""}`} onClick={() => setActiveFilter("government")}>
          <div className="chip-dot" style={{ backgroundColor: "#10b981" }}></div> Govt / PHC (Free)
        </button>
        <button className={`category-chip ${activeFilter === "private" ? "active" : ""}`} onClick={() => setActiveFilter("private")}>
          <div className="chip-dot" style={{ backgroundColor: "#3b82f6" }}></div> Private Hospitals
        </button>
        <button className={`category-chip ${activeFilter === "testing" ? "active" : ""}`} onClick={() => setActiveFilter("testing")}>
          <div className="chip-dot" style={{ backgroundColor: "#8b5cf6" }}></div> Testing Centers
        </button>
      </div>

      {isHighRisk && (
        <div className="high-risk-alert-bar">
          <span>⚠️</span>
          <span>High Risk Detected • Nearest PHC highlighted below</span>
        </div>
      )}

      {/* Leaflet OSM Interactive Map Container */}
      <div 
        id="leaflet-map" 
        ref={mapContainerRef} 
        style={{ 
          width: "100%", 
          height: "320px", 
          backgroundColor: "#e3f2fd", 
          borderBottom: "1px solid hsl(228, 20%, 88%)",
          position: "relative",
          zIndex: 1
        }}
      ></div>

      {selectedCenter && (
        <div className="auth-glass-overlay" onClick={() => setSelectedCenter(null)}>
          <div className="auth-sliding-card" style={{ padding: "20px" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "16px" }}>{selectedCenter.name}</h3>
              <button onClick={() => setSelectedCenter(null)} style={{ background: "none", border: "none", fontSize: "18px", color: "var(--text-muted)", cursor: "pointer" }}>&times;</button>
            </div>
            <p style={{ fontSize: "12px", marginBottom: "14px" }}>📍 {selectedCenter.address || "Dakshina Kannada, Karnataka"}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
              <div style={{ padding: "8px", backgroundColor: "var(--primary-light)", borderRadius: "8px", textAlign: "center" }}>
                <span style={{ display: "block", fontSize: "10px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Distance</span>
                <strong style={{ fontSize: "14px", color: "var(--primary)" }}>{getDistance(userLat, userLng, selectedCenter.latitude, selectedCenter.longitude)} km</strong>
              </div>
              <div style={{ padding: "8px", backgroundColor: "var(--primary-light)", borderRadius: "8px", textAlign: "center" }}>
                <span style={{ display: "block", fontSize: "10px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Consultation</span>
                <strong style={{ fontSize: "14px", color: "var(--primary)" }}>{selectedCenter.cost || "Free"}</strong>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <a href={`tel:${selectedCenter.contact || "+918255230201"}`} className="btn-secondary" style={{ textDecoration: "none", textAlign: "center", display: "block" }}>📞 Call Clinic</a>
              <button className="btn-primary" onClick={() => { setSelectedCenter(null); setActiveTab("appoint"); }}>📅 Book Appointment</button>
            </div>
          </div>
        </div>
      )}

      {nearestPHC && (
        <div className="map-nearest-highlight-banner">
          <div className="map-nearest-left">
            <div className="center-item-icon-box" style={{ backgroundColor: "var(--accent-green-bg)", color: "var(--accent-green)" }}>🏛️</div>
            <div className="map-nearest-texts">
              <h3>Nearest government hospital: {getDistance(userLat, userLng, nearestPHC.latitude, nearestPHC.longitude)} km</h3>
              <p>{nearestPHC.name} • {nearestPHC.cost} consultation</p>
            </div>
          </div>
          <button className="map-nearest-view-btn" onClick={() => handleCenterSelect(nearestPHC)}>View</button>
        </div>
      )}

      <div className="listings-heading">ALL NEARBY CENTERS</div>
      
      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="centers-list">
          {hospitals.map(center => (
            <div key={center._id} className="center-item-card" onClick={() => handleCenterSelect(center)}>
              <div className="center-item-left">
                <div className="center-item-icon-box">
                  {center.type === "government" ? "🏥" : center.type === "private" ? "🏢" : "🧪"}
                </div>
                <div>
                  <h4 className="center-item-name">{center.name}</h4>
                  <p className="center-item-sub">{center.type === "government" ? "Government • Free" : center.type === "private" ? "Private • Paid" : "Laboratory • Paid"}</p>
                </div>
              </div>
              <div className="center-item-distance">
                {getDistance(userLat, userLng, center.latitude, center.longitude)} km
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
