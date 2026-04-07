/* ── GardeCoeur — Page Suppression de compte (RGPD) ─────────────────────── */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout'
import { Button, Card } from '@/components/ui'
import { profilesApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import styles from './DeleteAccount.module.css'

const DeleteAccountPage: React.FC = () => {
  const navigate        = useNavigate()
  const { logout }      = useAuthStore()
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleDelete = async () => {
    try {
      setLoading(true)
      await profilesApi.deleteAccount()
      logout()
      navigate('/', { replace: true })
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
      setLoading(false)
    }
  }

  return (
    <PageLayout>
      <div className={styles.wrap}>
        <Card className={styles.card}>
          <span className={styles.icon} aria-hidden="true">⚠️</span>
          <h1 className={styles.title}>Supprimer mon compte</h1>
          <p className={styles.desc}>
            Cette action est <strong>irréversible</strong>. Votre compte sera désactivé et vos données
            personnelles anonymisées immédiatement conformément à notre politique RGPD.
          </p>
          <p className={styles.desc}>
            Vos messages et connexions existants seront conservés de manière anonyme pendant 30 jours
            avant suppression définitive.
          </p>

          <label className={styles.confirmLabel}>
            <input
              type="checkbox"
              checked={confirm}
              onChange={e => setConfirm(e.target.checked)}
            />
            Je comprends que cette action est définitive et souhaite supprimer mon compte.
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <Button variant="ghost" onClick={() => navigate(-1)}>
              ← Annuler
            </Button>
            <Button
              variant="danger"
              disabled={!confirm}
              loading={loading}
              onClick={handleDelete}
            >
              Supprimer définitivement
            </Button>
          </div>
        </Card>
      </div>
    </PageLayout>
  )
}

export default DeleteAccountPage
