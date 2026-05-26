"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { IndiaRegion } from '@/lib/mockDataV1';

interface MapMarkerProps {
  region: IndiaRegion;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHover: (id: string | null) => void;
}

export const MapMarker: React.FC<MapMarkerProps> = ({
  region,
  isSelected,
  isHovered,
  onClick,
  onHover,
}) => {
  // Color styling mapping
  const stressColors = {
    critical: '#ef4444',
    high: '#f97316',
    moderate: '#eab308',
    low: '#22c55e',
    safe: '#06b6d4'
  };

  const color = stressColors[region.stressLevel];

  return (
    <g
      onClick={onClick}
      onMouseEnter={() => onHover(region.id)}
      onMouseLeave={() => onHover(null)}
      className="cursor-pointer group select-none"
    >
      {/* Dynamic Pulse Ring for Critical Stress districts */}
      {region.stressLevel === 'critical' && (
        <motion.circle
          cx={region.coordinates.x}
          cy={region.coordinates.y}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          animate={{
            r: [8, 18, 8],
            opacity: [0.6, 0, 0.6]
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}

      {/* Hover Pulse Ring */}
      <AnimateOuterRing
        x={region.coordinates.x}
        y={region.coordinates.y}
        color={color}
        active={isHovered || isSelected}
      />

      {/* Main Base Marker Point */}
      <motion.circle
        cx={region.coordinates.x}
        cy={region.coordinates.y}
        r={isSelected ? 9 : isHovered ? 8 : 6}
        fill={color}
        stroke="white"
        strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.5}
        style={{
          filter: isSelected || isHovered 
            ? `drop-shadow(0 0 8px ${color})` 
            : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      />

      {/* Inner anchor dot for selected state */}
      {isSelected && (
        <circle
          cx={region.coordinates.x}
          cy={region.coordinates.y}
          r={3}
          fill="white"
        />
      )}
    </g>
  );
};

// Sub-helper component to prevent full re-renders of outer ring
const AnimateOuterRing = ({ x, y, color, active }: { x: number; y: number; color: string; active: boolean }) => {
  return (
    <motion.circle
      cx={x}
      cy={y}
      r={14}
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: active ? 0.35 : 0,
        scale: active ? 1.05 : 0.8
      }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    />
  );
};

export default MapMarker;
