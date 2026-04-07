/* ── GardeCoeur — Page de vérification email ─────────────────────────────── */

import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PageLayout } from '@/components/layout'
import { Button, Spinner } from '@/components/ui'
import { authApi } from '@/services/api'
import styles from './Auth.module.css'

type Status = 'loading' | 'success' | 'error'

const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>()
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Lien invalide.'); return }

    authApi.verify(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error')
        const detail = err?.response?.data?.detail
        setMessage(detail || 'Ce lien est invalide ou a déjà été utilisé.')
      })
  }, [token])

  return (
    <PageLayout>
      <div className={styles.authWrap}>
        <div className={styles.authDecor} aria-hidden="true" />

        <div className={styles.verifyCard}>
          {status === 'loading' && (
            <>
              <Spinner size="lg" />
              <p className={styles.verifySub}>Vérification en cours…</p>
            </>
          )}

          {status === 'success' && (
            <>
              <span className={styles.verifyIcon} aria-hidden="true">✓</span>
              <h1 className={styles.verifyTitle}>Email confirmé !</h1>
              <p className={styles.verifySub}>
                Votre compte est activé. Vous pouvez maintenant vous connecter.
              </p>
              <Link to="/login"><Button>Se connecter</Button></Link>
            </>
          )}

          {status === 'error' && (
            <>
              <span className={styles.verifyIconError} aria-hidden="true">✕</span>
              <h1 className={styles.verifyTitle}>Lien invalide</h1>
              <p className={styles.verifySub}>{message}</p>
              <Link to="/login"><Button variant="secondary">Retour à la connexion</Button></Link>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  )
}

export default VerifyEmailPage
