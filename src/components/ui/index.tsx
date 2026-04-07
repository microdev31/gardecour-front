/* ── GardeCoeur — Composants UI réutilisables ───────────────────────────── */

import React from 'react'
import clsx from 'clsx'
import styles from './ui.module.css'
import { useToastStore } from '@/store/toastStore'
import type { ToastVariant } from '@/store/toastStore'

/* ── Button ──────────────────────────────────────────────────────────────── */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'moss' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary', size = 'md', loading, fullWidth, children, className, disabled, ...props
}) => (
  <button
    className={clsx(styles.btn, styles[`btn-${variant}`], styles[`btn-${size}`], fullWidth && styles['btn-full'], className)}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? <span className={styles.spinner} /> : children}
  </button>
)

/* ── Input ───────────────────────────────────────────────────────────────── */

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className={styles.field}>
        {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
        <input
          id={inputId}
          ref={ref}
          className={clsx(styles.input, error && styles['input-error'], className)}
          {...props}
        />
        {hint && !error && <span className={styles.hint}>{hint}</span>}
        {error && <span className={styles.error}>{error}</span>}
      </div>
    )
  }
)
Input.displayName = 'Input'

/* ── Select ──────────────────────────────────────────────────────────────── */

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className={styles.field}>
        {label && <label htmlFor={selectId} className={styles.label}>{label}</label>}
        <select
          id={selectId}
          ref={ref}
          className={clsx(styles.select, error && styles['input-error'], className)}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <span className={styles.error}>{error}</span>}
      </div>
    )
  }
)
Select.displayName = 'Select'

/* ── Textarea ────────────────────────────────────────────────────────────── */

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const areaId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className={styles.field}>
        {label && <label htmlFor={areaId} className={styles.label}>{label}</label>}
        <textarea
          id={areaId}
          ref={ref}
          className={clsx(styles.textarea, error && styles['input-error'], className)}
          {...props}
        />
        {error && <span className={styles.error}>{error}</span>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

/* ── Chip (toggle) ───────────────────────────────────────────────────────── */

interface ChipProps {
  selected?: boolean
  onClick?: () => void
  children: React.ReactNode
  color?: 'slate' | 'moss'
}

export const Chip: React.FC<ChipProps> = ({ selected, onClick, children, color = 'slate' }) => (
  <button
    type="button"
    onClick={onClick}
    className={clsx(styles.chip, selected && styles[`chip-${color}-active`])}
  >
    {children}
  </button>
)

/* ── Badge ───────────────────────────────────────────────────────────────── */

interface BadgeProps {
  children: React.ReactNode
  color?: 'slate' | 'moss' | 'apricot' | 'parchment'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'slate', className }) => (
  <span className={clsx(styles.badge, styles[`badge-${color}`], className)}>{children}</span>
)

/* ── Avatar ──────────────────────────────────────────────────────────────── */

interface AvatarProps {
  src?: string | null
  initials: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'slate' | 'moss' | 'apricot'
}

export const Avatar: React.FC<AvatarProps> = ({ src, initials, size = 'md', color = 'slate' }) => (
  <div className={clsx(styles.avatar, styles[`avatar-${size}`], !src && styles[`avatar-${color}`])}>
    {src
      ? <img src={src} alt={initials} className={styles['avatar-img']} />
      : <span className={styles['avatar-initials']}>{initials}</span>
    }
  </div>
)

/* ── Card ────────────────────────────────────────────────────────────────── */

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hoverable?: boolean
}

export const Card: React.FC<CardProps> = ({ children, className, onClick, hoverable }) => (
  <div
    className={clsx(styles.card, hoverable && styles['card-hoverable'], className)}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
  >
    {children}
  </div>
)

/* ── Spinner ─────────────────────────────────────────────────────────────── */

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => (
  <div className={clsx(styles.spinnerStandalone, styles[`spinner-${size}`])} />
)

/* ── ProgressBar (étapes formulaire) ────────────────────────────────────── */

interface ProgressBarProps {
  steps: number
  current: number
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ steps, current }) => (
  <div className={styles.progressBar}>
    {Array.from({ length: steps }).map((_, i) => (
      <div
        key={i}
        className={clsx(
          styles.progressStep,
          i < current && styles['progressStep-done'],
          i === current && styles['progressStep-active'],
        )}
      />
    ))}
  </div>
)

/* ── Toast + ToastContainer ──────────────────────────────────────────────── */

const ICONS: Record<ToastVariant, string> = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
}

export const ToastContainer: React.FC = () => {
  const { toasts, remove } = useToastStore()
  if (toasts.length === 0) return null

  return (
    <div className={styles.toastContainer} role="region" aria-live="polite" aria-label="Notifications">
      {toasts.map((t) => (
        <div key={t.id} className={clsx(styles.toast, styles[`toast-${t.variant}`])}>
          <span className={styles.toastIcon} aria-hidden="true">{ICONS[t.variant]}</span>
          <span className={styles.toastMessage}>{t.message}</span>
          <button
            className={styles.toastClose}
            onClick={() => remove(t.id)}
            aria-label="Fermer"
          >×</button>
        </div>
      ))}
    </div>
  )
}
