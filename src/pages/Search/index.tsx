/* ── GardeCoeur — Page Recherche / Listing ───────────────────────────────── */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout'
import { Button, Select, Chip, Badge, Avatar, Card } from '@/components/ui'
import { profilesApi } from '@/services/api'
import {
  RetiredProfile,
  Availability,
  GuardLocation,
  AVAILABILITY_LABELS,
  GUARD_LOCATION_LABELS,
} from '@/types'
import styles from './Search.module.css'

/* ── Types internes ──────────────────────────────────────────────────────── */

interface Filters {
  lat: number | null
  lng: number | null
  city: string
  radius: string
  availability: Availability[]
  guard_location: GuardLocation[]
  has_garden: boolean
}

const RADIUS_OPTIONS = [
  { value: '5',  label: '5 km' },
  { value: '10', label: '10 km' },
  { value: '20', label: '20 km' },
  { value: '50', label: '50 km' },
]

const DEFAULT_FILTERS: Filters = {
  lat: null,
  lng: null,
  city: '',
  radius: '10',
  availability: [],
  guard_location: [],
  has_garden: false,
}

/* ── Skeleton card ───────────────────────────────────────────────────────── */

const SkeletonCard: React.FC = () => (
  <div className={styles.skeletonCard}>
    <div className={styles.skeletonAvatar} />
    <div className={styles.skeletonLines}>
      <div className={`${styles.skeletonLine} ${styles.skeletonLineLong}`} />
      <div className={`${styles.skeletonLine} ${styles.skeletonLineMedium}`} />
      <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
      <div className={styles.skeletonBadges}>
        <div className={styles.skeletonBadge} />
        <div className={styles.skeletonBadge} />
      </div>
    </div>
  </div>
)

/* ── Profile card ────────────────────────────────────────────────────────── */

