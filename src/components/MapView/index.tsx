/* ── GardeCoeur — Carte Leaflet des profils retraités ────────────────────── */

import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { RetiredProfile } from '@/types'
import { AVAILABILITY_LABELS } from '@/types'
import styles from './MapView.module.css'

// Fix l'icône par défaut de Leaflet cassée avec les bundlers modernes
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const MARKER_ICON = L.divIcon({
  className: '',
  html: `<div style="
    width:36px;height:36px;border-radius:50%;
    background:var(--slate,#B75167);
    border:3px solid white;
    box-shadow:0 2px 8px rgba(183,81,103,0.4);
    display:flex;align-items:center;justify-content:center;
    color:white;font-size:16px;line-height:1;
  ">👴</div>`,
  iconSize:   [36, 36],
  iconAnchor: [18, 18],
  popupAnchor:[0, -20],
})

const USER_ICON = L.divIcon({
  className: '',
  html: `<div style="
    width:20px;height:20px;border-radius:50%;
    background:#2196F3;border:3px solid white;
    box-shadow:0 2px 8px rgba(33,150,243,0.5);
  "></div>`,
  iconSize:   [20, 20],
  iconAnchor: [10, 10],
})

interface MapViewProps {
  profiles: RetiredProfile[]
  userLat: number | null
  userLng: number | null
  onProfileClick: (id: number) => void
}

const MapView: React.FC<MapViewProps> = ({ profiles, userLat, userLng, onProfileClick }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const center: [number, number] = userLat && userLng
      ? [userLat, userLng]
      : [46.6034, 1.8883] // centre France

    const map = L.map(containerRef.current, { zoomControl: true }).setView(center, userLat ? 11 : 6)
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map)

    // Marqueur position utilisateur
    if (userLat && userLng) {
      L.marker([userLat, userLng], { icon: USER_ICON })
        .addTo(map)
        .bindPopup('<strong>Votre position</strong>')
    }

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Mise à jour des marqueurs quand les profils changent
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Supprime les anciens marqueurs de profils
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker && (layer as L.Marker & { _isProfile?: boolean })._isProfile) {
        map.removeLayer(layer)
      }
    })

    const withCoords = profiles.filter(p => p.lat !== null && p.lng !== null)

    withCoords.forEach((profile) => {
      const initials = `${profile.first_name[0] ?? ''}${profile.last_name[0] ?? ''}`.toUpperCase()
      const distance = profile.distance !== null
        ? (profile.distance < 1 ? `${Math.round(profile.distance * 1000)} m` : `${profile.distance.toFixed(1)} km`)
        : null

      const popupContent = `
        <div style="font-family:system-ui,sans-serif;min-width:180px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
            <div style="
              width:40px;height:40px;border-radius:50%;
              background:rgba(126,163,171,0.2);color:#5C828A;
              display:flex;align-items:center;justify-content:center;
              font-weight:700;font-size:14px;flex-shrink:0
            ">${initials}</div>
            <div>
              <div style="font-weight:700;color:#1C1C1C;font-size:0.95rem">
                ${profile.first_name} ${profile.last_name}
              </div>
              <div style="font-size:0.78rem;color:#706C66">
                ${profile.age} ans · ${profile.city}
              </div>
            </div>
          </div>
          ${distance ? `<div style="font-size:0.78rem;color:#9A8158;margin-bottom:6px">📍 ${distance}</div>` : ''}
          <div style="font-size:0.8rem;color:#5C828A;margin-bottom:10px">
            ${AVAILABILITY_LABELS[profile.availability]}
          </div>
          <button
            onclick="window.__gcMapClick(${profile.id})"
            style="
              width:100%;padding:7px 0;border:none;border-radius:20px;
              background:#B75167;color:white;font-weight:600;font-size:0.82rem;
              cursor:pointer
            "
          >Voir le profil →</button>
        </div>
      `

      const marker = L.marker([profile.lat!, profile.lng!], { icon: MARKER_ICON })
        .bindPopup(popupContent, { maxWidth: 220 })
        .addTo(map) as L.Marker & { _isProfile?: boolean }

      marker._isProfile = true
    })

    // Ajuste le zoom pour englober tous les marqueurs
    if (withCoords.length > 0) {
      const bounds = L.latLngBounds(withCoords.map(p => [p.lat!, p.lng!]))
      if (userLat && userLng) bounds.extend([userLat, userLng])
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13 })
    }
  }, [profiles, userLat, userLng])

  // Expose le callback de navigation pour les popups (HTML natif)
  useEffect(() => {
    (window as Window & { __gcMapClick?: (id: number) => void }).__gcMapClick = onProfileClick
    return () => {
      delete (window as Window & { __gcMapClick?: (id: number) => void }).__gcMapClick
    }
  }, [onProfileClick])

  return <div ref={containerRef} className={styles.map} />
}

export default MapView
