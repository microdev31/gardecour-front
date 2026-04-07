/* ── GardeCoeur — Pages Auth (Register + Login) ─────────────────────────── */

import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageLayout } from '@/components/layout'
import { Button, Input, Chip, ProgressBar, Card } from '@/components/ui'
import { authApi, profilesApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import type { UserRole, Availability, GuardLocation } from '@/types'
import styles from './Auth.module.css'

/* ── LOGIN ───────────────────────────────────────────────────────────────── */

const loginSchema = z.object({
  email:    z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})
type LoginForm = z.infer<typeof loginSchema>

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { setTokens, setUser } = useAuthStore()
  const [apiError, setApiError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      setApiError('')
      const { data: tokens } = await authApi.login(data)
      setTokens(tokens.access, tokens.refresh)
      const { data: user } = await authApi.me()
      setUser(user)
      if (!user.is_verified) {
        setApiError('unverified')
        return
      }
      toast.success('Bienvenue !')
      navigate('/search')
    } catch {
      setApiError('Email ou mot de passe incorrect.')
    }
  }

  return (
    <PageLayout>
      <div className={styles.authWrap}>
        <div className={styles.authDecor} aria-hidden="true" />
        <Card className={styles.authCard}>
          <div className={styles.authHeader}>
            <h1 className={styles.authTitle}>Bon retour !</h1>
            <p className={styles.authSub}>Connectez-vous à votre compte GardeCoeur.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
            <Input
              label="Email"
              type="email"
              placeholder="vous@email.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            {apiError === 'unverified' ? (
              <div className={styles.unverifiedBanner}>
                <span aria-hidden="true">⚠</span>
                <span>
                  <strong>Email non vérifié.</strong> Consultez votre boîte mail et cliquez sur le lien d'activation avant de vous connecter.
                </span>
              </div>
            ) : apiError ? (
              <p className={styles.apiError}>{apiError}</p>
            ) : null}

            <Button type="submit" fullWidth loading={isSubmitting} style={{ marginTop: 8 }}>
              Se connecter
            </Button>
          </form>

          <p className={styles.authSwitch}>
            Pas encore de compte ?{' '}
            <Link to="/register" className={styles.authLink}>S'inscrire gratuitement</Link>
          </p>
        </Card>
      </div>
    </PageLayout>
  )
}

/* ── REGISTER — étape 1 : choix du rôle ─────────────────────────────────── */

const step1Schema = z.object({
  email:        z.string().email('Email invalide'),
  password:     z.string().min(8, 'Au moins 8 caractères'),
  password2:    z.string(),
  accept_terms: z.literal(true, { errorMap: () => ({ message: 'Vous devez accepter les CGU.' }) }),
}).refine(d => d.password === d.password2, { message: 'Les mots de passe ne correspondent pas.', path: ['password2'] })

type Step1Form = z.infer<typeof step1Schema>

/* ── REGISTER — étape 2 parent ───────────────────────────────────────────── */

const parentStep2Schema = z.object({
  first_name:     z.string().min(1, 'Prénom requis'),
  last_name:      z.string().min(1, 'Nom requis'),
  city:           z.string().min(2, 'Ville requise'),
})
type ParentStep2Form = z.infer<typeof parentStep2Schema>

/* ── REGISTER — étape 2 retraité ─────────────────────────────────────────── */

const retiredStep2Schema = z.object({
  first_name: z.string().min(1, 'Prénom requis'),
  last_name:  z.string().min(1, 'Nom requis'),
  age:        z.coerce.number().min(60, 'Âge minimum 60 ans'),
  city:       z.string().min(2, 'Ville requise'),
})
type RetiredStep2Form = z.infer<typeof retiredStep2Schema>

