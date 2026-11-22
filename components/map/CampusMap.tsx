'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix icon default Leaflet di bundler Webpack/Next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface CampusMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  interactive?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  height?: string;
  markerTitle?: string;
  popupText?: string;
}

export default function CampusMap({
  latitude,
  longitude,
  zoom = 16,
  interactive = false,
  onLocationSelect,
  height = '200px',
  markerTitle,
  popupText,
}: CampusMapProps) {
  const displayTitle = markerTitle || popupText || 'Lokasi Fasilitas';
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Bersihkan instance peta sebelumnya jika ada
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Inisialisasi peta Leaflet
    const map = L.map(mapContainerRef.current, {
      center: [latitude, longitude],
      zoom: zoom,
      scrollWheelZoom: interactive,
      dragging: interactive,
      touchZoom: interactive,
      doubleClickZoom: interactive,
      attributionControl: false,
    });

    // Tambahkan layer OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Tambahkan Marker
    const marker = L.marker([latitude, longitude], {
      icon: defaultIcon,
      draggable: interactive,
    }).addTo(map);

    if (displayTitle) {
      marker.bindPopup(displayTitle);
    }

    // Event listener jika interaktif
    if (interactive && onLocationSelect) {
      // Saat marker selesai di-drag
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        onLocationSelect(position.lat, position.lng);
      });

      // Saat pengguna klik di peta
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        onLocationSelect(lat, lng);
      });
    }

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Trigger resize agar tile termuat sempurna
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update center dan posisi marker jika props latitude/longitude berubah dari luar (misal Geolocation)
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([latitude, longitude], zoom);
      markerRef.current.setLatLng([latitude, longitude]);
    }
  }, [latitude, longitude, zoom]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-gray-200 shadow-inner">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} className="z-0" />
      {interactive && (
        <div className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-700 shadow-sm border border-gray-200">
          Klik peta atau seret pin
        </div>
      )}
    </div>
  );
}
