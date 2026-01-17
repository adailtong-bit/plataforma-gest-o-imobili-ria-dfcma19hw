import { Bell, Search, Menu, Globe } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'

export function AppHeader() {
  const { toggleSidebar } = useSidebar()
  const { currentUser, setCurrentUser, allUsers } = useAuthStore()
  const { language, setLanguage, t } = useLanguageStore()

  // Simplified test user switch logic for demo purposes
  // In a real app, this would be handled by auth provider/session
  const demoUsers = allUsers.filter((u) => u.id !== currentUser?.id).slice(0, 8)

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
      <Button variant="ghost" size="icon" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold md:text-xl text-navy">Skip</h2>
        <Badge variant="outline" className="text-xs">
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

      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
              <AvatarFallback>{currentUser?.name?.charAt(0)}</AvatarFallback>
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
              <Badge className="mt-2 w-fit" variant="secondary">
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
