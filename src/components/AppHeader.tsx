import { Button } from '@/components/ui/button'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { Bell, Search, Globe, HelpCircle, ShieldAlert } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import useLanguageStore from '@/stores/useLanguageStore'
import useAuthStore from '@/stores/useAuthStore'
import { supabase } from '@/lib/supabase/client'
import usePropertyStore from '@/stores/usePropertyStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import usePrivacyStore from '@/stores/usePrivacyStore'

export function AppHeader() {
  const { language, setLanguage, t } = useLanguageStore()

  const handleLanguageChange = async (newLang: string) => {
    setLanguage(newLang)
    if (currentUser?.id) {
      await supabase
        .from('profiles')
        .update({ language_preference: newLang })
        .eq('id', currentUser.id)
    }
  }
  const {
    currentUser,
    allUsers,
    setCurrentUser,
    logout,
    simulationMode,
    simulationRole,
  } = useAuthStore()
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const { selectedPropertyId, setSelectedPropertyId, properties } =
    usePropertyStore()
  const { isPrivate, togglePrivacy } = usePrivacyStore()

  const effectiveRole =
    simulationMode && simulationRole ? simulationRole : currentUser?.role

  const handleDemoUserChange = (userId: string) => {
    setCurrentUser(userId)
    navigate('/')
  }

  const accessibleProperties = properties.filter((p) => {
    if (effectiveRole === 'property_owner') {
      if (simulationMode) return true
      return p.ownerId === currentUser?.id
    }
    return true
  })

  const demoUsers = allUsers.filter((u) => u.isDemo)
  const regularUsers = allUsers.filter(
    (u) => !u.isDemo && u.id !== currentUser?.id,
  )

  const isPortalUser = [
    'tenant',
    'property_owner',
    'partner',
    'partner_employee',
  ].includes(effectiveRole || '')

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6 shadow-sm shrink-0">
      <SidebarTrigger className="text-slate-600 hover:text-slate-900" />

      {!isMobile && !isPortalUser && (
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder={t('common.search') || 'Pesquisar...'}
              className="w-full bg-slate-50 border-slate-200 pl-9 focus-visible:ring-trust-blue"
            />
          </div>
        </div>
      )}

      {isMobile && <div className="flex-1" />}

      <div className="flex items-center gap-3 ml-auto shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePrivacy}
          className={
            isPrivate ? 'text-trust-blue bg-blue-50' : 'text-slate-500'
          }
          title={t('common.analytics.privacy_mode')}
        >
          <ShieldAlert className="h-4 w-4" />
        </Button>

        {!isPortalUser && (
          <div className="hidden md:block w-[200px]">
            <Select
              value={selectedPropertyId}
              onValueChange={setSelectedPropertyId}
            >
              <SelectTrigger className="h-9 bg-slate-50 border-slate-200 text-sm">
                <SelectValue
                  placeholder={t('common.all_properties', 'All Properties')}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t('common.all_properties', 'All Properties')}
                </SelectItem>
                {accessibleProperties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-600 hover:bg-slate-100"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-600 hover:bg-slate-100 uppercase font-bold text-xs"
            >
              <Globe className="h-4 w-4 mr-1" />
              {language}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32 bg-white">
            <DropdownMenuItem
              onClick={() => handleLanguageChange('en')}
              className={language === 'en' ? 'bg-slate-50 font-bold' : ''}
            >
              English
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleLanguageChange('pt')}
              className={language === 'pt' ? 'bg-slate-50 font-bold' : ''}
            >
              Português
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleLanguageChange('es')}
              className={language === 'es' ? 'bg-slate-50 font-bold' : ''}
            >
              Español
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          className="text-slate-600 hover:bg-slate-100 hidden sm:flex"
          onClick={() => navigate('/help')}
        >
          <HelpCircle className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full ml-2 ring-2 ring-transparent hover:ring-slate-200 transition-all"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={currentUser?.avatar}
                  alt={currentUser?.name || 'User'}
                />
                <AvatarFallback className="bg-trust-blue text-white text-xs">
                  {currentUser?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-white p-2">
            <DropdownMenuLabel className="font-normal border-b pb-2 mb-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold leading-none text-slate-900">
                  {currentUser?.name || t('common.visitor', 'Visitor')}
                </p>
                <p className="text-xs leading-none text-slate-500 font-medium">
                  {currentUser
                    ? t(`roles.${currentUser.role}`) || currentUser.role
                    : ''}
                </p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuLabel className="text-xs text-slate-500 uppercase font-bold tracking-wider">
              {t('header.demo_profiles')}
            </DropdownMenuLabel>
            <div className="max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
              {demoUsers.map((u) => (
                <DropdownMenuItem
                  key={`demo-${u.id}`}
                  onClick={() => handleDemoUserChange(u.id)}
                  className={`flex items-center gap-2 cursor-pointer rounded-md ${currentUser?.id === u.id ? 'bg-blue-50 text-trust-blue' : ''}`}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={u.avatar} />
                    <AvatarFallback className="text-[10px]">
                      {u.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{u.name}</span>
                    <span className="text-[10px] text-slate-500">
                      {t(`roles.${u.role}`) || u.role}
                    </span>
                  </div>
                  {u.isDemo && (
                    <Badge
                      variant="outline"
                      className="ml-auto text-[8px] h-4 px-1"
                    >
                      DEMO
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </div>

            {regularUsers.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                  {t('header.other_users')}
                </DropdownMenuLabel>
                <div className="max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                  {regularUsers.map((u) => (
                    <DropdownMenuItem
                      key={`regular-${u.id}`}
                      onClick={() => handleDemoUserChange(u.id)}
                      className="flex items-center gap-2 cursor-pointer rounded-md"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={u.avatar} />
                        <AvatarFallback className="text-[10px]">
                          {u.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{u.name}</span>
                        <span className="text-[10px] text-slate-500">
                          {t(`roles.${u.role}`) || u.role}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="text-red-600 focus:bg-red-50 focus:text-red-700 font-medium cursor-pointer"
            >
              {t('common.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
