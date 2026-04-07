/* ── GardeCoeur — Mon Profil (édition) ──────────────────────────────────── */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { PageLayout } from '@/components/layout'
import { Avatar, Badge, Button, Spinner, Chip } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { profilesApi } from '@/services/api'
import type { ParentProfile, RetiredProfile, UserRole } from '@/types'
import { AVAILABILITY_LABELS, GUARD_LOCATION_LABELS } from '@/types'
import styles from './MyProfile.module.css'

/* ── Zod schemas ─────────────────────────────────────────────────────────── */

const personalParentSchema = z.object({
  first_name: z.string().min(1, 'Requis'),
  last_name:  z.string().min(1, 'Requis'),
  city:       z.string().min(2, 'Minimum 2 caractères'),
})

const personalRetiredSchema = z.object({
  first_name:  z.string().min(1, 'Requis'),
  last_name:   z.string().min(1, 'Requis'),
  city:        z.string().min(2, 'Minimum 2 caractères'),
  age:         z.coerce.number().min(60, 'Minimum 60 ans').max(100, 'Maximum 100 ans'),
  bio:         z.string().optional().default(''),
  experience:  z.string().optional().default(''),
  hobbies:     z.string().optional().default(''),
  activities:  z.string().optional().default(''),
})

const availabilityParentSchema = z.object({
  guard_needs:    z.enum(['FULL', 'PARTIAL', 'WEEKEND']),
  guard_location: z.enum(['HOME', 'RETIRED', 'FLEXIBLE']),
})

const availabilityRetiredSchema = z.object({
  availability:   z.enum(['FULL', 'PARTIAL', 'WEEKEND']),
  guard_location: z.enum(['HOME', 'RETIRED', 'FLEXIBLE']),
})

const homeSchema = z.object({
  type:        z.enum(['HOUSE', 'APARTMENT']),
  has_garden:  z.boolean(),
  has_park:    z.boolean(),
  has_animals: z.boolean(),
  description: z.string().optional().default(''),
})

const childSchema = z.object({
  id:         z.number().optional(),
  first_name: z.string().min(1, 'Requis'),
  age:        z.coerce.number().min(0).max(18),
  character:  z.string().optional().default(''),
  hobbies:    z.string().optional().default(''),
  allergies:  z.string().optional().default(''),
})

const childrenSchema = z.object({
  children: z.array(childSchema),
})

type PersonalParentData   = z.infer<typeof personalParentSchema>
type PersonalRetiredData  = z.infer<typeof personalRetiredSchema>
type AvailabilityParentData  = z.infer<typeof availabilityParentSchema>
type AvailabilityRetiredData = z.infer<typeof availabilityRetiredSchema>
type HomeData     = z.infer<typeof homeSchema>
type ChildrenData = z.infer<typeof childrenSchema>

/* ── Constants ───────────────────────────────────────────────────────────── */

type Section = 'personal' | 'availability' | 'home' | 'children'

const SECTIONS_PARENT: { id: Section; label: string }[] = [
  { id: 'personal',     label: 'Informations personnelles' },
  { id: 'availability', label: 'Disponibilité & garde' },
  { id: 'home',         label: 'Mon logement' },
  { id: 'children',     label: 'Mes enfants' },
]

const SECTIONS_RETIRED: { id: Section; label: string }[] = [
  { id: 'personal',     label: 'Informations personnelles' },
  { id: 'availability', label: 'Disponibilité & garde' },
  { id: 'home',         label: 'Mon logement' },
]

const DEFAULT_HOME: HomeData = {
  type: 'HOUSE', has_garden: false, has_park: false, has_animals: false, description: '',
}

/* ── Toast ───────────────────────────────────────────────────────────────── */

interface ToastState { message: string; type: 'success' | 'error' }

