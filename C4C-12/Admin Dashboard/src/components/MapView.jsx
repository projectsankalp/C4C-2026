/**
 * GraamSehat Admin Dashboard - Map View Component
 * Location: /src/components/MapView.jsx
 */

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { KARNATAKA_CENTER, KARNATAKA_DEFAULT_ZOOM } from '../utils/geoData';
import { RISK_LEVEL_COLORS } from '../utils/constants';
import { useNavigate } from 'react-router-dom';
import './MapView.css';

// Leaflet Heatmap Layer integration
function HeatmapLayer({ points, active }) {
  const map = useMap();

  useEffect(() => {
    if (!active || !points || points.length === 0) return;

    if (typeof L.heatLayer !== 'function') {
      console.warn('Leaflet.heat plugin not loaded from CDN');
      return;
    }

    const heatLayer = L.heatLayer(points, {
      radius: 25,
      blur: 18,
      maxZoom: 10,
      gradient: { 0.4: 'blue', 0.7: 'orange', 1.0: 'red' }
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, active]);

  return null;
}

// Map Event Listener for zooming past level 10
function MapZoomListener({ onZoomChange }) {
  const map = useMap();
  
  useEffect(() => {
    const handleZoom = () => {
      onZoomChange(map.getZoom());
    };
    map.on('zoomend', handleZoom);
    return () => {
      map.off('zoomend', handleZoom);
    };
  }, [map, onZoomChange]);

  return null;
}

// Reset Map view control component
function MapControls({ center, zoom, showHeatmap, setShowHeatmap }) {
  const map = useMap();

  const handleReset = () => {
    map.setView([center.lat, center.lng], zoom);
  };

  return (
    <div className="map-custom-controls">
      <button 
        type="button" 
        className="map-control-btn reset-view-btn" 
        onClick={handleReset}
      >
        Reset Map
      </button>
      <button 
        type="button" 
        className={`map-control-btn heatmap-toggle-btn ${showHeatmap ? 'active' : ''}`}
        onClick={() => setShowHeatmap(!showHeatmap)}
      >
        {showHeatmap ? 'Hide Heatmap' : 'Show Risk Heatmap'}
      </button>
    </div>
  );
}

export default function MapView({ markers = [], heatmapPoints = [], height = '450px' }) {
  const navigate = useNavigate();
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(KARNATAKA_DEFAULT_ZOOM);

  const handleViewDetails = (districtName) => {
    navigate(`/rankings?district=${encodeURIComponent(districtName)}`);
  };

  return (
    <div className="map-container-wrapper" style={{ height }}>
      {zoomLevel > 10 && (
        <div className="taluka-indicator-toast">
          Zoomed to Taluka / Village Level
        </div>
      )}
      
      <MapContainer 
        center={[KARNATAKA_CENTER.lat, KARNATAKA_CENTER.lng]} 
        zoom={KARNATAKA_DEFAULT_ZOOM} 
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Heatmap overlay (shows red risk concentration) */}
        <HeatmapLayer points={heatmapPoints} active={showHeatmap} />

        {/* Zoom event listener */}
        <MapZoomListener onZoomChange={setZoomLevel} />

        {/* Custom Reset and Layer toggles */}
        <MapControls 
          center={KARNATAKA_CENTER} 
          zoom={KARNATAKA_DEFAULT_ZOOM}
          showHeatmap={showHeatmap}
          setShowHeatmap={setShowHeatmap}
        />

        {/* District Markers */}
        {!showHeatmap && markers.map((marker) => {
          const color = RISK_LEVEL_COLORS[marker.dominantRisk] || RISK_LEVEL_COLORS.green;
          
          return (
            <CircleMarker
              key={marker.districtName}
              center={marker.position}
              radius={marker.markerSize}
              fillColor={color}
              color="#FFFFFF"
              weight={2}
              fillOpacity={0.85}
              className="custom-map-marker"
            >
              <Popup className="custom-popup">
                <div className="popup-content">
                  <h4 className="popup-district-title">{marker.districtName}</h4>
                  <div className="popup-stats">
                    <div className="popup-stat-row">
                      <span>Total Patients:</span>
                      <strong>{marker.totalPatients}</strong>
                    </div>
                    <div className="popup-stat-row">
                      <span>Top ASHA Worker:</span>
                      <strong>{marker.topASHAWorker}</strong>
                    </div>
                    
                    <div className="popup-risk-breakdown">
                      <div className="breakdown-pill pill-green">
                        <span>G</span><strong>{marker.riskBreakdown.green}</strong>
                      </div>
                      <div className="breakdown-pill pill-yellow">
                        <span>Y</span><strong>{marker.riskBreakdown.yellow}</strong>
                      </div>
                      <div className="breakdown-pill pill-red">
                        <span>R</span><strong>{marker.riskBreakdown.red}</strong>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    type="button"
                    className="btn btn-primary btn-sm popup-details-btn"
                    onClick={() => handleViewDetails(marker.districtName)}
                  >
                    View District Details
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
