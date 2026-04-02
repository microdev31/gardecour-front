/* ── GardeCoeur — Page Profil Détaillé ──────────────────────────────────── */

import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout'
import { Avatar, Badge, Button, Card, Spinner } from '@/components/ui'
import { profilesApi, connectionsApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import type { RetiredProfile } from '@/types'
import { AVAILABILITY_LABELS, GUARD_LOCATION_LABELS, HOME_TYPE_LABELS } from '@/types'
import styles from './Profile.module.css'

/* ── Composant section de détail ─────────────────────────────────────────── */

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Card className={styles.section}>
    <h3 className={styles.sectionTitle}>{title}</h3>
    {children}
  </Card>
)

/* ── Page ────────────────────────────────────────────────────────────────── */

const ProfileDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [profile, setProfile]   = useState<RetiredProfile | null>(null)
  const [loading, setLoading]   = useState(true)
  const [sending, setSending]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    if (!id) return
    profilesApi.getRetired(Number(id))
      .then(res => setProfile(res.data))
      .catch(() => setError('Profil introuvable.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleConnect = async () => {
    if (!profile || !user) return
    try {
      setSending(true)
      // On suppose que l'utilisateur connecté est un parent
      // et qu'on connaît son profile ID (à affiner avec un vrai store de profil)
      await connectionsApi.create({ parent: user.id, retired: profile.id })
      setSent(true)
    } catch {
      setError('Impossible d\'envoyer la demande. Réessayez.')
    } finally {
      setSending(false)
    }
  }

  if (loading) return (
    <PageLayout>
      <div className={styles.loadingWrap}><Spinner size="lg" /></div>
    </PageLayout>
  )

  if (error || !profile) return (
    <PageLayout>
      <div className={styles.loadingWrap}>
        <p className={styles.errorMsg}>{error || 'Profil introuvable.'}</p>
        <Button variant="ghost" onClick={() => navigate(-1)}>← Retour</Button>
      </div>
    </PageLayout>
  )

  const initials = `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
  const activities = profile.activities?.split(',').map(a => a.trim()).filter(Boolean) || []
  const hobbies    = profile.hobbies?.split(',').map(h => h.trim()).filter(Boolean) || []

  return (
    <PageLayout>
      <div className={styles.container}>

        {/* ── Bouton retour ──────────────────────────────────────────────── */}
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Retour aux résultats
        </button>

        <div className={styles.layout}>

          {/* ── Colonne principale ─────────────────────────────────────── */}
          <div className={styles.main}>

            {/* Hero profil */}
            <Card className={`${styles.heroCard} animate-fadeUp`}>
              <div className={styles.heroHead}>
                <Avatar initials={initials} src={profile.avatar} size="xl" color="moss" />
                <div className={styles.heroInfo}>
                  <h1 className={styles.heroName}>{profile.first_name} {profile.last_name}</h1>
                  <p className={styles.heroMeta}>
                    {profile.age} ans · {profile.city}
                    {profile.distance != null && ` · ${profile.distance} km`}
                  </p>
                  <div className={styles.heroBadges}>
                    <Badge color="moss">{AVAILABILITY_LABELS[profile.availability]}</Badge>
                    <Badge color="slate">{GUARD_LOCATION_LABELS[profile.guard_location]}</Badge>
                    {profile.home?.has_garden && <Badge color="parchment">🌿 Jardin</Badge>}
                    {profile.home?.has_park   && <Badge color="parchment">🏞️ Parc proche</Badge>}
                    {profile.home?.has_animals && <Badge color="parchment">🐾 Animaux</Badge>}
                  </div>
                </div>
              </div>

              {profile.bio && (
                <p className={styles.heroBio}>{profile.bio}</p>
              )}
            </Card>

            {/* Expérience */}
            {profile.experience && (
              <DetailSection title="👶 Expérience avec les enfants">
                <p className={styles.detailText}>{profile.experience}</p>
              </DetailSection>
            )}

            {/* Activités */}
            {activities.length > 0 && (
              <DetailSection title="🎨 Activités proposées">
                <div className={styles.tagGrid}>
                  {activities.map(a => <Badge key={a} color="apricot">{a}</Badge>)}
                </div>
              </DetailSection>
            )}

            {/* Hobbies */}
            {hobbies.length > 0 && (
              <DetailSection title="✨ Centres d'intérêt">
                <div className={styles.tagGrid}>
                  {hobbies.map(h => <Badge key={h} color="parchment">{h}</Badge>)}
                </div>
              </DetailSection>
            )}

            {/* Logement */}
            {profile.home && (
              <DetailSection title="🏠 Lieu de garde">
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Type</span>
                    <span className={styles.detailValue}>{HOME_TYPE_LABELS[profile.home.type]}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Jardin</span>
                    <span className={styles.detailValue}>{profile.home.has_garden ? '✅ Oui' : '❌ Non'}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Parc à proximité</span>
                    <span className={styles.detailValue}>{profile.home.has_park ? '✅ Oui' : '❌ Non'}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Animaux</span>
                    <span className={styles.detailValue}>{profile.home.has_animals ? '🐾 Oui' : '❌ Non'}</span>
                  </div>
                </div>
                {profile.home.description && (
                  <p className={styles.detailText} style={{ marginTop: 14 }}>{profile.home.description}</p>
                )}
              </DetailSection>
            )}
          </div>

          {/* ── Colonne sticky CTA ─────────────────────────────────────── */}
          <aside className={styles.aside}>
            <Card className={`${styles.ctaCard} animate-fadeUp delay-2`}>
              <div className={styles.ctaScore}>
                <span className={styles.ctaScoreNum}>✦</span>
                <span className={styles.ctaScoreLabel}>Profil vérifié</span>
              </div>

              {sent ? (
                <div className={styles.sentConfirm}>
                  <span className={styles.sentIcon}>💌</span>
                  <p className={styles.sentTitle}>Demande envoyée !</p>
                  <p className={styles.sentDesc}>
                    {profile.first_name} sera notifié(e). Vous pouvez échanger dès qu'il/elle accepte.
                  </p>
                </div>
              ) : (
                <>
                  <p className={styles.ctaDesc}>
                    Envoyez une demande de mise en relation à {profile.first_name}.
                    Vous pourrez échanger en messages privés dès qu'il/elle accepte.
                  </p>
                  {error && <p className={styles.ctaError}>{error}</p>}
                  <Button fullWidth loading={sending} onClick={handleConnect}>
                    💌 Demander une mise en relation
                  </Button>
                </>
              )}

              <div className={styles.ctaMeta}>
                <span>📍 {profile.city}</span>
                {profile.distance != null && <span>🚶 {profile.distance} km</span>}
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </PageLayout>
  )
}

export default ProfileDetailPage
