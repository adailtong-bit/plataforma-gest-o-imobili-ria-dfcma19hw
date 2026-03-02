import { useContext } from 'react'
import { Bell, Search, Globe, Eye, EyeOff } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SidebarTrigger } from '@/components/ui/sidebar'
import useLanguageStore from '@/stores/useLanguageStore'
import { AppContext } from '@/stores/AppContext'
import { useNavigate } from 'react-router-dom'
import { Language } from '@/lib/translations'
import { Property, User } from '@/lib/types'
import { usePrivacyStore } from '@/stores/usePrivacyStore'
import { DataMask } from '@/components/DataMask'
import { getRoleLabel } from '@/lib/permissions'

export function AppHeader() {
  const { language, setLanguage, t } = useLanguageStore()
  const {
    properties,
    selectedPropertyId,
    setSelectedPropertyId,
    currentUser,
    allUsers,
    setCurrentUser,
    logout,
    notifications,
  } = useContext(AppContext)!
  const navigate = useNavigate()
  const { isPrivate, togglePrivacy } = usePrivacyStore()

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center gap-4 border-b bg-white px-6 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger className="shrink-0 md:hidden text-slate-700" />
        <div className="relative w-full max-w-sm hidden md:flex">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder={t('common.search') || 'Search properties...'}
            className="w-full rounded-md bg-slate-50 pl-9 border-slate-200 text-sm focus-visible:ring-trust-blue"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-auto">
        <div className="hidden sm:flex items-center gap-2 mr-2">
          <Select
            value={selectedPropertyId}
            onValueChange={setSelectedPropertyId}
          >
            <SelectTrigger className="w-[180px] h-9 bg-slate-50 border-slate-200">
              <SelectValue placeholder={t('common.all') || 'All Properties'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t('common.all') || 'All Properties'}
              </SelectItem>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-700 hover:bg-slate-100"
          title={t('analytics.privacy_mode')}
          onClick={togglePrivacy}
        >
          {isPrivate ? (
            <EyeOff className="h-5 w-5 text-blue-600" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-slate-700 hover:bg-slate-100"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>
              {t('common.notifications') || 'Notifications'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.slice(0, 5).map((n) => (
              <DropdownMenuItem
                key={n.id}
                className="flex flex-col items-start gap-1 p-3"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold">{n.title}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(n.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground line-clamp-2">
                  {n.message}
                </span>
              </DropdownMenuItem>
            ))}
            {notifications.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No new notifications
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-blue-600 font-medium cursor-pointer">
              View all
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-700 hover:bg-slate-100"
            >
              <Globe className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLanguage('en')}>
              English
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('es')}>
              Español
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('pt')}>
              Português
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full ml-2 border border-slate-200 p-0"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={currentUser?.avatar} alt="Avatar" />
                <AvatarFallback className="bg-slate-100 text-slate-700 font-bold">
                  {currentUser?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium">
                  <DataMask>{currentUser?.name}</DataMask>
                </p>
                <p className="w-[200px] truncate text-xs text-muted-foreground">
                  <DataMask>{currentUser?.email}</DataMask>
                </p>
                <Badge variant="secondary" className="w-fit mt-1 text-[10px]">
                  {currentUser?.role
                    ? getRoleLabel(currentUser.role, t)
                    : 'Unknown'}
                </Badge>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              {t('common.profile') || 'Profile'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              {t('sidebar.settings') || 'Settings'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-slate-500">
              {t('header.demo_profiles') || 'Demo Profiles'}
            </DropdownMenuLabel>
            {allUsers
              .filter((u) => u.id !== currentUser?.id)
              .slice(0, 5)
              .map((u) => (
                <DropdownMenuItem
                  key={u.id}
                  onClick={() => setCurrentUser(u.id)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={u.avatar} />
                    <AvatarFallback className="text-[10px]">
                      {u.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{u.name}</span>
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {u.role.replace('_', ' ')}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
              onClick={() => {
                logout()
                navigate('/login')
              }}
            >
              {t('common.logout') || 'Log out'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
