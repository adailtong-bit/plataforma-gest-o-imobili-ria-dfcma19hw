import { SidebarTrigger } from '@/components/ui/sidebar'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Input } from '@/components/ui/input'
import { Search, Globe } from 'lucide-react'
import useLanguageStore from '@/stores/useLanguageStore'
import useSearchStore from '@/stores/useSearchStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export function AppHeader() {
  const location = useLocation()
  const { user } = useAuth()
  const { t, language, setLanguage } = useLanguageStore()
  const { searchQuery, setSearchQuery } = useSearchStore()

  const pathName =
    location.pathname === '/'
      ? 'Dashboard'
      : location.pathname.substring(1).replace('/', ' - ')
  const title = t(
    `route.${pathName.toLowerCase()}`,
    pathName.charAt(0).toUpperCase() + pathName.slice(1),
  )

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'pt', label: 'Português' },
    { code: 'es', label: 'Español' },
  ]

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4 shadow-sm relative z-10 w-full justify-between">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1 text-slate-500 hover:text-slate-900 transition-colors" />
        <div className="w-px h-4 bg-slate-200 mx-1 hidden sm:block" />
        <h1 className="text-sm font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-md hidden sm:block capitalize">
          {title}
        </h1>
      </div>

      <div className="flex-1 max-w-md mx-4 hidden md:flex items-center relative">
        <Search className="w-4 h-4 absolute left-3 text-slate-400" />
        <Input
          placeholder={t('common.search', 'Pesquisar...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-slate-50 border-slate-200 h-9 w-full rounded-full focus-visible:ring-1"
        />
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="md:hidden flex items-center relative w-32 sm:w-48">
          <Search className="w-4 h-4 absolute left-3 text-slate-400" />
          <Input
            placeholder={t('common.search', 'Pesquisar...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200 h-9 w-full rounded-full focus-visible:ring-1"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <Globe className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={
                  language === lang.code
                    ? 'bg-slate-100 font-medium'
                    : 'cursor-pointer'
                }
              >
                {lang.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {user && (
          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full hidden lg:block border border-slate-200 shadow-sm truncate max-w-[200px]">
            {user.email}
          </span>
        )}
      </div>
    </header>
  )
}
