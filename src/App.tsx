import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from '@/stores/AppContext'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center">
                <h1 className="mb-2 text-4xl font-bold tracking-tight text-slate-900">
                  COREPM
                </h1>
                <p className="text-lg text-slate-600">
                  Plataforma de Gestão Imobiliária
                </p>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
