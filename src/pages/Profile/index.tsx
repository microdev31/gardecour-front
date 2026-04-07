/* ── GardeCoeur — Page Profil Détaillé ──────────────────────────────────── */

import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout'
import { Avatar, Badge, Button, Card, Spinner } from '@/components/ui'
import { profilesApi, connectionsApi, moderationApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import type { RetiredProfile, Review, ReportReason } from '@/types'
import { AVAILABILITY_LABELS, GUARD_LOCATION_LABELS, HOME_TYPE_LABELS } from '@/types'
import styles from './Profile.module.css'

/* ── Helpers ─────────────────────────────────────────────────────────────── */

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'INAPPROPRIATE', label: 'Contenu inapproprié' },
  { value: 'FAKE_PROFILE',  label: 'Faux profil' },
  { value: 'HARASSMENT',    label: 'Harcèlement' },
  { value: 'SPAM',          label: 'Spam / publicité' },
  { value: 'OTHER',         label: 'Autre' },
]

const StarRating: React.FC<{ value: number; onChange?: (v: number) => void }> = ({ value, onChange }) => (
  <div className={styles.stars}>
    {[1, 2, 3, 4, 5].map(s => (
      <button
        key={s}
        type="button"
        className={`${styles.star} ${s <= value ? styles.starFilled : ''}`}
        onClick={() => onChange?.(s)}
        aria-label={`${s} étoile${s > 1 ? 's' : ''}`}
      >★</button>
    ))}
  </div>
)

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
  const [reviews, setReviews]   = useState<Review[]>([])
  const [loading, setLoading]   = useState(true)
  const [sending, setSending]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [error, setError]       = useState('')

  // Modal signalement
  const [showReport, setShowReport]     = useState(false)
  const [reportReason, setReportReason] = useState<ReportReason>('INAPPROPRIATE')
  const [reportDetails, setReportDetails] = useState('')
  const [reportSending, setReportSending] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      profilesApi.getRetired(Number(id)),
      profilesApi.getReviews(Number(id)),
    ])
      .then(([profileRes, reviewsRes]) => {
        setProfile(profileRes.data)
        setReviews(reviewsRes.data.results ?? reviewsRes.data)
      })
      .catch(() => setError('Profil introuvable.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleConnect = async () => {
    if (!profile || !user) return
    try {
      setSending(true)
      await connectionsApi.create({ parent: user.id, retired: profile.id })
      setSent(true)
      toast.success('Demande envoyée !')
    } catch {
      setError("Impossible d'envoyer la demande. Réessayez.")
    } finally {
      setSending(false)
    }
  }

  const handleReport = async () => {
    if (!profile) return
    try {
      setReportSending(true)
      await moderationApi.report({
        reported_user: profile.id,
        reason: reportReason,
        details: reportDetails,
      })
      setShowReport(false)
      toast.success('Signalement envoyé. Notre équipe va examiner ce profil.')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(msg || 'Erreur lors de l\'envoi du signalement.')
    } finally {
      setReportSending(false)
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

  const initials  = `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
  const activities = profile.activities?.split(',').map(a => a.trim()).filter(Boolean) || []
  const hobbies    = profile.hobbies?.split(',').map(h => h.trim()).filter(Boolean) || []

  return (
    <PageLayout>
      <div className={styles.container}>

        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Retour aux résultats
        </button>

        <div className={styles.layout}>

          {/* ── Colonne principale ──────────────────────────────────────── */}
          <div className={styles.main}>

            {/* Hero profil */}
            <Card className={`${styles.heroCard} animate-fadeUp`}>
              <div className={styles.heroHead}>
                <Avatar initials={initials} src={profile.avatar} size="xl" color="moss" />
                <div className={styles.heroInfo}>
                  <div className={styles.heroNameRow}>
                    <h1 className={styles.heroName}>{profile.first_name} {profile.last_name}</h1>
                    {profile.is_id_verified && (
                      <span className={styles.verifiedBadge} title="Identité vérifiée">✓ Vérifié</span>
                    )}
                  </div>
                  <p className={styles.heroMeta}>
                    {profile.age} ans · {profile.city}
                    {profile.distance != null && ` · ${profile.distance} km`}
                  </p>

                  {/* Note moyenne */}
                  {profile.avg_rating !== null && (
                    <div className={styles.ratingRow}>
                      <StarRating value={Math.round(profile.avg_rating)} />
                      <span className={styles.ratingText}>
                        {profile.avg_rating.toFixed(1)} ({profile.review_count} avis)
                      </span>
                    </div>
                  )}

                  <div className={styles.heroBadges}>
                    <Badge color="moss">{AVAILABILITY_LABELS[profile.availability]}</Badge>
                    <Badge color="slate">{GUARD_LOCATION_LABELS[profile.guard_location]}</Badge>
                    {profile.home?.has_garden  && <Badge color="parchment">🌿 Jardin</Badge>}
                    {profile.home?.has_park    && <Badge color="parchment">🏞️ Parc proche</Badge>}
                    {profile.home?.has_animals && <Badge color="parchment">🐾 Animaux</Badge>}
                  </div>
                </div>
              </div>

              {profile.bio && (
                <p className={styles.heroBio}>{profile.bio}</p>
              )}
            </Card>

            {profile.experience && (
              <DetailSection title="👶 Expérience avec les enfants">
                <p className={styles.detailText}>{profile.experience}</p>
              </DetailSection>
            )}

            {activities.length > 0 && (
              <DetailSection title="🎨 Activités proposées">
                <div className={styles.tagGrid}>
                  {activities.map(a => <Badge key={a} color="apricot">{a}</Badge>)}
                </div>
              </DetailSection>
            )}

            {hobbies.length > 0 && (
              <DetailSection title="✨ Centres d'intérêt">
                <div className={styles.tagGrid}>
                  {hobbies.map(h => <Badge key={h} color="parchment">{h}</Badge>)}
                </div>
              </DetailSection>
            )}

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

            {/* Avis */}
            {reviews.length > 0 && (
              <DetailSection title={`⭐ Avis (${reviews.length})`}>
                <div className={styles.reviewList}>
                  {reviews.map(r => (
                    <div key={r.id} className={styles.reviewItem}>
                      <div className={styles.reviewHeader}>
                        <span className={styles.reviewAuthor}>{r.author_name}</span>
                        <StarRating value={r.rating} />
                      </div>
                      {r.comment && <p className={styles.reviewComment}>{r.comment}</p>}
                      <span className={styles.reviewDate}>
                        {new Date(r.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              </DetailSection>
            )}
          </div>

          {/* ── Aside CTA ──────────────────────────────────────────────── */}
          <aside className={styles.aside}>
            <Card className={`${styles.ctaCard} animate-fadeUp delay-2`}>
              <div className={styles.ctaScore}>
                <span className={styles.ctaScoreNum}>
                  {profile.avg_rating !== null ? `${profile.avg_rating.toFixed(1)} ★` : '✦'}
                </span>
                <span className={styles.ctaScoreLabel}>
                  {profile.is_id_verified ? 'Profil vérifié' : 'Profil non vérifié'}
                </span>
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

              {/* Bouton signaler */}
              <button
                className={styles.reportBtn}
                onClick={() => setShowReport(true)}
                type="button"
              >
                Signaler ce profil
              </button>
            </Card>
          </aside>
        </div>
      </div>

      {/* ── Modal signalement ─────────────────────────────────────────── */}
      {showReport && (
        <div className={styles.modalOverlay} onClick={() => setShowReport(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Signaler ce profil</h2>
            <p className={styles.modalDesc}>
              Votre signalement sera examiné par notre équipe sous 48h.
            </p>

            <label className={styles.modalLabel}>Motif</label>
            <select
              className={styles.modalSelect}
              value={reportReason}
              onChange={e => setReportReason(e.target.value as ReportReason)}
            >
              {REPORT_REASONS.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>

            <label className={styles.modalLabel}>Détails (optionnel)</label>
            <textarea
              className={styles.modalTextarea}
              value={reportDetails}
              onChange={e => setReportDetails(e.target.value)}
              placeholder="Décrivez le problème en quelques mots..."
              rows={3}
            />

            <div className={styles.modalActions}>
              <Button variant="ghost" onClick={() => setShowReport(false)}>Annuler</Button>
              <Button variant="danger" loading={reportSending} onClick={handleReport}>
                Envoyer le signalement
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}

export default ProfileDetailPage