const Toast: React.FC<ToastState & { onHide: () => void }> = ({ message, type, onHide }) => {
  useEffect(() => {
    const t = setTimeout(onHide, 3000)
    return () => clearTimeout(t)
  }, [onHide])

  return (
    <div className={clsx(styles.toast, type === 'success' ? styles.toastSuccess : styles.toastError)}>
      <span>{type === 'success' ? '✓' : '✕'}</span>
      {message}
    </div>
  )
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function getInitials(first: string, last: string): string {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

function buildPayload(
  profile: ParentProfile | RetiredProfile,
  role: UserRole,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  if (role === 'PARENT') {
    const p = profile as ParentProfile
    return {
      first_name: p.first_name, last_name: p.last_name, city: p.city,
      guard_needs: p.guard_needs, guard_location: p.guard_location,
      children: p.children,
      home: p.home ?? DEFAULT_HOME,
      ...patch,
    }
  }
  const r = profile as RetiredProfile
  return {
    first_name: r.first_name, last_name: r.last_name, age: r.age, city: r.city,
    bio: r.bio, experience: r.experience, hobbies: r.hobbies, activities: r.activities,
    availability: r.availability, guard_location: r.guard_location,
    home: r.home ?? DEFAULT_HOME,
    ...patch,
  }
}

/* ── Shared save handler type ────────────────────────────────────────────── */

type SaveFn = (patch: Record<string, unknown>) => Promise<void>

/* ── Personal form — Parent ──────────────────────────────────────────────── */

const PersonalParentForm: React.FC<{
  profile: ParentProfile
  onSave: SaveFn
  onDirtyChange: (d: boolean) => void
}> = ({ profile, onSave, onDirtyChange }) => {
  const { register, handleSubmit, formState: { errors, isDirty, isSubmitting }, reset } =
    useForm<PersonalParentData>({
      resolver: zodResolver(personalParentSchema),
      defaultValues: { first_name: profile.first_name, last_name: profile.last_name, city: profile.city },
    })

  useEffect(() => { onDirtyChange(isDirty) }, [isDirty, onDirtyChange])
  useEffect(() => {
    reset({ first_name: profile.first_name, last_name: profile.last_name, city: profile.city })
  }, [profile, reset])

  const submit = handleSubmit(async (data) => {
    try { await onSave(data); reset(data) } catch { /* toast handled by parent */ }
  })

  return (
    <form onSubmit={submit} className={styles.formInner}>
      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Prénom</label>
          <input className={clsx(styles.input, errors.first_name && styles.inputError)} {...register('first_name')} />
          {errors.first_name && <span className={styles.fieldError}>{errors.first_name.message}</span>}
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Nom</label>
          <input className={clsx(styles.input, errors.last_name && styles.inputError)} {...register('last_name')} />
          {errors.last_name && <span className={styles.fieldError}>{errors.last_name.message}</span>}
        </div>
      </div>
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Ville</label>
        <input className={clsx(styles.input, errors.city && styles.inputError)} {...register('city')} />
        {errors.city && <span className={styles.fieldError}>{errors.city.message}</span>}
      </div>
      <div className={styles.saveRow}>
        <Button type="submit" variant="primary" loading={isSubmitting} disabled={!isDirty}>
          Sauvegarder
        </Button>
      </div>
    </form>
  )
}

/* ── Personal form — Retraité ────────────────────────────────────────────── */

const PersonalRetiredForm: React.FC<{
  profile: RetiredProfile
  onSave: SaveFn
  onDirtyChange: (d: boolean) => void
}> = ({ profile, onSave, onDirtyChange }) => {
  const { register, handleSubmit, formState: { errors, isDirty, isSubmitting }, reset } =
    useForm<PersonalRetiredData>({
      resolver: zodResolver(personalRetiredSchema),
      defaultValues: {
        first_name: profile.first_name, last_name: profile.last_name,
        city: profile.city, age: profile.age,
        bio: profile.bio ?? '', experience: profile.experience ?? '',
        hobbies: profile.hobbies ?? '', activities: profile.activities ?? '',
      },
    })

  useEffect(() => { onDirtyChange(isDirty) }, [isDirty, onDirtyChange])
  useEffect(() => {
    reset({
      first_name: profile.first_name, last_name: profile.last_name,
      city: profile.city, age: profile.age,
      bio: profile.bio ?? '', experience: profile.experience ?? '',
      hobbies: profile.hobbies ?? '', activities: profile.activities ?? '',
    })
  }, [profile, reset])

  const submit = handleSubmit(async (data) => {
    try { await onSave(data); reset(data) } catch { /* toast handled by parent */ }
  })

  return (
    <form onSubmit={submit} className={styles.formInner}>
      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Prénom</label>
          <input className={clsx(styles.input, errors.first_name && styles.inputError)} {...register('first_name')} />
          {errors.first_name && <span className={styles.fieldError}>{errors.first_name.message}</span>}
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Nom</label>
          <input className={clsx(styles.input, errors.last_name && styles.inputError)} {...register('last_name')} />
          {errors.last_name && <span className={styles.fieldError}>{errors.last_name.message}</span>}
        </div>
      </div>
      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Ville</label>
          <input className={clsx(styles.input, errors.city && styles.inputError)} {...register('city')} />
          {errors.city && <span className={styles.fieldError}>{errors.city.message}</span>}
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Âge</label>
          <input type="number" className={clsx(styles.input, errors.age && styles.inputError)} {...register('age')} />
          {errors.age && <span className={styles.fieldError}>{errors.age.message}</span>}
        </div>
      </div>
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Biographie</label>
        <textarea className={styles.textarea} rows={3} placeholder="Parlez de vous…" {...register('bio')} />
      </div>
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Expérience avec les enfants</label>
        <textarea className={styles.textarea} rows={3} {...register('experience')} />
      </div>
      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Loisirs</label>
          <textarea className={styles.textarea} rows={2} {...register('hobbies')} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Activités proposées</label>
          <textarea className={styles.textarea} rows={2} {...register('activities')} />
        </div>
      </div>
      <div className={styles.saveRow}>
        <Button type="submit" variant="primary" loading={isSubmitting} disabled={!isDirty}>
          Sauvegarder
        </Button>
      </div>
    </form>
  )
}

/* ── Availability form — Parent ──────────────────────────────────────────── */

const AvailabilityParentForm: React.FC<{
  profile: ParentProfile
  onSave: SaveFn
  onDirtyChange: (d: boolean) => void
}> = ({ profile, onSave, onDirtyChange }) => {
  const { control, handleSubmit, formState: { isDirty, isSubmitting }, reset } =
    useForm<AvailabilityParentData>({
      resolver: zodResolver(availabilityParentSchema),
      defaultValues: { guard_needs: profile.guard_needs, guard_location: profile.guard_location },
    })

  useEffect(() => { onDirtyChange(isDirty) }, [isDirty, onDirtyChange])
  useEffect(() => {
    reset({ guard_needs: profile.guard_needs, guard_location: profile.guard_location })
  }, [profile, reset])

  const submit = handleSubmit(async (data) => {
    try { await onSave(data); reset(data) } catch { /* toast handled by parent */ }
  })

  return (
    <form onSubmit={submit} className={styles.formInner}>
      <div className={styles.chipSection}>
        <div className={styles.chipLabel}>Besoin de garde</div>
        <Controller name="guard_needs" control={control} render={({ field }) => (
          <div className={styles.chipGroup}>
            {(['FULL', 'PARTIAL', 'WEEKEND'] as const).map(v => (
              <Chip key={v} selected={field.value === v} onClick={() => field.onChange(v)} color="slate">
                {AVAILABILITY_LABELS[v]}
              </Chip>
            ))}
          </div>
        )} />
      </div>
      <div className={styles.chipSection}>
        <div className={styles.chipLabel}>Lieu souhaité</div>
        <Controller name="guard_location" control={control} render={({ field }) => (
          <div className={styles.chipGroup}>
            {(['HOME', 'RETIRED', 'FLEXIBLE'] as const).map(v => (
              <Chip key={v} selected={field.value === v} onClick={() => field.onChange(v)} color="slate">
                {GUARD_LOCATION_LABELS[v]}
              </Chip>
            ))}
          </div>
        )} />
      </div>
      <div className={styles.saveRow}>
        <Button type="submit" variant="primary" loading={isSubmitting} disabled={!isDirty}>
          Sauvegarder
        </Button>
      </div>
    </form>
  )
}

/* ── Availability form — Retraité ────────────────────────────────────────── */

const AvailabilityRetiredForm: React.FC<{
  profile: RetiredProfile
  onSave: SaveFn
  onDirtyChange: (d: boolean) => void
}> = ({ profile, onSave, onDirtyChange }) => {
  const { control, handleSubmit, formState: { isDirty, isSubmitting }, reset } =
    useForm<AvailabilityRetiredData>({
      resolver: zodResolver(availabilityRetiredSchema),
      defaultValues: { availability: profile.availability, guard_location: profile.guard_location },
    })

  useEffect(() => { onDirtyChange(isDirty) }, [isDirty, onDirtyChange])
  useEffect(() => {
    reset({ availability: profile.availability, guard_location: profile.guard_location })
  }, [profile, reset])

  const submit = handleSubmit(async (data) => {
    try { await onSave(data); reset(data) } catch { /* toast handled by parent */ }
  })

  return (
    <form onSubmit={submit} className={styles.formInner}>
      <div className={styles.chipSection}>
        <div className={styles.chipLabel}>Disponibilités</div>
        <Controller name="availability" control={control} render={({ field }) => (
          <div className={styles.chipGroup}>
            {(['FULL', 'PARTIAL', 'WEEKEND'] as const).map(v => (
              <Chip key={v} selected={field.value === v} onClick={() => field.onChange(v)} color="moss">
                {AVAILABILITY_LABELS[v]}
              </Chip>
            ))}
          </div>
        )} />
      </div>
      <div className={styles.chipSection}>
        <div className={styles.chipLabel}>Lieu proposé</div>
        <Controller name="guard_location" control={control} render={({ field }) => (
          <div className={styles.chipGroup}>
            {(['HOME', 'RETIRED', 'FLEXIBLE'] as const).map(v => (
              <Chip key={v} selected={field.value === v} onClick={() => field.onChange(v)} color="moss">
                {GUARD_LOCATION_LABELS[v]}
              </Chip>
            ))}
          </div>
        )} />
      </div>
      <div className={styles.saveRow}>
        <Button type="submit" variant="primary" loading={isSubmitting} disabled={!isDirty}>
          Sauvegarder
        </Button>
      </div>
    </form>
  )
}

/* ── Home form ───────────────────────────────────────────────────────────── */

const HomeForm: React.FC<{
  profile: ParentProfile | RetiredProfile
  onSave: SaveFn
  onDirtyChange: (d: boolean) => void
}> = ({ profile, onSave, onDirtyChange }) => {
  const h = profile.home
  const dv: HomeData = h
    ? { type: h.type, has_garden: h.has_garden, has_park: h.has_park, has_animals: h.has_animals, description: h.description }
    : DEFAULT_HOME

  const { register, control, handleSubmit, formState: { isDirty, isSubmitting }, reset } =
    useForm<HomeData>({ resolver: zodResolver(homeSchema), defaultValues: dv })

  useEffect(() => { onDirtyChange(isDirty) }, [isDirty, onDirtyChange])
  useEffect(() => {
    const ph = profile.home
    reset(ph
      ? { type: ph.type, has_garden: ph.has_garden, has_park: ph.has_park, has_animals: ph.has_animals, description: ph.description }
      : DEFAULT_HOME)
  }, [profile, reset])

  const submit = handleSubmit(async (data) => {
    try { await onSave({ home: data }); reset(data) } catch { /* toast handled by parent */ }
  })

  return (
    <form onSubmit={submit} className={styles.formInner}>
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Type de logement</label>
        <select className={styles.select} {...register('type')}>
          <option value="HOUSE">Maison</option>
          <option value="APARTMENT">Appartement</option>
        </select>
      </div>
      <div className={styles.chipSection}>
        <div className={styles.chipLabel}>Caractéristiques</div>
        <div className={styles.chipGroup}>
          <Controller name="has_garden" control={control} render={({ field }) => (
            <Chip selected={field.value} onClick={() => field.onChange(!field.value)} color="moss">Jardin</Chip>
          )} />
          <Controller name="has_park" control={control} render={({ field }) => (
            <Chip selected={field.value} onClick={() => field.onChange(!field.value)} color="moss">Parc à proximité</Chip>
          )} />
          <Controller name="has_animals" control={control} render={({ field }) => (
            <Chip selected={field.value} onClick={() => field.onChange(!field.value)} color="moss">Animaux</Chip>
          )} />
        </div>
      </div>
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Description</label>
        <textarea className={styles.textarea} rows={3} placeholder="Décrivez votre logement…" {...register('description')} />
      </div>
      <div className={styles.saveRow}>
        <Button type="submit" variant="primary" loading={isSubmitting} disabled={!isDirty}>
          Sauvegarder
        </Button>
      </div>
    </form>
  )
}

/* ── Children form ───────────────────────────────────────────────────────── */

const ChildrenForm: React.FC<{
  profile: ParentProfile
  onSave: SaveFn
  onDirtyChange: (d: boolean) => void
}> = ({ profile, onSave, onDirtyChange }) => {
  const { register, control, handleSubmit, formState: { errors, isDirty, isSubmitting }, reset } =
    useForm<ChildrenData>({ resolver: zodResolver(childrenSchema), defaultValues: { children: profile.children } })

  const { fields, append, remove } = useFieldArray({ control, name: 'children' })

  useEffect(() => { onDirtyChange(isDirty) }, [isDirty, onDirtyChange])
  useEffect(() => { reset({ children: profile.children }) }, [profile, reset])

  const submit = handleSubmit(async (data) => {
    try { await onSave({ children: data.children }); reset(data) } catch { /* toast handled by parent */ }
  })

  const addChild = useCallback(() => {
    append({ first_name: '', age: 0, character: '', hobbies: '', allergies: '' })
  }, [append])

  return (
    <form onSubmit={submit} className={styles.formInner}>
      {fields.length === 0 && (
        <p className={styles.emptyText}>Aucun enfant ajouté.</p>
      )}
      {fields.map((field, idx) => (
        <div key={field.id} className={styles.childCard}>
          <div className={styles.childHeader}>
            <span className={styles.childTitle}>Enfant {idx + 1}</span>
            <button type="button" className={styles.removeBtn} onClick={() => remove(idx)} aria-label="Supprimer">
              ✕
            </button>
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Prénom</label>
              <input
                className={clsx(styles.input, errors.children?.[idx]?.first_name && styles.inputError)}
                {...register(`children.${idx}.first_name`)}
              />
              {errors.children?.[idx]?.first_name && (
                <span className={styles.fieldError}>{errors.children[idx]?.first_name?.message}</span>
              )}
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Âge</label>
              <input
                type="number"
                className={clsx(styles.input, errors.children?.[idx]?.age && styles.inputError)}
                {...register(`children.${idx}.age`)}
              />
            </div>
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Caractère / personnalité</label>
            <input className={styles.input} {...register(`children.${idx}.character`)} />
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Hobbies</label>
              <input className={styles.input} {...register(`children.${idx}.hobbies`)} />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Allergies</label>
              <input className={styles.input} {...register(`children.${idx}.allergies`)} />
            </div>
          </div>
        </div>
      ))}
      <button type="button" className={styles.addChildBtn} onClick={addChild}>
        + Ajouter un enfant
      </button>
      <div className={styles.saveRow}>
        <Button type="submit" variant="primary" loading={isSubmitting} disabled={!isDirty}>
          Sauvegarder
        </Button>
      </div>
    </form>
  )
}

/* ── Main page ───────────────────────────────────────────────────────────── */

const MyProfilePage: React.FC = () => {
  const { user } = useAuthStore()
  const role: UserRole = user?.role ?? 'PARENT'

  const [profile, setProfile]           = useState<ParentProfile | RetiredProfile | null>(null)
  const [loading, setLoading]           = useState(true)
  const [activeSection, setActiveSection] = useState<Section>('personal')
  const [dirtySet, setDirtySet]         = useState<Set<Section>>(new Set())
  const [toast, setToast]               = useState<ToastState | null>(null)
  const [avatarUrl, setAvatarUrl]       = useState<string | null>(null)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [avatarError, setAvatarError]   = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const sections = role === 'PARENT' ? SECTIONS_PARENT : SECTIONS_RETIRED

  /* Load profile */
  useEffect(() => {
    profilesApi.getMe()
      .then(res => {
        const data = res.data as ParentProfile | RetiredProfile
        setProfile(data)
        setAvatarUrl(data.avatar)
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [])

  /* Stable dirty handlers per section */
  const makeDirtyHandler = useCallback((section: Section) => (dirty: boolean) => {
    setDirtySet(prev => {
      const next = new Set(prev)
      dirty ? next.add(section) : next.delete(section)
      return next
    })
  }, [])

  const onDirtyPersonal     = useCallback(makeDirtyHandler('personal'),     [makeDirtyHandler])
  const onDirtyAvailability = useCallback(makeDirtyHandler('availability'), [makeDirtyHandler])
  const onDirtyHome         = useCallback(makeDirtyHandler('home'),         [makeDirtyHandler])
  const onDirtyChildren     = useCallback(makeDirtyHandler('children'),     [makeDirtyHandler])

  /* Save handler (called by each section form) */
  const handleSave: SaveFn = useCallback(async (patch) => {
    if (!profile || !user) return
    const payload = buildPayload(profile, role, patch)
    try {
      await profilesApi.updateMe(payload)
      setProfile(prev => prev ? { ...prev, ...patch } as ParentProfile | RetiredProfile : null)
      setToast({ message: 'Profil mis à jour ✓', type: 'success' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue'
      setToast({ message: msg, type: 'error' })
      throw err
    }
  }, [profile, user, role])

  /* Avatar upload */
  const handleAvatarClick = useCallback(() => fileInputRef.current?.click(), [])

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('La photo ne doit pas dépasser 5 Mo.')
      return
    }
    setAvatarError(null)
    setAvatarLoading(true)
    try {
      const res = await profilesApi.uploadAvatar(file)
      const data = res.data as { avatar: string }
      setAvatarUrl(data.avatar)
      setToast({ message: 'Photo mise à jour ✓', type: 'success' })
    } catch {
      setToast({ message: 'Erreur lors du chargement de la photo.', type: 'error' })
    } finally {
      setAvatarLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [])

  const hideToast = useCallback(() => setToast(null), [])

  /* Loading state */
  if (loading) {
    return (
      <PageLayout>
        <div className={styles.loadingState}><Spinner size="lg" /></div>
      </PageLayout>
    )
  }

  const profileName  = profile ? `${profile.first_name} ${profile.last_name}` : 'Nouveau compte'
  const initials     = profile ? getInitials(profile.first_name, profile.last_name) : '?'
  const memberSince  = profile
    ? new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : ''

  return (
    <PageLayout>
      <div className={styles.page}>

        {/* ── Header ── */}
        <div className={styles.profileHeader}>
          <div className={styles.headerContent}>
            <div className={styles.avatarWrapper} onClick={handleAvatarClick}>
              {avatarLoading ? (
                <div className={styles.avatarSpinner}><Spinner size="lg" /></div>
              ) : (
                <>
                  <Avatar
                    src={avatarUrl}
                    initials={initials}
                    size="xl"
                    color={role === 'PARENT' ? 'apricot' : 'moss'}
                  />
                  <div className={styles.avatarOverlay}>
                    <span className={styles.avatarOverlayIcon}>📷</span>
                    <span className={styles.avatarOverlayText}>Modifier</span>
                  </div>
                </>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className={styles.hiddenInput} onChange={handleFileChange} />

            <div className={styles.profileDetails}>
              <h1 className={styles.profileName}>{profileName}</h1>
              <div className={styles.profileMeta}>
                <Badge color={role === 'PARENT' ? 'apricot' : 'moss'}>
                  {role === 'PARENT' ? 'Parent' : 'Retraité·e'}
                </Badge>
                {user?.email && <span className={styles.profileEmail}>{user.email}</span>}
                {memberSince && <span className={styles.profileSince}>Membre depuis {memberSince}</span>}
              </div>
              {avatarError && <span className={styles.avatarErrorMsg}>{avatarError}</span>}
              {!profile && (
                <p className={styles.newProfileMsg}>Complétez votre profil pour apparaître dans les recherches.</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className={styles.layout}>

          {/* Sidebar */}
          <nav className={styles.sidebar}>
            {sections.map(s => (
              <button
                key={s.id}
                type="button"
                className={clsx(styles.navItem, activeSection === s.id && styles.navItemActive)}
                onClick={() => setActiveSection(s.id)}
              >
                <span>{s.label}</span>
                {dirtySet.has(s.id) && <span className={styles.dirtyDot} title="Modifications non sauvegardées" />}
              </button>
            ))}
          </nav>

          {/* Form area */}
          <div className={styles.content}>
            <div className={styles.formCard}>
              <div className={styles.formCardHeader}>
                <h2 className={styles.sectionTitle}>
                  {sections.find(s => s.id === activeSection)?.label}
                </h2>
                {dirtySet.has(activeSection) && <Badge color="apricot">Non sauvegardé</Badge>}
              </div>

              {profile === null ? (
                <p className={styles.emptyText}>
                  Aucun profil trouvé. Commencez par remplir les informations ci-dessous.
                </p>
              ) : (
                <>
                  {activeSection === 'personal' && role === 'PARENT' && (
                    <PersonalParentForm
                      key="personal-parent"
                      profile={profile as ParentProfile}
                      onSave={handleSave}
                      onDirtyChange={onDirtyPersonal}
                    />
                  )}
                  {activeSection === 'personal' && role === 'RETIRED' && (
                    <PersonalRetiredForm
                      key="personal-retired"
                      profile={profile as RetiredProfile}
                      onSave={handleSave}
                      onDirtyChange={onDirtyPersonal}
                    />
                  )}
                  {activeSection === 'availability' && role === 'PARENT' && (
                    <AvailabilityParentForm
                      key="avail-parent"
                      profile={profile as ParentProfile}
                      onSave={handleSave}
                      onDirtyChange={onDirtyAvailability}
                    />
                  )}
                  {activeSection === 'availability' && role === 'RETIRED' && (
                    <AvailabilityRetiredForm
                      key="avail-retired"
                      profile={profile as RetiredProfile}
                      onSave={handleSave}
                      onDirtyChange={onDirtyAvailability}
                    />
                  )}
                  {activeSection === 'home' && (
                    <HomeForm
                      key="home"
                      profile={profile}
                      onSave={handleSave}
                      onDirtyChange={onDirtyHome}
                    />
                  )}
                  {activeSection === 'children' && role === 'PARENT' && (
                    <ChildrenForm
                      key="children"
                      profile={profile as ParentProfile}
                      onSave={handleSave}
                      onDirtyChange={onDirtyChildren}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onHide={hideToast} />}

      {/* RGPD */}
      <div style={{ textAlign: 'center', marginTop: 32, paddingBottom: 48 }}>
        <Link
          to="/delete-account"
          style={{ fontSize: '0.78rem', color: 'var(--muted)', textDecoration: 'underline' }}
        >
          Supprimer mon compte
        </Link>
      </div>
    </PageLayout>
  )
}

export default MyProfilePage
