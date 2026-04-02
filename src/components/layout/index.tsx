/* ── GardeCoeur — Layout (Navbar + ProtectedRoute) ──────────────────────── */

import React from 'react'
import { Link, useNavigate, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import styles from './layout.module.css'

/* ── Navbar ──────────────────────────────────────────────────────────────── */

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <header className={styles.navbar}>
      <Link to="/" className={styles.logo}>
        Garde<em>Cœur</em>
      </Link>

      <nav className={styles.navLinks}>
        {isAuthenticated ? (
          <>
            <Link to="/search" className={styles.navLink}>Explorer</Link>
            <Link to="/messages" className={styles.navLink}>Messages</Link>
            <Link to="/profile" className={styles.navLink}>Mon profil</Link>
            <button onClick={handleLogout} className={styles.navBtn}>Déconnexion</button>
          </>
        ) : (
          <>
            <Link to="/login" className={styles.navLink}>Se connecter</Link>
            <Link to="/register" className={styles.navBtnPrimary}>Commencer</Link>
          </>
        )}
      </nav>
    </header>
  )
}

/* ── ProtectedRoute ──────────────────────────────────────────────────────── */

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  return <>{children}</>
}

/* ── PageLayout ──────────────────────────────────────────────────────────── */

export const PageLayout: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children, className
}) => (
  <div className={styles.pageLayout}>
    <Navbar />
    <main className={className}>{children}</main>
  </div>
)