interface ProfileCardProps {
  profile: RetiredProfile
  onClick: () => void
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onClick }) => {
  const initials = `${profile.first_name[0] ?? ''}${profile.last_name[0] ?? ''}`.toUpperCase()

  const formatDistance = (d: number | null): string | null => {
    if (d === null) return null
    return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`
  }

  const distance = formatDistance(profile.distance)

  return (
    <Card className={styles.profileCard} onClick={onClick} hoverable>
      <div className={styles.cardHeader}>
        <Avatar
          src={profile.avatar}
          initials={initials}
          size="lg"
          color="moss"
        />
        {distance && (
          <span className={styles.distanceBadge}>{distance}</span>
        )}
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardName}>
          {profile.first_name} {profile.last_name}
        </h3>
        <p className={styles.cardMeta}>
          {profile.age} ans · {profile.city}
        </p>
        {profile.bio && (
          <p className={styles.cardBio}>{profile.bio}</p>
        )}
      </div>

      <div className={styles.cardFooter}>
        <Badge color="moss">{AVAILABILITY_LABELS[profile.availability]}</Badge>
        <Badge color="slate">{GUARD_LOCATION_LABELS[profile.guard_location]}</Badge>
        {profile.home?.has_garden && <Badge color="parchment">Jardin</Badge>}
        {profile.home?.has_park   && <Badge color="parchment">Parc</Badge>}
        {profile.home?.has_animals && <Badge color="parchment">Animaux</Badge>}
      </div>
    </Card>
  )
}

/* ── Empty state ─────────────────────────────────────────────────────────── */

const EmptyState: React.FC<{ onReset: () => void }> = ({ onReset }) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyIllustration} aria-hidden="true">🌿</div>
    <h2 className={styles.emptyTitle}>Aucun retraité trouvé</h2>
    <p className={styles.emptyText}>
      Essayez d'élargir votre rayon de recherche ou de modifier vos filtres.
    </p>
    <Button variant="secondary" onClick={onReset}>
      Réinitialiser les filtres
    </Button>
  </div>
)

/* ── Error state ─────────────────────────────────────────────────────────── */

const ErrorState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyIllustration} aria-hidden="true">⚠️</div>
    <h2 className={styles.emptyTitle}>Une erreur est survenue</h2>
    <p className={styles.emptyText}>
      Impossible de charger les profils. Vérifiez votre connexion.
    </p>
    <Button variant="primary" onClick={onRetry}>
      Réessayer
    </Button>
  </div>
)

/* ── Page principale ─────────────────────────────────────────────────────── */

const SearchPage: React.FC = () => {
  const navigate = useNavigate()

  const [filters, setFilters]   = useState<Filters>(DEFAULT_FILTERS)
  const [profiles, setProfiles] = useState<RetiredProfile[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(false)
  const [geoBlocked, setGeoBlocked] = useState(false)

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef      = useRef<AbortController | null>(null)

  /* ── Géolocalisation au montage ── */
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoBlocked(true)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFilters(f => ({
          ...f,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }))
      },
      () => setGeoBlocked(true),
    )
  }, [])

  /* ── Fetch avec debounce ── */
  const fetchProfiles = useCallback((f: Filters) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)

    debounceTimer.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort()
      abortRef.current = new AbortController()

      setLoading(true)
      setError(false)

      const params: Record<string, string | number> = {
        radius: f.radius,
      }
      if (f.lat !== null) params.lat = f.lat
      if (f.lng !== null) params.lng = f.lng
      if (f.availability.length === 1) params.availability = f.availability[0]
      if (f.guard_location.length === 1) params.guard_location = f.guard_location[0]
      if (f.has_garden) params.has_garden = 'true'

      try {
        const res = await profilesApi.listRetired(params)
        setProfiles(res.data as RetiredProfile[])
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'CanceledError') return
        setError(true)
      } finally {
        setLoading(false)
      }
    }, 400)
  }, [])

  useEffect(() => {
    fetchProfiles(filters)
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [filters, fetchProfiles])

  /* ── Handlers ── */
  const toggleAvailability = useCallback((v: Availability) => {
    setFilters(f => ({
      ...f,
      availability: f.availability.includes(v)
        ? f.availability.filter(x => x !== v)
        : [...f.availability, v],
    }))
  }, [])

  const toggleGuardLocation = useCallback((v: GuardLocation) => {
    setFilters(f => ({
      ...f,
      guard_location: f.guard_location.includes(v)
        ? f.guard_location.filter(x => x !== v)
        : [...f.guard_location, v],
    }))
  }, [])

  const handleRadiusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(f => ({ ...f, radius: e.target.value }))
  }, [])

  const handleCityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(f => ({ ...f, city: e.target.value }))
  }, [])

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setGeoBlocked(false)
    navigator.geolocation?.getCurrentPosition(
      (pos) => setFilters(f => ({ ...f, lat: pos.coords.latitude, lng: pos.coords.longitude })),
      () => setGeoBlocked(true),
    )
  }, [])

  const handleRetry = useCallback(() => fetchProfiles(filters), [filters, fetchProfiles])

  const isFiltered =
    filters.availability.length > 0 ||
    filters.guard_location.length > 0 ||
    filters.has_garden ||
    filters.radius !== '10' ||
    filters.city !== ''

  /* ── Render ── */
  return (
    <PageLayout>
      {/* ── Barre de filtres sticky ── */}
      <div className={styles.filterBar}>
        <div className={styles.filterBarInner}>

          {/* Localisation */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Localisation</span>
            {geoBlocked ? (
              <input
                type="text"
                className={styles.cityInput}
                placeholder="Votre ville…"
                value={filters.city}
                onChange={handleCityChange}
              />
            ) : (
              <span className={styles.geoStatus}>
                {filters.lat ? '📍 Position détectée' : 'Détection en cours…'}
              </span>
            )}
            <Select
              options={RADIUS_OPTIONS}
              value={filters.radius}
              onChange={handleRadiusChange}
              aria-label="Rayon de recherche"
            />
          </div>

          {/* Disponibilité */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Disponibilité</span>
            <div className={styles.chips}>
              {(['FULL', 'PARTIAL', 'WEEKEND'] as Availability[]).map(v => (
                <Chip
                  key={v}
                  selected={filters.availability.includes(v)}
                  onClick={() => toggleAvailability(v)}
                  color="moss"
                >
                  {AVAILABILITY_LABELS[v]}
                </Chip>
              ))}
            </div>
          </div>

          {/* Lieu de garde */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Lieu de garde</span>
            <div className={styles.chips}>
              {(['HOME', 'RETIRED', 'FLEXIBLE'] as GuardLocation[]).map(v => (
                <Chip
                  key={v}
                  selected={filters.guard_location.includes(v)}
                  onClick={() => toggleGuardLocation(v)}
                  color="slate"
                >
                  {GUARD_LOCATION_LABELS[v]}
                </Chip>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Options</span>
            <Chip
              selected={filters.has_garden}
              onClick={() => setFilters(f => ({ ...f, has_garden: !f.has_garden }))}
              color="moss"
            >
              🌿 Jardin
            </Chip>
          </div>

          {/* Reset */}
          {isFiltered && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {/* ── Contenu principal ── */}
      <main className={styles.main}>

        {/* Compteur */}
        {!loading && !error && (
          <p className={styles.counter}>
            <strong>{profiles.length}</strong>{' '}
            {profiles.length === 1
              ? 'retraité disponible près de vous'
              : 'retraités disponibles près de vous'}
          </p>
        )}

        {/* Chargement */}
        {loading && (
          <div className={styles.grid}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Erreur */}
        {!loading && error && <ErrorState onRetry={handleRetry} />}

        {/* Résultats */}
        {!loading && !error && profiles.length > 0 && (
          <div className={styles.grid}>
            {profiles.map((profile, i) => (
              <div
                key={profile.id}
                className={`animate-fadeUp delay-${Math.min(i + 1, 5) as 1 | 2 | 3 | 4 | 5}`}
              >
                <ProfileCard
                  profile={profile}
                  onClick={() => navigate(`/profile/${profile.id}`)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Vide */}
        {!loading && !error && profiles.length === 0 && (
          <EmptyState onReset={handleReset} />
        )}
      </main>
    </PageLayout>
  )
}

export default SearchPage
