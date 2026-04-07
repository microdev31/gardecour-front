/* ── GardeCoeur — Page 404 ───────────────────────────────────────────────── */

import React from 'react'
import { Link } from 'react-router-dom'
import { PageLayout } from '@/components/layout'
import { Button } from '@/components/ui'
import styles from './NotFound.module.css'

const NotFoundPage: React.FC = () => (
  <PageLayout>
    <div className={styles.wrap}>
      <div className={styles.decor} aria-hidden="true" />

      <div className={styles.content}>
        <span className={styles.code}>404</span>
        <h1 className={styles.title}>Page introuvable</h1>
        <p className={styles.sub}>
          Cette page n'existe pas ou a été déplacée.
        </p>

        <div className={styles.actions}>
          <Link to="/"><Button>Retour à l'accueil</Button></Link>
          <Link to="/search"><Button variant="secondary">Parcourir les profils</Button></Link>
        </div>
      </div>
    </div>
  </PageLayout>
)

export default NotFoundPage
