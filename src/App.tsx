/* ── GardeCoeur — App.tsx (React Router) ───────────────────────────────── */

import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/layout'
import { Spinner } from '@/components/ui'

// Lazy loading des pages
const HomePage          = lazy(() => import('@/pages/Home'))
const LoginPage         = lazy(() => import('@/pages/Auth').then(m => ({ default: m.LoginPage })))
const RegisterPage      = lazy(() => import('@/pages/Auth').then(m => ({ default: m.RegisterPage })))
const ProfileDetailPage = lazy(() => import('@/pages/Profile'))

// Placeholder pages (à développer dans le sprint suivant)
const SearchPage   = lazy(() => import('@/pages/Search'))
const MessagesPage = lazy(() => import('@/pages/Messages'))
const MyProfile    = lazy(() => import('@/pages/MyProfile'))

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <Spinner size="lg" />
  </div>
)


const App: React.FC = () => (
  <BrowserRouter>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Public ── */}
        <Route path="/"         element={<HomePage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Protégées ── */}
        <Route path="/search" element={
          <ProtectedRoute><SearchPage /></ProtectedRoute>
        } />
        <Route path="/profile/:id" element={
          <ProtectedRoute><ProfileDetailPage /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><MyProfile /></ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute><MessagesPage /></ProtectedRoute>
        } />

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
)

export default App
