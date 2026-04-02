/* ── GardeCoeur — Page d'accueil ─────────────────────────────────────────── */

import React from 'react'
import { Link } from 'react-router-dom'
import { PageLayout } from '@/components/layout'
import { Button, Badge } from '@/components/ui'
import styles from './Home.module.css'

const TESTIMONIALS = [
  { name: 'Marie D.', role: 'Maman de 2 enfants', text: 'Grâce à GardeCoeur, j\'ai trouvé Jean en une semaine. Mes enfants adorent ses histoires !', initials: 'MD', color: 'apricot' },
  { name: 'Jean M.', role: 'Retraité, 68 ans', text: 'Je me sens utile et heureux. Garder les enfants de Marie m\'a redonné de l\'énergie.', initials: 'JM', color: 'moss' },
  { name: 'Sophie L.', role: 'Maman solo', text: 'Une plateforme bienveillante et sécurisée. Je recommande à toutes les familles.', initials: 'SL', color: 'slate' },
]

const STATS = [
  { value: '1 200+', label: 'familles inscrites' },
  { value: '850+',   label: 'bénévoles actifs' },
  { value: '98%',    label: 'de satisfaction' },
  { value: '0 €',    label: '100% bénévole' },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Créez votre profil', desc: 'Parents ou retraités, remplissez votre profil en quelques minutes.' },
  { step: '02', title: 'Explorez les profils', desc: 'Cherchez autour de vous avec des filtres adaptés à vos besoins.' },
  { step: '03', title: 'Prenez contact', desc: 'Envoyez une demande de mise en relation et échangez en direct.' },
]

const HomePage: React.FC = () => {
  return (
    <PageLayout>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        {/* Blob décoratifs */}
        <div className={styles.blobTop} aria-hidden="true" />
        <div className={styles.blobBottom} aria-hidden="true" />

        <div className={styles.heroContent}>
          <Badge color="apricot" className={styles.heroTag}>
            ✨ Bénévolat intergénérationnel
          </Badge>

          <h1 className={`${styles.heroTitle} animate-fadeUp`}>
            La garde d'enfants,<br />
            <em>avec du cœur</em>
          </h1>

          <p className={`${styles.heroDesc} animate-fadeUp delay-1`}>
          Il était une fois, un frère et une soeur qui souhaitaient rester toutes leurs journées avec leurs parents pour s’amuser, être rassurés et câlinés.<br/> 
          Mais, malheureusement, leurs parents n’avaient pas le temps pour combler tous leurs désirs.<br/>
          Alors ils trouvent une solution : un couple de retraités aimants et tout à fait disponibles pour jouer, rassurer et câliner!
          </p>

          <div className={`${styles.heroCtas} animate-fadeUp delay-2`}>
            <Link to="/register?role=parent">
              <Button size="lg" variant="primary">
                👨‍👩‍👧 Je suis un parent
              </Button>
            </Link>
            <Link to="/register?role=retired">
              <Button size="lg" variant="moss">
                🌿 Je suis un retraité
              </Button>
            </Link>
          </div>
        </div>

        {/* Illustration flottante */}
        <div className={`${styles.heroIllustration} animate-float`} aria-hidden="true">
          <div className={styles.illustrationCard}>
            <div className={styles.illustrationAvatar} style={{ background: 'rgba(139,175,138,0.2)', color: 'var(--moss-dark)' }}>JM</div>
            <div>
              <div className={styles.illustrationName}>Jean Martin</div>
              <div className={styles.illustrationMeta}>Retraité · 1.2 km</div>
            </div>
            <div className={styles.illustrationMatch}>✦ 95%</div>
          </div>
          <div className={styles.illustrationCard} style={{ marginLeft: 24, marginTop: -8 }}>
            <div className={styles.illustrationAvatar} style={{ background: 'rgba(240,168,122,0.2)', color: 'var(--apricot-dark)' }}>ML</div>
            <div>
              <div className={styles.illustrationName}>Monique Lefèvre</div>
              <div className={styles.illustrationMeta}>Retraitée · 2.5 km</div>
            </div>
            <div className={styles.illustrationMatch}>✦ 88%</div>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section className={styles.stats}>
        {STATS.map((s) => (
          <div key={s.label} className={styles.statItem}>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── COMMENT ÇA MARCHE ─────────────────────────────────────────────── */}
      <section className={styles.howSection}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Comment ça marche ?</h2>
          <p className={styles.sectionSub}>Trois étapes pour trouver le binôme idéal</p>
        </div>
        <div className={styles.howGrid}>
          {HOW_IT_WORKS.map((h) => (
            <div key={h.step} className={styles.howCard}>
              <span className={styles.howStep}>{h.step}</span>
              <h3 className={styles.howTitle}>{h.title}</h3>
              <p className={styles.howDesc}>{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TÉMOIGNAGES ───────────────────────────────────────────────────── */}
      <section className={styles.testimonials}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Ils nous font confiance</h2>
        </div>
        <div className={styles.testimonialsGrid}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className={styles.testimonialCard}>
              <p className={styles.testimonialText}>« {t.text} »</p>
              <div className={styles.testimonialAuthor}>
                <div
                  className={styles.testimonialAvatar}
                  style={{
                    background: t.color === 'apricot' ? 'rgba(240,168,122,0.2)' : t.color === 'moss' ? 'rgba(139,175,138,0.2)' : 'var(--slate-50)',
                    color: t.color === 'apricot' ? 'var(--apricot-dark)' : t.color === 'moss' ? 'var(--moss-dark)' : 'var(--slate)',
                  }}
                >
                  {t.initials}
                </div>
                <div>
                  <div className={styles.testimonialName}>{t.name}</div>
                  <div className={styles.testimonialRole}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────────────────────── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaBlob} aria-hidden="true" />
        <h2 className={styles.ctaTitle}>Prêt à faire la différence ?</h2>
        <p className={styles.ctaDesc}>Rejoignez des centaines de familles et de bénévoles qui se font confiance.</p>
        <Link to="/register">
          <Button size="lg" variant="primary">Créer mon compte gratuitement</Button>
        </Link>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <span className={styles.footerLogo}>Garde<em>Cœur</em></span>
        <span className={styles.footerText}>© 2026 — Fait avec ❤️ pour les familles</span>
      </footer>
    </PageLayout>
  )
}

export default HomePage
