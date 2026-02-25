import { useState, useEffect, useMemo } from 'react'
import {
  Bell,
  Search,
  Menu,
  Globe,
  Circle,
  Building,
  User,
  CheckSquare,
  HelpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SidebarTrigger } from '@/components/ui/sidebar'
import useAuthStore from '@/stores/useAuthStore'
import useLanguageStore from '@/stores/useLanguageStore'
import useNotificationStore from '@/stores/useNotificationStore'
import usePublicityStore from '@/stores/usePublicityStore'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format, isValid } from 'date-fns'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { useNavigate, Link } from 'react-router-dom'
import usePropertyStore from '@/stores/usePropertyStore'
import useTenantStore from '@/stores/useTenantStore'
import useOwnerStore from '@/stores/useOwnerStore'
import useTaskStore from '@/stores/useTaskStore'
import { ThemeCustomizer } from '@/components/ThemeCustomizer'
import logo from '@/assets/logo-estilizado.jpg'
import { DataMask } from '@/components/DataMask'
import { useAdRotation } from '@/hooks/useAdRotation'

export function AppHeader() {
  const { currentUser, setCurrentUser, allUsers, logout } = useAuthStore()
  const { language, setLanguage, t } = useLanguageStore()
  const { notifications, markNotificationAsRead } = useNotificationStore()
  const navigate = useNavigate()

  // Stores for search
  const { properties } = usePropertyStore()
  const { tenants } = useTenantStore()
  const { owners } = useOwnerStore()
  const { tasks } = useTaskStore()

  // Ad Store
  const { advertisements } = usePublicityStore()

  const [openSearch, setOpenSearch] = useState(false)

  // Prioritize Demo Users
  const demoUsers = allUsers.filter((u) => u.isDemo)
  const otherDemoUsers = allUsers
    .filter((u) => u.id !== currentUser?.id && !u.isDemo)
    .slice(0, 4)

  const unreadCount = notifications.filter((n) => !n.read).length

  // Header Ad Logic
  const headerAds = useMemo(
    () => advertisements.filter((a) => a.active && a.placement === 'header'),
    [advertisements],
  )
  const visibleHeaderAds = useAdRotation(headerAds, 1, 10)
  const adToShow = visibleHeaderAds.length > 0 ? visibleHeaderAds[0] : null

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpenSearch((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSearchSelect = (type: string, id: string) => {
    setOpenSearch(false)
    switch (type) {
      case 'property':
        navigate(`/properties/${id}`)
        break
      case 'tenant':
        navigate(`/tenants/${id}`)
        break
      case 'owner':
        navigate(`/owners/${id}`)
        break
      case 'task':
        navigate(`/tasks`)
        break
      case 'help':
        navigate(`/help`)
        break
    }
  }

  const handleNotificationClick = (id: string) => {
    markNotificationAsRead(id)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="flex flex-col w-full sticky top-0 z-50 shadow-sm bg-white">
      {adToShow && (
        <div
          key={adToShow.id}
          className="bg-slate-900 text-white px-4 py-2 flex items-center justify-center text-xs sm:text-sm text-center relative overflow-hidden h-10 shrink-0 animate-in fade-in duration-500"
        >
          <a
            href={adToShow.linkUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:underline z-10 relative"
          >
            <span className="font-bold bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
              Sponsored
            </span>
            <span>{adToShow.title}</span>
            {adToShow.description && (
              <span className="hidden sm:inline text-slate-300">
                - {adToShow.description}
              </span>
            )}
          </a>
          {adToShow.imageUrl && (
            <img
              src={adToShow.imageUrl}
              alt=""
              crossOrigin="anonymous"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg'
                e.currentTarget.onerror = null
              }}
              className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
            />
          )}
        </div>
      )}

      <div className="flex h-16 items-center gap-4 border-b px-6 w-full justify-between shrink-0">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="-ml-2 text-black">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>

          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img
              src={logo}
              alt="COREPM Logo"
              className="h-8 w-8 rounded-md shrink-0 object-contain"
            />
            <h2 className="text-lg font-bold md:text-xl text-black font-display tracking-tight hidden sm:block">
              COREPM
            </h2>
          </Link>
        </div>

        {/* Global Search Button */}
        <div
          className="relative hidden md:flex flex-1 max-w-md mx-4"
          id="global-actions"
        >
          <Button
            variant="outline"
            className="relative w-full justify-start text-sm text-black border-slate-300 font-medium"
            onClick={() => setOpenSearch(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            {t('common.search')}...
            <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-slate-100 px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex text-black">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>

        <CommandDialog open={openSearch} onOpenChange={setOpenSearch}>
          <CommandInput placeholder="Type to search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="System">
              <CommandItem
                onSelect={() => handleSearchSelect('help', '')}
                className="text-black"
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                {t('common.help_hub')}
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading={t('properties.title')}>
              {properties.slice(0, 5).map((p) => (
                <CommandItem
                  key={p.id}
                  onSelect={() => handleSearchSelect('property', p.id)}
                >
                  <Building className="mr-2 h-4 w-4 text-black" />
                  <DataMask>{p.name}</DataMask>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading={t('common.tenants')}>
              {tenants.slice(0, 5).map((t) => (
                <CommandItem
                  key={t.id}
                  onSelect={() => handleSearchSelect('tenant', t.id)}
                >
                  <User className="mr-2 h-4 w-4 text-black" />
                  <DataMask>{t.name}</DataMask>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading={t('common.owners')}>
              {owners.slice(0, 5).map((o) => (
                <CommandItem
                  key={o.id}
                  onSelect={() => handleSearchSelect('owner', o.id)}
                >
                  <User className="mr-2 h-4 w-4 text-black" />
                  <DataMask>{o.name}</DataMask>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading={t('common.tasks')}>
              {tasks.slice(0, 5).map((task) => (
                <CommandItem
                  key={task.id}
                  onSelect={() => handleSearchSelect('task', task.id)}
                >
                  <CheckSquare className="mr-2 h-4 w-4 text-black" />
                  <DataMask>{task.title}</DataMask>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>

        <div className="flex items-center gap-2">
          {/* Search icon for mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-black"
            onClick={() => setOpenSearch(true)}
          >
            <Search className="h-5 w-5" />
          </Button>

          <ThemeCustomizer />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-black hover:bg-slate-100"
                onClick={() => navigate('/help')}
                title={t('common.help_hub')}
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('common.help_hub')}</p>
            </TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-5 w-5 text-black" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuItem
                onClick={() => setLanguage('pt')}
                className={language === 'pt' ? 'bg-slate-100 font-bold' : ''}
              >
                🇵🇹 Português
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLanguage('en')}
                className={language === 'en' ? 'bg-slate-100 font-bold' : ''}
              >
                🇺🇸 English
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLanguage('es')}
                className={language === 'es' ? 'bg-slate-100 font-bold' : ''}
              >
                🇪🇸 Español
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-black"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 animate-pulse ring-2 ring-white" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-white" align="end">
              <div className="flex items-center justify-between p-4 border-b">
                <h4 className="font-bold leading-none text-black">
                  {t('common.notifications')}
                </h4>
                <Badge
                  variant="secondary"
                  className="text-black bg-slate-100 font-bold"
                >
                  <DataMask>{unreadCount}</DataMask> {t('dashboard.unread')}
                </Badge>
              </div>
              <ScrollArea className="h-[300px]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-sm text-black font-medium">
                    Nenhuma notificação.
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((notif) => {
                      const notifDate = new Date(notif.timestamp)
                      const dateDisplay = isValid(notifDate)
                        ? format(notifDate, 'dd/MM HH:mm')
                        : ''

                      return (
                        <button
                          key={notif.id}
                          className={`flex flex-col items-start gap-1 p-4 text-left hover:bg-slate-50 transition-colors border-b last:border-0 ${!notif.read ? 'bg-blue-50' : ''}`}
                          onClick={() => handleNotificationClick(notif.id)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span
                              className={`text-sm text-black ${!notif.read ? 'font-bold' : 'font-medium'}`}
                            >
                              <DataMask>{notif.title}</DataMask>
                            </span>
                            {!notif.read && (
                              <Circle className="h-2 w-2 fill-blue-600 text-blue-600" />
                            )}
                          </div>
                          <span className="text-xs text-black font-medium line-clamp-2">
                            <DataMask>{notif.message}</DataMask>
                          </span>
                          <span className="text-[10px] text-black font-bold mt-1">
                            <DataMask>{dateDisplay}</DataMask>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
                id="user-profile"
              >
                <Avatar className="h-10 w-10 border border-slate-200">
                  <AvatarImage
                    src={currentUser?.avatar}
                    alt={currentUser?.name}
                  />
                  <AvatarFallback className="bg-slate-100 text-black font-bold">
                    {currentUser?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-white"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold leading-none text-black">
                    <DataMask>{currentUser?.name}</DataMask>
                  </p>
                  <p className="text-xs leading-none text-black font-medium">
                    <DataMask>{currentUser?.email}</DataMask>
                  </p>
                  <Badge
                    className="mt-2 w-fit bg-black hover:bg-black/90 text-white font-bold"
                    variant="secondary"
                  >
                    {t(`roles.${currentUser?.role}`)}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {demoUsers.length > 0 && (
                <>
                  <DropdownMenuLabel className="text-xs font-bold text-blue-700">
                    {t('header.demo_profiles')}
                  </DropdownMenuLabel>
                  {demoUsers.map((user) => (
                    <DropdownMenuItem
                      key={user.id}
                      onClick={() => setCurrentUser(user.id)}
                      className="cursor-pointer bg-blue-50 hover:bg-blue-100"
                    >
                      <div className="flex flex-col w-full">
                        <span className="font-bold text-black">
                          {user.name}
                        </span>
                        <span className="text-[10px] text-black font-medium capitalize">
                          {t(`roles.${user.role}`)}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </>
              )}

              <DropdownMenuLabel className="font-bold text-black">
                {t('header.other_users')}
              </DropdownMenuLabel>
              {otherDemoUsers.map((user) => (
                <DropdownMenuItem
                  key={user.id}
                  onClick={() => setCurrentUser(user.id)}
                  className="hover:bg-slate-50"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-black">{user.name}</span>
                    <span className="text-[10px] text-black font-medium">
                      {t(`roles.${user.role}`)}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="font-medium text-black hover:bg-slate-50"
              >
                {t('common.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
