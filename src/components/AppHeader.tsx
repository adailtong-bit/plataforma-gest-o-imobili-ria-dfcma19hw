import { useState, useEffect, useContext } from 'react'
import {
  Bell,
  Search,
  Menu,
  Globe,
  Circle,
  Building,
  User,
  CheckSquare,
  Building2,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SidebarTrigger } from '@/components/ui/sidebar'
import useAuthStore from '@/stores/useAuthStore'
import useLanguageStore from '@/stores/useLanguageStore'
import useNotificationStore from '@/stores/useNotificationStore'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'
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
import { AppContext } from '@/stores/AppContext'

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

  // Property Context for Multi-Property Management
  const context = useContext(AppContext)
  const selectedPropertyId = context?.selectedPropertyId || 'all'
  const setSelectedPropertyId = context?.setSelectedPropertyId

  const [openSearch, setOpenSearch] = useState(false)

  // Prioritize Demo Users
  const demoUsers = allUsers.filter((u) => u.isDemo)
  const otherDemoUsers = allUsers
    .filter((u) => u.id !== currentUser?.id && !u.isDemo)
    .slice(0, 4)

  const unreadCount = notifications.filter((n) => !n.read).length

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
    }
  }

  const handleNotificationClick = (id: string) => {
    markNotificationAsRead(id)
    // Optional: navigate to specific detail if notification payload supported it
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-6 sticky top-0 z-50 shadow-sm w-full">
      <SidebarTrigger className="-ml-2">
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
        <h2 className="text-lg font-bold md:text-xl text-brand font-display tracking-tight hidden sm:block">
          COREPM
        </h2>
      </Link>

      {/* Property Selector for Multi-Property Management */}
      {setSelectedPropertyId && (
        <div className="flex items-center gap-2 ml-4">
          <Building2 className="w-4 h-4 text-muted-foreground hidden md:block" />
          <Select
            value={selectedPropertyId}
            onValueChange={setSelectedPropertyId}
          >
            <SelectTrigger className="w-[180px] md:w-[240px] border-none shadow-none focus:ring-0 bg-transparent hover:bg-muted/50 transition-colors h-9">
              <SelectValue placeholder="Select Property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Global Search Button */}
      <div className="relative ml-auto flex-1 md:grow-0">
        <Button
          variant="outline"
          className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-64 lg:w-80"
          onClick={() => setOpenSearch(true)}
        >
          <Search className="mr-2 h-4 w-4" />
          {t('common.search')}...
          <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>

      <CommandDialog open={openSearch} onOpenChange={setOpenSearch}>
        <CommandInput placeholder="Type to search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading={t('properties.title')}>
            {properties.slice(0, 5).map((p) => (
              <CommandItem
                key={p.id}
                onSelect={() => handleSearchSelect('property', p.id)}
              >
                <Building className="mr-2 h-4 w-4" />
                {p.name}
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
                <User className="mr-2 h-4 w-4" />
                {t.name}
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
                <User className="mr-2 h-4 w-4" />
                {o.name}
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
                <CheckSquare className="mr-2 h-4 w-4" />
                {task.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <div className="flex items-center gap-2">
        <ThemeCustomizer />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Globe className="h-5 w-5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setLanguage('pt')}
              className={language === 'pt' ? 'bg-accent' : ''}
            >
              🇵🇹 Português
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setLanguage('en')}
              className={language === 'en' ? 'bg-accent' : ''}
            >
              🇺🇸 English
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setLanguage('es')}
              className={language === 'es' ? 'bg-accent' : ''}
            >
              🇪🇸 Español
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 animate-pulse ring-2 ring-background" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between p-4 border-b">
              <h4 className="font-semibold leading-none">
                {t('common.notifications')}
              </h4>
              <Badge variant="secondary">
                {unreadCount} {t('dashboard.unread')}
              </Badge>
            </div>
            <ScrollArea className="h-[300px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Nenhuma notificação.
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((notif) => (
                    <button
                      key={notif.id}
                      className={`flex flex-col items-start gap-1 p-4 text-left hover:bg-muted/50 transition-colors border-b last:border-0 ${!notif.read ? 'bg-blue-50/50' : ''}`}
                      onClick={() => handleNotificationClick(notif.id)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={`text-sm ${!notif.read ? 'font-semibold' : 'font-medium'}`}
                        >
                          {notif.title}
                        </span>
                        {!notif.read && (
                          <Circle className="h-2 w-2 fill-blue-500 text-blue-500" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {notif.message}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-1">
                        {format(new Date(notif.timestamp), 'dd/MM HH:mm')}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10 border border-muted/20">
                <AvatarImage
                  src={currentUser?.avatar}
                  alt={currentUser?.name}
                />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  {currentUser?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {currentUser?.name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {currentUser?.email}
                </p>
                <Badge
                  className="mt-2 w-fit bg-navy hover:bg-navy/90 text-white"
                  variant="secondary"
                >
                  {t(`roles.${currentUser?.role}`)}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {demoUsers.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs font-semibold text-blue-600">
                  {t('header.demo_profiles')}
                </DropdownMenuLabel>
                {demoUsers.map((user) => (
                  <DropdownMenuItem
                    key={user.id}
                    onClick={() => setCurrentUser(user.id)}
                    className="cursor-pointer bg-blue-50/50 hover:bg-blue-50"
                  >
                    <div className="flex flex-col w-full">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-[10px] text-muted-foreground capitalize">
                        {t(`roles.${user.role}`)}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuLabel>{t('header.other_users')}</DropdownMenuLabel>
            {otherDemoUsers.map((user) => (
              <DropdownMenuItem
                key={user.id}
                onClick={() => setCurrentUser(user.id)}
              >
                <div className="flex flex-col">
                  <span>{user.name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {t(`roles.${user.role}`)}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              {t('common.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
