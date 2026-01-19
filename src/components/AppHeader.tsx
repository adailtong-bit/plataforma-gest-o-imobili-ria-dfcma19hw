import { Bell, Search, Menu, Globe, LayoutTemplate, Circle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSidebar } from '@/components/ui/sidebar'
import useAuthStore from '@/stores/useAuthStore'
import useLanguageStore from '@/stores/useLanguageStore'
import useNotificationStore from '@/stores/useNotificationStore'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'

export function AppHeader() {
  const { toggleSidebar } = useSidebar()
  const { currentUser, setCurrentUser, allUsers } = useAuthStore()
  const { language, setLanguage, t } = useLanguageStore()
  const { notifications, markNotificationAsRead } = useNotificationStore()

  // Simplified test user switch logic for demo purposes
  const demoUsers = allUsers.filter((u) => u.id !== currentUser?.id).slice(0, 8)

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
      <Button variant="ghost" size="icon" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex items-center gap-2">
        {/* Branding: Tiffany Blue #0ABAB5 with Gold #FFD700 icon */}
        <div className="bg-tiffany text-white p-1.5 rounded-md shrink-0 flex items-center justify-center shadow-sm">
          <LayoutTemplate className="h-5 w-5 text-gold stroke-[2]" />
        </div>
        <h2 className="text-lg font-bold md:text-xl text-navy tracking-tight">
          COREPM
        </h2>
        <Badge
          variant="outline"
          className="text-xs hidden md:inline-flex border-tiffany text-tiffany bg-tiffany/5"
        >
          Gestão
        </Badge>
      </div>
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t('common.search')}
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
        />
      </div>

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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 animate-pulse" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end">
          <DropdownMenuLabel>
            {t('common.notifications')} ({unreadCount})
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <ScrollArea className="h-[300px]">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Nenhuma notificação.
              </div>
            ) : (
              notifications.map((notif) => (
                <DropdownMenuItem
                  key={notif.id}
                  className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                  onClick={() => markNotificationAsRead(notif.id)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-sm">{notif.title}</span>
                    {!notif.read && (
                      <Circle className="h-2 w-2 fill-blue-500 text-blue-500" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {notif.message}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {format(new Date(notif.timestamp), 'dd/MM/yyyy HH:mm')}
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border border-tiffany/20">
              <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
              <AvatarFallback className="bg-tiffany/10 text-tiffany">
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
          <DropdownMenuLabel>Alternar Usuário (Demo)</DropdownMenuLabel>
          {demoUsers.map((user) => (
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
          <DropdownMenuItem>{t('common.logout')}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
