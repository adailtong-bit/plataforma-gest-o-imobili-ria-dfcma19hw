import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from '@/stores/AppContext'
import Layout from '@/components/Layout'
import Index from '@/pages/Index'
import Dashboard from '@/pages/Dashboard'
import Properties from '@/pages/Properties'
import Financial from '@/pages/Financial'
import Users from '@/pages/Users'
import Settings from '@/pages/Settings'
import { RequirePermission } from '@/components/RequirePermission'
import { Toaster } from '@/components/ui/toaster'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Marketing Landing Page */}
          <Route path="/" element={<Index />} />

          {/* Placeholder for unauthenticated redirection */}
          <Route path="/login" element={<Navigate to="/" replace />} />

          {/* Protected Application Routes */}
          <Route element={<Layout />}>
            <Route
              path="/dashboard"
              element={
                <RequirePermission resource="dashboard" action="view">
                  <Dashboard />
                </RequirePermission>
              }
            />
            <Route
              path="/properties"
              element={
                <RequirePermission resource="properties" action="view">
                  <Properties />
                </RequirePermission>
              }
            />
            <Route
              path="/financial"
              element={
                <RequirePermission resource="financial" action="view">
                  <Financial />
                </RequirePermission>
              }
            />
            <Route
              path="/users"
              element={
                <RequirePermission resource="users" action="view">
                  <Users />
                </RequirePermission>
              }
            />
            <Route
              path="/settings"
              element={
                <RequirePermission resource="settings" action="view">
                  <Settings />
                </RequirePermission>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AppProvider>
  )
}
