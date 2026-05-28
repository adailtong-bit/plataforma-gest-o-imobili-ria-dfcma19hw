import { SidebarTrigger } from '@/components/ui/sidebar'
import { useLocation } from 'react-router-dom'
import { useDbTranslations } from '@/hooks/use-db-translations'
import { useAuth } from '@/hooks/use-auth'

export function AppHeader() {
  const location = useLocation()
  const { t } = useDbTranslations()
  const { user } = useAuth()

  const pathName =
    location.pathname === '/'
      ? 'Dashboard'
      : location.pathname.substring(1).replace('/', ' - ')
  const title = t(
    `route.${pathName.toLowerCase()}`,
    pathName.charAt(0).toUpperCase() + pathName.slice(1),
  )

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4 shadow-sm relative z-10 w-full justify-between">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1 text-slate-500 hover:text-slate-900 transition-colors" />
        <div className="w-px h-4 bg-slate-200 mx-1 hidden sm:block" />
        <h1 className="text-sm font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-md hidden sm:block capitalize">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full hidden md:block border border-slate-200 shadow-sm">
            {user.email}
          </span>
        )}
      </div>
    </header>
  )
}