/* ── PAGE REGISTER ───────────────────────────────────────────────────────── */

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { setTokens, setUser } = useAuthStore()
  const [searchParams] = useSearchParams()

  const [step, setStep]                   = useState(1)
  const [pendingEmail, setPendingEmail]   = useState<string | null>(null)
  const [role, setRole]                   = useState<UserRole>(
    (searchParams.get('role')?.toUpperCase() as UserRole) || 'PARENT'
  )
  const [step1Data, setStep1Data]         = useState<Step1Form | null>(null)
  const [guardNeeds, setGuardNeeds]       = useState<Availability>('PARTIAL')
  const [guardLocation, setGuardLocation] = useState<GuardLocation>('FLEXIBLE')
  const [availability, setAvailability]   = useState<Availability>('PARTIAL')
  const [apiError, setApiError]           = useState('')

  /* Step 1 */
  const form1 = useForm<Step1Form>({ resolver: zodResolver(step1Schema) })
  const onStep1 = (data: Step1Form) => { setStep1Data(data); setStep(2) }

  const finishRegistration = async (profileData: unknown) => {
    if (!step1Data) return
    setApiError('')
    await authApi.register({ ...step1Data, role, accept_terms: step1Data.accept_terms })
    const { data: tokens } = await authApi.login({ email: step1Data.email, password: step1Data.password })
    setTokens(tokens.access, tokens.refresh)
    const { data: user } = await authApi.me()
    setUser(user)
    await profilesApi.updateMe(profileData)
    if (!user.is_verified) {
      setPendingEmail(step1Data.email)
      return
    }
    toast.success('Compte créé ! Bienvenue sur GardeCoeur.')
    navigate('/search')
  }

  /* Step 2 — parent */
  const form2P = useForm<ParentStep2Form>({ resolver: zodResolver(parentStep2Schema) })
  const onStep2Parent = async (data: ParentStep2Form) => {
    try {
      await finishRegistration({ ...data, guard_needs: guardNeeds, guard_location: guardLocation })
    } catch {
      setApiError('Une erreur est survenue. Vérifiez vos informations.')
    }
  }

  /* Step 2 — retraité */
  const form2R = useForm<RetiredStep2Form>({ resolver: zodResolver(retiredStep2Schema) })
  const onStep2Retired = async (data: RetiredStep2Form) => {
    try {
      await finishRegistration({ ...data, availability })
    } catch {
      setApiError('Une erreur est survenue. Vérifiez vos informations.')
    }
  }

  const totalSteps = 2

  /* ── Panel "vérifiez votre email" ── */
  if (pendingEmail) {
    return (
      <PageLayout>
        <div className={styles.authWrap}>
          <div className={styles.authDecor} aria-hidden="true" />
          <Card className={styles.authCard}>
            <div className={styles.pendingWrap}>
              <span className={styles.pendingIcon} aria-hidden="true">✉️</span>
              <h1 className={styles.pendingTitle}>Vérifiez votre email</h1>
              <p className={styles.pendingSub}>
                Un email de confirmation a été envoyé à{' '}
                <span className={styles.pendingEmail}>{pendingEmail}</span>.
                <br />Cliquez sur le lien pour activer votre compte.
              </p>
              <Link to="/login">
                <Button variant="secondary">Aller à la connexion</Button>
              </Link>
            </div>
          </Card>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className={styles.authWrap}>
        <div className={styles.authDecor} aria-hidden="true" />
        <Card className={styles.authCard}>

          {/* ── Sélecteur de rôle ── */}
          <div className={styles.roleToggle}>
            <button
              type="button"
              className={`${styles.roleBtn} ${role === 'PARENT' ? styles.roleBtnActive : ''}`}
              onClick={() => setRole('PARENT')}
            >👨‍👩‍👧 Parent</button>
            <button
              type="button"
              className={`${styles.roleBtn} ${role === 'RETIRED' ? styles.roleBtnActive : ''}`}
              onClick={() => setRole('RETIRED')}
            >🌿 Retraité</button>
          </div>

          <ProgressBar steps={totalSteps} current={step - 1} />

          {/* ── ÉTAPE 1 ── */}
          {step === 1 && (
            <div className="animate-fadeUp">
              <div className={styles.authHeader}>
                <h1 className={styles.authTitle}>Créer mon compte</h1>
                <p className={styles.authSub}>Étape 1 — Vos identifiants</p>
              </div>
              <form onSubmit={form1.handleSubmit(onStep1)} noValidate className={styles.form}>
                <Input
                  label="Email"
                  type="email"
                  placeholder="vous@email.com"
                  error={form1.formState.errors.email?.message}
                  {...form1.register('email')}
                />
                <Input
                  label="Mot de passe"
                  type="password"
                  placeholder="Au moins 8 caractères"
                  error={form1.formState.errors.password?.message}
                  {...form1.register('password')}
                />
                <Input
                  label="Confirmer le mot de passe"
                  type="password"
                  placeholder="••••••••"
                  error={form1.formState.errors.password2?.message}
                  {...form1.register('password2')}
                />
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    {...form1.register('accept_terms')}
                    className={styles.checkbox}
                  />
                  <span>
                    J'accepte les{' '}
                    <Link to="/cgu" target="_blank" className={styles.authLink}>CGU</Link>
                    {' '}et la{' '}
                    <Link to="/confidentialite" target="_blank" className={styles.authLink}>politique de confidentialité</Link>
                  </span>
                </label>
                {form1.formState.errors.accept_terms && (
                  <p className={styles.apiError}>{form1.formState.errors.accept_terms.message}</p>
                )}

                <Button type="submit" fullWidth style={{ marginTop: 8 }}>
                  Continuer →
                </Button>
              </form>
              <p className={styles.authSwitch}>
                Déjà inscrit ? <Link to="/login" className={styles.authLink}>Se connecter</Link>
              </p>
            </div>
          )}

          {/* ── ÉTAPE 2 PARENT ── */}
          {step === 2 && role === 'PARENT' && (
            <div className="animate-fadeUp">
              <div className={styles.authHeader}>
                <h1 className={styles.authTitle}>Votre profil parent</h1>
                <p className={styles.authSub}>Étape 2 — Quelques informations</p>
              </div>
              <form onSubmit={form2P.handleSubmit(onStep2Parent)} noValidate className={styles.form}>
                <div className={styles.fieldRow}>
                  <Input label="Prénom" placeholder="Marie" error={form2P.formState.errors.first_name?.message} {...form2P.register('first_name')} />
                  <Input label="Nom"    placeholder="Dupont" error={form2P.formState.errors.last_name?.message}  {...form2P.register('last_name')} />
                </div>
                <Input label="Ville" placeholder="Toulouse" error={form2P.formState.errors.city?.message} {...form2P.register('city')} />

                <div className={styles.chipGroup}>
                  <label className={styles.chipLabel}>Besoin de garde</label>
                  <div className={styles.chips}>
                    {(['FULL','PARTIAL','WEEKEND'] as Availability[]).map(v => (
                      <Chip key={v} selected={guardNeeds === v} onClick={() => setGuardNeeds(v)}>
                        {{ FULL:'Plein temps', PARTIAL:'Temps partiel', WEEKEND:'Week-end' }[v]}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div className={styles.chipGroup}>
                  <label className={styles.chipLabel}>Lieu de garde souhaité</label>
                  <div className={styles.chips}>
                    {(['HOME','RETIRED','FLEXIBLE'] as GuardLocation[]).map(v => (
                      <Chip key={v} selected={guardLocation === v} onClick={() => setGuardLocation(v)}>
                        {{ HOME:'Chez nous', RETIRED:'Chez le retraité', FLEXIBLE:'Flexible' }[v]}
                      </Chip>
                    ))}
                  </div>
                </div>

                {apiError && <p className={styles.apiError}>{apiError}</p>}

                <div className={styles.formActions}>
                  <Button type="button" variant="ghost" onClick={() => setStep(1)}>← Retour</Button>
                  <Button type="submit" loading={form2P.formState.isSubmitting}>Créer mon profil ✓</Button>
                </div>
              </form>
            </div>
          )}

          {/* ── ÉTAPE 2 RETRAITÉ ── */}
          {step === 2 && role === 'RETIRED' && (
            <div className="animate-fadeUp">
              <div className={styles.authHeader}>
                <h1 className={styles.authTitle}>Votre profil bénévole</h1>
                <p className={styles.authSub}>Étape 2 — Quelques informations</p>
              </div>
              <form onSubmit={form2R.handleSubmit(onStep2Retired)} noValidate className={styles.form}>
                <div className={styles.fieldRow}>
                  <Input label="Prénom" placeholder="Jean"   error={form2R.formState.errors.first_name?.message} {...form2R.register('first_name')} />
                  <Input label="Nom"    placeholder="Martin" error={form2R.formState.errors.last_name?.message}  {...form2R.register('last_name')} />
                </div>
                <div className={styles.fieldRow}>
                  <Input label="Âge"   type="number" placeholder="68" error={form2R.formState.errors.age?.message} {...form2R.register('age')} />
                  <Input label="Ville" placeholder="Toulouse"          error={form2R.formState.errors.city?.message} {...form2R.register('city')} />
                </div>

                <div className={styles.chipGroup}>
                  <label className={styles.chipLabel}>Disponibilités</label>
                  <div className={styles.chips}>
                    {(['FULL','PARTIAL','WEEKEND'] as Availability[]).map(v => (
                      <Chip key={v} color="moss" selected={availability === v} onClick={() => setAvailability(v)}>
                        {{ FULL:'Plein temps', PARTIAL:'Temps partiel', WEEKEND:'Week-end' }[v]}
                      </Chip>
                    ))}
                  </div>
                </div>

                {apiError && <p className={styles.apiError}>{apiError}</p>}

                <div className={styles.formActions}>
                  <Button type="button" variant="ghost" onClick={() => setStep(1)}>← Retour</Button>
                  <Button type="submit" variant="moss" loading={form2R.formState.isSubmitting}>Créer mon profil ✓</Button>
                </div>
              </form>
            </div>
          )}
        </Card>
      </div>
    </PageLayout>
  )
}
